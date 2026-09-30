import { Alert, ThresholdConfig, AuditEntry, ProcessingDecision } from '../types/alert';
import { validateAlert } from './validation';

export interface ProcessorOutput {
  processedAlerts: Alert[]; // Primary retained + consolidated alerts visible in feed
  allAlertsWithDecisions: Alert[]; // Full list with decisions attached for auditing
  auditLogs: AuditEntry[];
  isRawMode: boolean;
  isFallbackTriggered: boolean;
  fallbackReason?: string;
  processingTimeMs: number;
}

export function processAlerts(
  rawAlerts: Alert[],
  config: ThresholdConfig,
  isForceRawModeActive: boolean = false
): ProcessorOutput {
  const startTime = performance.now();
  const auditLogs: AuditEntry[] = [];
  const processedAlerts: Alert[] = [];
  const allAlertsWithDecisions: Alert[] = [];

  let isFallbackTriggered = false;
  let fallbackReason: string | undefined = undefined;

  // -------------------------------------------------------------
  // STEP 1: SAFETY GATE - Capacity Check
  // -------------------------------------------------------------
  if (rawAlerts.length > config.maxAlertsPerBatch) {
    isFallbackTriggered = true;
    fallbackReason = `Capacity limit exceeded: ${rawAlerts.length} alerts received (Max batch limit: ${config.maxAlertsPerBatch}).`;
  }

  // -------------------------------------------------------------
  // STEP 2: SAFETY GATE - Malformed Data Check
  // -------------------------------------------------------------
  if (!isFallbackTriggered) {
    for (const alert of rawAlerts) {
      const validation = validateAlert(alert);
      if (!validation.isValid) {
        isFallbackTriggered = true;
        fallbackReason = `Malformed alert payload detected (${alert.id || 'Unknown ID'}): ${validation.reason}`;
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 3: FAIL SAFE FALLBACK OR FORCE RAW MODE
  // -------------------------------------------------------------
  const isRawMode = isForceRawModeActive || isFallbackTriggered;

  if (isRawMode) {
    const rawModeReason = isFallbackTriggered
      ? `FAIL SAFE ACTIVATED: ${fallbackReason}`
      : 'FORCE BYPASS ACTIVATED: Manual raw mode selected by clinician.';

    const fallbackTime = new Date().toISOString();

    const outputAlerts = rawAlerts.map(alert => {
      const decision: ProcessingDecision = {
        decision: 'RAW_BYPASS',
        reason: rawModeReason,
        ruleTriggered: isFallbackTriggered ? 'FAIL_SAFE_FALLBACK' : 'FORCE_RAW_MODE',
        timestamp: fallbackTime,
      };

      const copy: Alert = {
        ...alert,
        processingDecision: decision,
        isRawBypass: true,
        isSuppressed: false,
        isConsolidated: false,
        duplicateCount: 0,
      };

      auditLogs.push({
        id: `AUDIT-${alert.id}-${Date.now()}`,
        timestamp: fallbackTime,
        alertId: alert.id,
        patientId: alert.patientId,
        category: alert.category,
        priority: alert.priority,
        decision: 'RAW_BYPASS',
        reason: rawModeReason,
        ruleTriggered: decision.ruleTriggered,
        duplicatesConsolidated: 0,
        safetyOverride: true,
        fallbackActive: true,
      });

      return copy;
    });

    const endTime = performance.now();

    return {
      processedAlerts: outputAlerts,
      allAlertsWithDecisions: outputAlerts,
      auditLogs,
      isRawMode: true,
      isFallbackTriggered,
      fallbackReason,
      processingTimeMs: Math.round(endTime - startTime),
    };
  }

  // -------------------------------------------------------------
  // STEP 4: NORMAL DEDUPLICATION & SAFETY RULES ENGINE
  // -------------------------------------------------------------
  // Sort alerts chronologically
  const sortedAlerts = [...rawAlerts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Map to store primary consolidated alerts by patient & signal signature
  // Map Key: `${patientId}_${category}_${signalKey}`
  const primaryAlertMap = new Map<string, Alert>();

  for (const alert of sortedAlerts) {
    const nowIso = new Date().toISOString();

    // RULE 1: CRITICAL ALERT NON-SUPPRESSION
    if (alert.priority === 'CRITICAL') {
      const decision: ProcessingDecision = {
        decision: 'RETAIN',
        reason: 'CRITICAL priority alert — zero suppression permitted by ED Safety Rule 1.',
        ruleTriggered: 'RULE_1_CRITICAL_NON_SUPPRESSION',
        timestamp: nowIso,
      };

      const retainedAlert: Alert = {
        ...alert,
        processingDecision: decision,
        isSuppressed: false,
        isConsolidated: false,
        duplicateCount: alert.duplicateCount || 0,
      };

      processedAlerts.push(retainedAlert);
      allAlertsWithDecisions.push(retainedAlert);

      auditLogs.push({
        id: `AUDIT-${alert.id}-${Date.now()}`,
        timestamp: nowIso,
        alertId: alert.id,
        patientId: alert.patientId,
        category: alert.category,
        priority: alert.priority,
        decision: 'RETAIN',
        reason: decision.reason,
        ruleTriggered: decision.ruleTriggered,
        duplicatesConsolidated: 0,
        safetyOverride: true,
        fallbackActive: false,
      });

      continue;
    }

    // RULE 2: INCOMPLETE HISTORY BYPASS (< 30%)
    if (alert.historyCompleteness < config.minHistoryCompleteness) {
      const decision: ProcessingDecision = {
        decision: 'RAW_BYPASS',
        reason: `Incomplete patient history (${alert.historyCompleteness}% < ${config.minHistoryCompleteness}% threshold) — filtering bypassed for clinical safety.`,
        ruleTriggered: 'RULE_2_INCOMPLETE_HISTORY_BYPASS',
        timestamp: nowIso,
      };

      const retainedAlert: Alert = {
        ...alert,
        processingDecision: decision,
        isSuppressed: false,
        isConsolidated: false,
        isRawBypass: true,
        duplicateCount: 0,
      };

      processedAlerts.push(retainedAlert);
      allAlertsWithDecisions.push(retainedAlert);

      auditLogs.push({
        id: `AUDIT-${alert.id}-${Date.now()}`,
        timestamp: nowIso,
        alertId: alert.id,
        patientId: alert.patientId,
        category: alert.category,
        priority: alert.priority,
        decision: 'RAW_BYPASS',
        reason: decision.reason,
        ruleTriggered: decision.ruleTriggered,
        duplicatesConsolidated: 0,
        safetyOverride: true,
        fallbackActive: false,
      });

      continue;
    }

    // RULE 3: SLIDING WINDOW DEDUPLICATION
    const windowMinutes = config.windowMinutes[alert.category] || 2;
    const alertTimeMs = new Date(alert.timestamp).getTime();

    // Key to group alerts: patientId + category + normalized message prefix
    const signalKey = alert.message.split(':')[0].trim().toLowerCase();
    const groupKey = `${alert.patientId}_${alert.category}_${signalKey}`;

    const existingPrimary = primaryAlertMap.get(groupKey);

    let isDuplicate = false;

    if (existingPrimary) {
      const primaryTimeMs = new Date(existingPrimary.timestamp).getTime();
      const diffMinutes = Math.abs(alertTimeMs - primaryTimeMs) / (1000 * 60);

      if (diffMinutes <= windowMinutes) {
        isDuplicate = true;

        // Consolidate into existing primary
        existingPrimary.duplicateCount = (existingPrimary.duplicateCount || 0) + 1;
        existingPrimary.isConsolidated = true;
        existingPrimary.relatedAlertIds = [
          ...(existingPrimary.relatedAlertIds || []),
          alert.id,
        ];

        // Merge evidence if present
        if (alert.evidence && alert.evidence.length > 0) {
          existingPrimary.evidence = [
            ...(existingPrimary.evidence || []),
            ...alert.evidence,
          ];
        }

        const decision: ProcessingDecision = {
          decision: 'CONSOLIDATE',
          reason: `Consolidated into primary alert ${existingPrimary.id} within ${windowMinutes}-min sliding window.`,
          ruleTriggered: 'RULE_3_SLIDING_WINDOW_DEDUPLICATION',
          timestamp: nowIso,
        };

        const consolidatedAlert: Alert = {
          ...alert,
          processingDecision: decision,
          isSuppressed: true,
          isConsolidated: true,
        };

        allAlertsWithDecisions.push(consolidatedAlert);

        auditLogs.push({
          id: `AUDIT-${alert.id}-${Date.now()}`,
          timestamp: nowIso,
          alertId: alert.id,
          patientId: alert.patientId,
          category: alert.category,
          priority: alert.priority,
          decision: 'CONSOLIDATE',
          reason: decision.reason,
          ruleTriggered: decision.ruleTriggered,
          duplicatesConsolidated: 1,
          safetyOverride: false,
          fallbackActive: false,
        });
      }
    }

    if (!isDuplicate) {
      // Check Rule 4: Non-actionable Low Priority Suppression
      if (alert.priority === 'LOW' && alert.actionability === 'NONE') {
        const decision: ProcessingDecision = {
          decision: 'SUPPRESS',
          reason: 'Low priority non-actionable workflow noise suppressed.',
          ruleTriggered: 'RULE_4_NON_ACTIONABLE_SUPPRESSION',
          timestamp: nowIso,
        };

        const suppressedAlert: Alert = {
          ...alert,
          processingDecision: decision,
          isSuppressed: true,
        };

        allAlertsWithDecisions.push(suppressedAlert);

        auditLogs.push({
          id: `AUDIT-${alert.id}-${Date.now()}`,
          timestamp: nowIso,
          alertId: alert.id,
          patientId: alert.patientId,
          category: alert.category,
          priority: alert.priority,
          decision: 'SUPPRESS',
          reason: decision.reason,
          ruleTriggered: decision.ruleTriggered,
          duplicatesConsolidated: 0,
          safetyOverride: false,
          fallbackActive: false,
        });

        continue;
      }

      // Default: Retain as Primary Alert
      const decision: ProcessingDecision = {
        decision: 'RETAIN',
        reason: 'Primary alert retained for clinician evaluation.',
        ruleTriggered: 'RULE_DEFAULT_RETAIN',
        timestamp: nowIso,
      };

      const primaryAlert: Alert = {
        ...alert,
        processingDecision: decision,
        isSuppressed: false,
        isConsolidated: false,
        duplicateCount: 0,
        relatedAlertIds: alert.relatedAlertIds || [],
      };

      primaryAlertMap.set(groupKey, primaryAlert);
      processedAlerts.push(primaryAlert);
      allAlertsWithDecisions.push(primaryAlert);

      auditLogs.push({
        id: `AUDIT-${alert.id}-${Date.now()}`,
        timestamp: nowIso,
        alertId: alert.id,
        patientId: alert.patientId,
        category: alert.category,
        priority: alert.priority,
        decision: 'RETAIN',
        reason: decision.reason,
        ruleTriggered: decision.ruleTriggered,
        duplicatesConsolidated: 0,
        safetyOverride: false,
        fallbackActive: false,
      });
    }
  }

  const endTime = performance.now();

  return {
    processedAlerts,
    allAlertsWithDecisions,
    auditLogs,
    isRawMode: false,
    isFallbackTriggered: false,
    processingTimeMs: Math.round(endTime - startTime),
  };
}

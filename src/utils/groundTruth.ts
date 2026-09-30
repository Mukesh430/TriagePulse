import { Alert, GroundTruthEvaluation } from '../types/alert';

export function evaluateGroundTruth(alert: Alert): GroundTruthEvaluation {
  // Determine expected ideal decision from synthetic ground truth attributes
  let expected: 'RETAIN' | 'CONSOLIDATE' | 'SUPPRESS' = 'RETAIN';

  const isMustRetain = 
    alert.priority === 'CRITICAL' || 
    alert.historyCompleteness < 30 || 
    (alert.groundTruthActionable && !alert.groundTruthDuplicate);

  if (isMustRetain) {
    expected = 'RETAIN';
  } else if (alert.groundTruthDuplicate) {
    expected = 'CONSOLIDATE';
  } else if (alert.actionability === 'NONE' || alert.priority === 'LOW') {
    expected = 'SUPPRESS';
  } else {
    expected = 'RETAIN';
  }

  // Determine actual decision category
  let actual: 'RETAIN' | 'CONSOLIDATE' | 'SUPPRESS' = 'RETAIN';
  if (alert.isSuppressed) {
    actual = 'SUPPRESS';
  } else if (alert.isConsolidated && alert.duplicateCount && alert.duplicateCount > 0) {
    actual = 'CONSOLIDATE';
  } else {
    actual = 'RETAIN';
  }

  const isError = expected !== actual;
  let errorType: 'FP' | 'FN' | 'NONE' = 'NONE';
  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let reason = 'Decision matches ground truth expectation.';

  if (isError) {
    if (expected === 'RETAIN' && (actual === 'SUPPRESS' || actual === 'CONSOLIDATE')) {
      errorType = 'FN';
      if (alert.priority === 'CRITICAL' || alert.groundTruthCritical) {
        severity = 'CRITICAL';
        reason = 'SAFETY VIOLATION: Critical alert was suppressed or hidden in consolidation!';
      } else if (alert.historyCompleteness < 30) {
        severity = 'HIGH';
        reason = 'SAFETY VIOLATION: Incomplete history patient alert was suppressed!';
      } else {
        severity = 'MEDIUM';
        reason = 'Actionable alert was inappropriately suppressed or grouped.';
      }
    } else if ((expected === 'SUPPRESS' || expected === 'CONSOLIDATE') && actual === 'RETAIN') {
      errorType = 'FP';
      severity = 'LOW';
      reason = 'Non-actionable or duplicate alert was retained, contributing to alert fatigue.';
    }
  }

  return {
    alertId: alert.id,
    expected,
    actual,
    isError,
    errorType,
    severity,
    reason,
  };
}

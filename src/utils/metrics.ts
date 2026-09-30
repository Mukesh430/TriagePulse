import { Alert, SystemMetrics, GroundTruthEvaluation } from '../types/alert';
import { evaluateGroundTruth } from './groundTruth';

export function calculateMetrics(
  rawAlerts: Alert[],
  allAlertsWithDecisions: Alert[],
  processedAlerts: Alert[],
  processingTimeMs: number
): { metrics: SystemMetrics; evaluations: GroundTruthEvaluation[] } {
  const totalRawAlerts = rawAlerts.length;
  const totalFilteredAlerts = processedAlerts.length;

  // Duplicates consolidated
  let duplicatesConsolidated = 0;
  for (const alert of processedAlerts) {
    if (alert.duplicateCount) {
      duplicatesConsolidated += alert.duplicateCount;
    }
  }

  // Non-actionable reduced
  const rawNonActionableCount = rawAlerts.filter(a => a.actionability === 'NONE' || a.groundTruthDuplicate).length;
  const filteredNonActionableCount = processedAlerts.filter(a => a.actionability === 'NONE' || a.groundTruthDuplicate).length;
  const nonActionableReduced = Math.max(0, rawNonActionableCount - filteredNonActionableCount);

  // Critical alerts metrics
  const criticalAlerts = rawAlerts.filter(a => a.priority === 'CRITICAL').length;
  const criticalAlertsRetained = processedAlerts.filter(a => a.priority === 'CRITICAL').length;
  const criticalSensitivity = criticalAlerts > 0 
    ? Math.round((criticalAlertsRetained / criticalAlerts) * 1000) / 10 
    : 100;

  // High priority retention
  const rawHighCount = rawAlerts.filter(a => a.priority === 'HIGH').length;
  const retainedHighCount = processedAlerts.filter(a => a.priority === 'HIGH').length;
  const highPriorityRetention = rawHighCount > 0 
    ? Math.round((retainedHighCount / rawHighCount) * 1000) / 10 
    : 100;

  // Noise reduction %
  const noiseReduction = totalRawAlerts > 0 
    ? Math.round(((totalRawAlerts - totalFilteredAlerts) / totalRawAlerts) * 1000) / 10 
    : 0;

  // Ground truth evaluation & FP/FN analysis
  const evaluations: GroundTruthEvaluation[] = allAlertsWithDecisions.map(alert => evaluateGroundTruth(alert));

  const falsePositives = evaluations.filter(e => e.errorType === 'FP').length;
  const falseNegatives = evaluations.filter(e => e.errorType === 'FN').length;

  // Clinician response timing & override rate
  const overriddenCount = rawAlerts.filter(a => a.override !== undefined || a.clinicianResponse === 'OVERRIDDEN').length;
  const overrideRate = totalRawAlerts > 0 ? Math.round((overriddenCount / totalRawAlerts) * 1000) / 10 : 0;

  const responseDelays = rawAlerts
    .map(a => a.responseDelaySeconds)
    .filter((d): d is number => d !== undefined);

  const averageResponseTime = responseDelays.length > 0 
    ? Math.round((responseDelays.reduce((acc, curr) => acc + curr, 0) / responseDelays.length) * 10) / 10 
    : 35.5;

  // Target Check:
  // Target requires: criticalSensitivity === 100 AND noiseReduction >= 30% AND zero CRITICAL false negatives.
  const criticalFNs = evaluations.filter(e => e.errorType === 'FN' && e.severity === 'CRITICAL').length;

  let targetAchieved = true;
  let targetFailureReason: string | undefined = undefined;

  if (criticalSensitivity < 100) {
    targetAchieved = false;
    targetFailureReason = `CRITICAL sensitivity dropped to ${criticalSensitivity}% (Must be 100%).`;
  } else if (criticalFNs > 0) {
    targetAchieved = false;
    targetFailureReason = `Detected ${criticalFNs} severe critical false negative suppressions.`;
  } else if (noiseReduction < 30) {
    targetAchieved = false;
    targetFailureReason = `Noise reduction ${noiseReduction}% is below target threshold of 30%.`;
  }

  const metrics: SystemMetrics = {
    totalRawAlerts,
    totalFilteredAlerts,
    duplicatesConsolidated,
    nonActionableReduced,
    criticalAlerts,
    criticalAlertsRetained,
    criticalSensitivity,
    highPriorityRetention,
    noiseReduction,
    falsePositives,
    falseNegatives,
    overrideRate,
    averageProcessingTime: processingTimeMs,
    averageResponseTime,
    targetAchieved,
    targetFailureReason,
  };

  return { metrics, evaluations };
}

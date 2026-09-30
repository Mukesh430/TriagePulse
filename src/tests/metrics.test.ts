import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../utils/metrics';
import { processAlerts } from '../utils/alertProcessor';
import { INITIAL_ALERTS, DEFAULT_THRESHOLDS } from '../data/simulatedData';

describe('Metrics & Evaluation Pipeline', () => {
  it('Calculates system metrics dynamically from initial simulated dataset', () => {
    const processorOutput = processAlerts(INITIAL_ALERTS, DEFAULT_THRESHOLDS, false);
    const { metrics } = calculateMetrics(
      INITIAL_ALERTS,
      processorOutput.allAlertsWithDecisions,
      processorOutput.processedAlerts,
      processorOutput.processingTimeMs
    );

    expect(metrics.totalRawAlerts).toBe(INITIAL_ALERTS.length);
    expect(metrics.totalFilteredAlerts).toBeLessThan(metrics.totalRawAlerts);
    expect(metrics.criticalSensitivity).toBe(100); // 100% Critical Sensitivity!
    expect(metrics.noiseReduction).toBeGreaterThanOrEqual(30); // >= 30% Noise Reduction!
    expect(metrics.targetAchieved).toBe(true);
  });

  it('Detects false positives and false negatives correctly', () => {
    const processorOutput = processAlerts(INITIAL_ALERTS, DEFAULT_THRESHOLDS, false);
    const { evaluations } = calculateMetrics(
      INITIAL_ALERTS,
      processorOutput.allAlertsWithDecisions,
      processorOutput.processedAlerts,
      processorOutput.processingTimeMs
    );

    expect(evaluations).toHaveLength(INITIAL_ALERTS.length);
    const criticalFNs = evaluations.filter(e => e.errorType === 'FN' && e.severity === 'CRITICAL');
    expect(criticalFNs).toHaveLength(0); // Zero CRITICAL false negatives!
  });
});

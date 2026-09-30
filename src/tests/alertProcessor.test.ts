import { describe, it, expect } from 'vitest';
import { processAlerts } from '../utils/alertProcessor';
import { DEFAULT_THRESHOLDS } from '../data/simulatedData';
import { Alert } from '../types/alert';

describe('AlertProcessor Fallback & Capacity Limits', () => {
  it('Triggers Fail-Safe Fallback on batch capacity overflow', () => {
    // Generate 120 synthetic alerts exceeding maxAlertsPerBatch (100)
    const floodAlerts: Alert[] = Array.from({ length: 120 }).map((_, idx) => ({
      id: `FLOOD-${idx}`,
      patientId: `PAT-${idx % 5}`,
      timestamp: new Date().toISOString(),
      category: 'VITAL_SIGN',
      priority: 'HIGH',
      message: `Flood message ${idx}`,
      source: 'Monitor',
      patientStatus: 'STABLE',
      historyCompleteness: 80,
      actionability: 'HIGH',
      evidence: [],
      relatedAlertIds: [],
      groundTruthActionable: true,
      groundTruthCritical: false,
      groundTruthDuplicate: false,
    }));

    const output = processAlerts(floodAlerts, DEFAULT_THRESHOLDS, false);

    expect(output.isFallbackTriggered).toBe(true);
    expect(output.isRawMode).toBe(true);
    expect(output.fallbackReason).toContain('Capacity limit exceeded');
    expect(output.processedAlerts).toHaveLength(120);
  });

  it('Triggers Fail-Safe Fallback on malformed alert payload', () => {
    const malformedAlert = {
      id: 'MALFORMED-1',
      patientId: '', // Invalid empty patientId
      timestamp: new Date().toISOString(),
      category: 'VITAL_SIGN',
      priority: 'HIGH',
      message: 'Bad payload',
    } as unknown as Alert;

    const output = processAlerts([malformedAlert], DEFAULT_THRESHOLDS, false);

    expect(output.isFallbackTriggered).toBe(true);
    expect(output.isRawMode).toBe(true);
    expect(output.fallbackReason).toContain('Malformed alert payload');
  });

  it('Preserves critical escalation sequences without hiding escalation step', () => {
    const esc1: Alert = {
      id: 'ESC-1',
      patientId: 'PAT-ESC',
      timestamp: new Date('2026-09-30T10:00:00.000Z').toISOString(),
      category: 'VITAL_SIGN',
      priority: 'LOW',
      message: 'RR elevation: 22',
      source: 'Monitor',
      patientStatus: 'STABLE',
      historyCompleteness: 80,
      actionability: 'LOW',
      evidence: [],
      relatedAlertIds: [],
      groundTruthActionable: false,
      groundTruthCritical: false,
      groundTruthDuplicate: false,
    };

    const esc2: Alert = {
      id: 'ESC-2',
      patientId: 'PAT-ESC',
      timestamp: new Date('2026-09-30T10:00:30.000Z').toISOString(),
      category: 'VITAL_SIGN',
      priority: 'CRITICAL',
      message: 'RR Crash SpO2 65%',
      source: 'Monitor',
      patientStatus: 'DISTRESSED',
      historyCompleteness: 80,
      actionability: 'HIGH',
      evidence: [],
      relatedAlertIds: [],
      groundTruthActionable: true,
      groundTruthCritical: true,
      groundTruthDuplicate: false,
    };

    const output = processAlerts([esc1, esc2], DEFAULT_THRESHOLDS, false);

    const criticalRetained = output.processedAlerts.find(a => a.id === 'ESC-2');
    expect(criticalRetained).toBeDefined();
    expect(criticalRetained?.priority).toBe('CRITICAL');
  });
});

import { describe, it, expect } from 'vitest';
import { processAlerts } from '../utils/alertProcessor';
import { DEFAULT_THRESHOLDS } from '../data/simulatedData';
import { Alert } from '../types/alert';

describe('Core Safety Priority Rules Engine', () => {
  const baseAlert: Alert = {
    id: 'TEST-001',
    patientId: 'PAT-100',
    timestamp: new Date('2026-09-30T10:00:00.000Z').toISOString(),
    category: 'VITAL_SIGN',
    priority: 'HIGH',
    message: 'Test Vital Alert',
    source: 'Test Monitor',
    patientStatus: 'STABLE',
    historyCompleteness: 80,
    actionability: 'HIGH',
    evidence: [],
    relatedAlertIds: [],
    groundTruthActionable: true,
    groundTruthCritical: false,
    groundTruthDuplicate: false,
  };

  it('Rule 1: CRITICAL priority alert is NEVER suppressed', () => {
    const critical1: Alert = { ...baseAlert, id: 'CRIT-1', priority: 'CRITICAL' };
    const critical2: Alert = { ...baseAlert, id: 'CRIT-2', priority: 'CRITICAL', timestamp: new Date('2026-09-30T10:00:10.000Z').toISOString() };

    const output = processAlerts([critical1, critical2], DEFAULT_THRESHOLDS, false);

    expect(output.processedAlerts).toHaveLength(2);
    expect(output.processedAlerts.every(a => a.priority === 'CRITICAL')).toBe(true);
    expect(output.processedAlerts.every(a => !a.isSuppressed)).toBe(true);
  });

  it('Rule 2: Patients with historyCompleteness < 30% ALWAYS bypass filtering', () => {
    const unknownHistoryAlert1: Alert = { ...baseAlert, id: 'UNC-1', historyCompleteness: 0, priority: 'HIGH' };
    const unknownHistoryAlert2: Alert = { ...baseAlert, id: 'UNC-2', historyCompleteness: 15, priority: 'HIGH', timestamp: new Date('2026-09-30T10:00:10.000Z').toISOString() };

    const output = processAlerts([unknownHistoryAlert1, unknownHistoryAlert2], DEFAULT_THRESHOLDS, false);

    expect(output.processedAlerts).toHaveLength(2);
    expect(output.processedAlerts.every(a => a.isRawBypass || a.processingDecision?.decision === 'RAW_BYPASS')).toBe(true);
  });

  it('Rule 3: Sliding window deduplication consolidates duplicate alerts within window', () => {
    const dup1: Alert = { ...baseAlert, id: 'DUP-1', timestamp: new Date('2026-09-30T10:00:00.000Z').toISOString() };
    const dup2: Alert = { ...baseAlert, id: 'DUP-2', timestamp: new Date('2026-09-30T10:01:00.000Z').toISOString() }; // +1 min (within 2 min VITAL window)

    const output = processAlerts([dup1, dup2], DEFAULT_THRESHOLDS, false);

    expect(output.processedAlerts).toHaveLength(1);
    expect(output.processedAlerts[0].duplicateCount).toBe(1);
    expect(output.processedAlerts[0].isConsolidated).toBe(true);
  });

  it('Rule 4: Alerts separated outside sliding window remain separate cards', () => {
    const sep1: Alert = { ...baseAlert, id: 'SEP-1', timestamp: new Date('2026-09-30T10:00:00.000Z').toISOString() };
    const sep2: Alert = { ...baseAlert, id: 'SEP-2', timestamp: new Date('2026-09-30T10:15:00.000Z').toISOString() }; // +15 mins (outside 2 min window)

    const output = processAlerts([sep1, sep2], DEFAULT_THRESHOLDS, false);

    expect(output.processedAlerts).toHaveLength(2);
  });

  it('Rule 5: Force RAW MODE disables all alert suppression', () => {
    const dup1: Alert = { ...baseAlert, id: 'DUP-1' };
    const dup2: Alert = { ...baseAlert, id: 'DUP-2', timestamp: new Date('2026-09-30T10:00:30.000Z').toISOString() };

    const output = processAlerts([dup1, dup2], DEFAULT_THRESHOLDS, true); // force raw mode = true

    expect(output.isRawMode).toBe(true);
    expect(output.processedAlerts).toHaveLength(2);
    expect(output.processedAlerts.every(a => a.isRawBypass)).toBe(true);
  });
});

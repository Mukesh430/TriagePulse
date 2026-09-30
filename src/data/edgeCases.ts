import { Alert } from '../types/alert';

const BASE_TIME = new Date('2026-09-30T10:00:00.000Z').getTime();

export interface EdgeCaseScenario {
  id: string;
  name: string;
  description: string;
  expectedBehavior: string;
  inputAlerts: Alert[];
}

export const EDGE_CASE_SCENARIOS: EdgeCaseScenario[] = [
  {
    id: 'EC1',
    name: 'Unconscious Patient — 0% History',
    description: 'Patient arrives unconscious with no known medical history. High/Critical vital alerts are triggered rapidly.',
    expectedBehavior: 'All alerts must bypass filtering (RAW BYPASS) and remain 100% visible due to historyCompleteness < 30%.',
    inputAlerts: [
      {
        id: 'EC1-ALT-01',
        patientId: 'PAT-UNC-999',
        timestamp: new Date(BASE_TIME).toISOString(),
        category: 'VITAL_SIGN',
        priority: 'CRITICAL',
        message: 'Unconscious Patient: Severe Hypoxia SpO2 75%',
        source: 'Trauma Bay 1',
        patientStatus: 'UNCONSCIOUS',
        historyCompleteness: 0,
        actionability: 'HIGH',
        value: 75,
        unit: '%',
        evidence: [{
          sourceAlertId: 'EC1-ALT-01',
          timestamp: new Date(BASE_TIME).toISOString(),
          signal: 'SpO2',
          observedValue: 75,
          expectedRange: '95-100%',
          reason: 'Trauma airway collapse',
          confidence: 0.99
        }],
        relatedAlertIds: [],
        groundTruthActionable: true,
        groundTruthCritical: true,
        groundTruthDuplicate: false
      },
      {
        id: 'EC1-ALT-02',
        patientId: 'PAT-UNC-999',
        timestamp: new Date(BASE_TIME + 10000).toISOString(),
        category: 'VITAL_SIGN',
        priority: 'HIGH',
        message: 'Unconscious Patient: Hypotension BP 70/40',
        source: 'Trauma Bay 1',
        patientStatus: 'UNCONSCIOUS',
        historyCompleteness: 0,
        actionability: 'HIGH',
        value: '70/40',
        unit: 'mmHg',
        evidence: [{
          sourceAlertId: 'EC1-ALT-02',
          timestamp: new Date(BASE_TIME + 10000).toISOString(),
          signal: 'BP',
          observedValue: '70/40',
          expectedRange: '120/80',
          reason: 'Shock state',
          confidence: 0.98
        }],
        relatedAlertIds: [],
        groundTruthActionable: true,
        groundTruthCritical: false,
        groundTruthDuplicate: false
      }
    ]
  },
  {
    id: 'EC2',
    name: 'Alert Flood (Capacity Exceeded)',
    description: 'Simulates a sudden spike of 120 rapid alerts within a single batch, exceeding system capacity limit of 100 alerts.',
    expectedBehavior: 'System detects capacity overflow, aborts deduplication, and automatically switches to RAW MODE (FAIL SAFE).',
    inputAlerts: Array.from({ length: 120 }).map((_, idx) => ({
      id: `FLOOD-ALT-${idx + 1}`,
      patientId: `PAT-FLD-${(idx % 10) + 1}`,
      timestamp: new Date(BASE_TIME + idx * 500).toISOString(),
      category: 'VITAL_SIGN',
      priority: idx % 5 === 0 ? 'CRITICAL' : 'HIGH',
      message: `Flood Alert #${idx + 1}: Rapid telemetry pulse ox drop`,
      source: `Monitor Flood Unit ${idx % 4}`,
      patientStatus: 'STABLE',
      historyCompleteness: 80,
      actionability: 'HIGH',
      value: 88,
      unit: '%',
      evidence: [],
      relatedAlertIds: [],
      groundTruthActionable: idx % 5 === 0,
      groundTruthCritical: idx % 5 === 0,
      groundTruthDuplicate: idx % 5 !== 0
    }))
  },
  {
    id: 'EC3',
    name: 'Critical Escalation Sequence',
    description: 'Rapid progression of patient deterioration from LOW to MEDIUM to HIGH to CRITICAL vital signs.',
    expectedBehavior: 'Deduplication engine must NOT hide the escalating CRITICAL alert under earlier lower-priority duplicates.',
    inputAlerts: [
      {
        id: 'EC3-ALT-01',
        patientId: 'PAT-ESC-777',
        timestamp: new Date(BASE_TIME).toISOString(),
        category: 'VITAL_SIGN',
        priority: 'LOW',
        message: 'Mild RR elevation: 22 bpm',
        source: 'Bay 5 Monitor',
        patientStatus: 'STABLE',
        historyCompleteness: 90,
        actionability: 'LOW',
        evidence: [],
        relatedAlertIds: [],
        groundTruthActionable: false,
        groundTruthCritical: false,
        groundTruthDuplicate: false
      },
      {
        id: 'EC3-ALT-02',
        patientId: 'PAT-ESC-777',
        timestamp: new Date(BASE_TIME + 20000).toISOString(),
        category: 'VITAL_SIGN',
        priority: 'MEDIUM',
        message: 'Moderate RR elevation: 28 bpm',
        source: 'Bay 5 Monitor',
        patientStatus: 'STABLE',
        historyCompleteness: 90,
        actionability: 'MEDIUM',
        evidence: [],
        relatedAlertIds: [],
        groundTruthActionable: true,
        groundTruthCritical: false,
        groundTruthDuplicate: false
      },
      {
        id: 'EC3-ALT-03',
        patientId: 'PAT-ESC-777',
        timestamp: new Date(BASE_TIME + 40000).toISOString(),
        category: 'VITAL_SIGN',
        priority: 'CRITICAL',
        message: 'CRITICAL: Acute Respiratory Arrest SpO2 65%',
        source: 'Bay 5 Monitor',
        patientStatus: 'DISTRESSED',
        historyCompleteness: 90,
        actionability: 'HIGH',
        evidence: [],
        relatedAlertIds: [],
        groundTruthActionable: true,
        groundTruthCritical: true,
        groundTruthDuplicate: false
      }
    ]
  },
  {
    id: 'EC4',
    name: 'Malformed Alert / Missing Data',
    description: 'Alert payload arrives corrupted (missing required fields such as patientId or priority).',
    expectedBehavior: 'Validation failure triggers immediate safe fallback to RAW MODE, displaying persistent warning alert.',
    inputAlerts: [
      {
        id: 'EC4-ALT-CORRUPT',
        patientId: '', // INVALID / MISSING PATIENT ID
        timestamp: new Date(BASE_TIME).toISOString(),
        category: 'VITAL_SIGN',
        priority: 'HIGH',
        message: 'Corrupted telemetry payload',
        source: 'Unknown Socket',
        patientStatus: 'STABLE',
        historyCompleteness: 50,
        actionability: 'HIGH',
        evidence: [],
        relatedAlertIds: [],
        groundTruthActionable: true,
        groundTruthCritical: false,
        groundTruthDuplicate: false
      } as unknown as Alert
    ]
  }
];

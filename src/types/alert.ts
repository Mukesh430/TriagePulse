export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PatientStatus = 
  | 'CONSCIOUS' 
  | 'UNCONSCIOUS' 
  | 'DISTRESSED' 
  | 'STABLE' 
  | 'UNKNOWN';

export type Category = 'VITAL_SIGN' | 'LAB' | 'PHARMACY' | 'WORKFLOW' | 'OTHER';

export type Actionability = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface Evidence {
  sourceAlertId: string;
  timestamp: string;
  signal: string;
  observedValue: number | string;
  expectedRange: string;
  reason: string;
  confidence: number;
}

export type ClinicianResponse = 
  | 'ACKNOWLEDGED' 
  | 'DISMISSED' 
  | 'OVERRIDDEN' 
  | 'ESCALATED' 
  | 'NO_RESPONSE';

export interface OverrideRecord {
  alertId: string;
  clinicianId: string;
  action: string;
  reason: string;
  feedback: string;
  timestamp: string;
}

export interface ProcessingDecision {
  decision: 'RETAIN' | 'CONSOLIDATE' | 'SUPPRESS' | 'RAW_BYPASS';
  reason: string;
  ruleTriggered: string;
  timestamp: string;
}

export interface ThresholdConfig {
  windowMinutes: Record<Category, number>;
  similarityThreshold: number; // 0.0 - 1.0
  suppressionThreshold: number; // 0.0 - 1.0
  maxAlertsPerBatch: number;
  maxAlertsPerMinute: number;
  processingTimeoutMs: number;
  minHistoryCompleteness: number; // default 30%
}

export interface Alert {
  id: string;
  patientId: string;
  timestamp: string; // ISO String or relative time
  category: Category;
  priority: Priority;
  message: string;
  source: string;
  patientStatus: PatientStatus;
  historyCompleteness: number; // 0-100
  actionability: Actionability;
  value?: number | string;
  unit?: string;
  referenceRange?: string;
  evidence: Evidence[];
  relatedAlertIds: string[];
  clinicianResponse?: ClinicianResponse;
  responseDelaySeconds?: number;
  override?: OverrideRecord;
  processingDecision?: ProcessingDecision;
  duplicateCount?: number;
  isConsolidated?: boolean;
  isSuppressed?: boolean;
  isRawBypass?: boolean;
  groundTruthActionable: boolean;
  groundTruthCritical: boolean;
  groundTruthDuplicate: boolean;
  simulatedOutcome?: 'resolved' | 'persisted' | 'escalated' | 'no_followup';
}

export interface SystemMetrics {
  totalRawAlerts: number;
  totalFilteredAlerts: number;
  duplicatesConsolidated: number;
  nonActionableReduced: number;
  criticalAlerts: number;
  criticalAlertsRetained: number;
  criticalSensitivity: number; // percentage
  highPriorityRetention: number; // percentage
  noiseReduction: number; // percentage
  falsePositives: number;
  falseNegatives: number;
  overrideRate: number; // percentage
  averageProcessingTime: number; // ms
  averageResponseTime: number; // seconds
  targetAchieved: boolean;
  targetFailureReason?: string;
}

export interface ExperimentResult {
  id: string;
  timestamp: string;
  config: ThresholdConfig;
  datasetSize: number;
  baseline: {
    totalAlerts: number;
    nonActionable: number;
    criticalAlerts: number;
    avgResponseTimeSec: number;
  };
  metrics: SystemMetrics;
  isRawMode: boolean;
  isFallbackTriggered: boolean;
  fallbackReason?: string;
}

export interface EdgeCaseResult {
  id: string;
  name: string;
  description: string;
  expectedBehavior: string;
  actualResult: string;
  status: 'PASS' | 'FAIL';
  reason: string;
  inputAlertCount: number;
  retainedAlertCount: number;
  rawModeTriggered: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  alertId: string;
  patientId: string;
  category: Category;
  priority: Priority;
  decision: 'RETAIN' | 'CONSOLIDATE' | 'SUPPRESS' | 'RAW_BYPASS';
  reason: string;
  ruleTriggered: string;
  duplicatesConsolidated: number;
  safetyOverride: boolean;
  fallbackActive: boolean;
  clinicianOverride?: OverrideRecord;
}

export interface GroundTruthEvaluation {
  alertId: string;
  expected: 'RETAIN' | 'CONSOLIDATE' | 'SUPPRESS';
  actual: 'RETAIN' | 'CONSOLIDATE' | 'SUPPRESS';
  isError: boolean;
  errorType?: 'FP' | 'FN' | 'NONE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

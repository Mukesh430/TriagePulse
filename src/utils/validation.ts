import { Alert } from '../types/alert';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateAlert(alert: Partial<Alert>): ValidationResult {
  if (!alert) {
    return { isValid: false, reason: 'Alert payload is null or undefined' };
  }

  if (!alert.id || typeof alert.id !== 'string' || alert.id.trim() === '') {
    return { isValid: false, reason: 'Missing or invalid alert ID' };
  }

  if (!alert.patientId || typeof alert.patientId !== 'string' || alert.patientId.trim() === '') {
    return { isValid: false, reason: 'Missing or invalid patient ID' };
  }

  if (!alert.timestamp || typeof alert.timestamp !== 'string') {
    return { isValid: false, reason: 'Missing or invalid timestamp' };
  }

  const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  if (!alert.priority || !validPriorities.includes(alert.priority)) {
    return { isValid: false, reason: `Invalid priority level: ${alert.priority}` };
  }

  const validCategories = ['VITAL_SIGN', 'LAB', 'PHARMACY', 'WORKFLOW', 'OTHER'];
  if (!alert.category || !validCategories.includes(alert.category)) {
    return { isValid: false, reason: `Invalid category: ${alert.category}` };
  }

  if (!alert.message || typeof alert.message !== 'string' || alert.message.trim() === '') {
    return { isValid: false, reason: 'Missing or empty alert message' };
  }

  if (typeof alert.historyCompleteness !== 'number' || alert.historyCompleteness < 0 || alert.historyCompleteness > 100) {
    return { isValid: false, reason: `Invalid historyCompleteness percentage: ${alert.historyCompleteness}` };
  }

  return { isValid: true };
}

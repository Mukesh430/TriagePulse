import React from 'react';
import { AlertOctagon } from 'lucide-react';
import clsx from 'clsx';

export interface RiskItem {
  id: string;
  risk: string;
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigation: string;
  detection: string;
  fallback: string;
}

export const RISKS: RiskItem[] = [
  {
    id: 'R01',
    risk: 'Critical Alert Suppression',
    likelihood: 'LOW',
    impact: 'CRITICAL',
    severity: 'CRITICAL',
    mitigation: 'Hardcoded Rule 1 priority check precedes all deduplication logic.',
    detection: 'Automated Vitest suite + ground-truth sensitivity tracking.',
    fallback: 'System automatically switches to RAW MODE if critical check is bypassed.',
  },
  {
    id: 'R02',
    risk: 'False Negative (Actionable Alert Hidden)',
    likelihood: 'LOW',
    impact: 'HIGH',
    severity: 'HIGH',
    mitigation: 'Strict category-specific sliding windows + history completeness rule (<30%).',
    detection: 'Real-time Ground Truth error evaluation matrix in metrics dashboard.',
    fallback: 'Clinician override modal + instant RAW MODE toggle button.',
  },
  {
    id: 'R03',
    risk: 'Excessive Consolidation (Over-Grouping)',
    likelihood: 'MEDIUM',
    impact: 'MEDIUM',
    severity: 'MEDIUM',
    mitigation: 'Configurable similarity threshold (0.85) and audit evidence drawer.',
    detection: 'Clinician override rate metric monitoring (>15% triggers alert).',
    fallback: 'Expand Evidence Drawer to view all original constituent alerts.',
  },
  {
    id: 'R04',
    risk: 'Alert Flood (Capacity Overflow)',
    likelihood: 'MEDIUM',
    impact: 'HIGH',
    severity: 'HIGH',
    mitigation: 'Batch capacity limits (max 100 alerts/batch) enforced at entry.',
    detection: 'Batch size counter validation in step 1 of processor.',
    fallback: 'FAIL SAFE ACTIVATION: Immediate automatic switch to RAW MODE stream.',
  },
  {
    id: 'R05',
    risk: 'Data Quality / Malformed Payload',
    likelihood: 'LOW',
    impact: 'HIGH',
    severity: 'HIGH',
    mitigation: 'Strict TypeScript interface schema validation (validateAlert).',
    detection: 'Validation step 2 inspects ID, priority, patient, and timestamp fields.',
    fallback: 'FAIL SAFE ACTIVATION: Abort processing and render raw payload.',
  },
  {
    id: 'R06',
    risk: 'Processing Timeout / System Exception',
    likelihood: 'LOW',
    impact: 'HIGH',
    severity: 'HIGH',
    mitigation: 'Execution wrapped in try/catch with timeout watchdogs (1000ms).',
    detection: 'Performance.now() delta watchdog logging.',
    fallback: 'Render original un-processed alert array with warning banner.',
  },
  {
    id: 'R07',
    risk: 'Incorrect Threshold Configuration',
    likelihood: 'MEDIUM',
    impact: 'MEDIUM',
    severity: 'MEDIUM',
    mitigation: 'UI parameter constraints (1-30 min window limits).',
    detection: 'Safety Validation Gate summary checks threshold boundaries.',
    fallback: 'Reset to Safe Defaults button restores clinical baseline settings.',
  },
  {
    id: 'R08',
    risk: 'Clinician Overreliance on Filtering',
    likelihood: 'MEDIUM',
    impact: 'HIGH',
    severity: 'HIGH',
    mitigation: 'Clear UI disclaimers: System is an alert manager, NOT clinical diagnosis.',
    detection: 'Mandatory clinician training & stakeholder usability reviews.',
    fallback: 'Persistent RAW MODE view available anytime for shift verification.',
  },
  {
    id: 'R09',
    risk: 'UI Confusion / Ambiguous Indicators',
    likelihood: 'LOW',
    impact: 'MEDIUM',
    severity: 'MEDIUM',
    mitigation: 'High-contrast priority color badges and distinct consolidated badges.',
    detection: 'Simulated stakeholder validation feedback surveys.',
    fallback: 'Auditable Evidence Drawer exposes full underlying data.',
  },
  {
    id: 'R10',
    risk: 'Auditability Failure',
    likelihood: 'LOW',
    impact: 'HIGH',
    severity: 'HIGH',
    mitigation: 'Immutable AuditEntry logging generated for every decision.',
    detection: 'Audit Log modal allows filtering and real-time inspection.',
    fallback: 'Persistent local storage backup of all audit logs.',
  },
];

export const RiskMatrix: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <span>Comprehensive Clinical & Technical Risk Register</span>
          </h3>
          <p className="text-xs text-slate-400">
            Hazard analysis, detection mechanisms, and emergency fail-safe fallbacks.
          </p>
        </div>
        <span className="px-3 py-1 bg-red-950 text-red-300 border border-red-700 rounded-full text-xs font-mono">
          ISO 14971 Risk Standard Format
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase tracking-wider">
              <th className="p-3">ID</th>
              <th className="p-3">Identified Hazard / Risk</th>
              <th className="p-3">Likelihood</th>
              <th className="p-3">Impact</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Mitigation Control</th>
              <th className="p-3">Detection</th>
              <th className="p-3">Fail-Safe Fallback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
            {RISKS.map(r => (
              <tr key={r.id} className="hover:bg-slate-850/50 transition-colors">
                <td className="p-3 font-mono font-bold text-cyan-400">{r.id}</td>
                <td className="p-3 font-semibold text-slate-200">{r.risk}</td>
                <td className="p-3 font-mono">{r.likelihood}</td>
                <td className="p-3 font-mono">{r.impact}</td>
                <td className="p-3 font-mono">
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded text-xs font-semibold',
                      r.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-700 font-bold'
                        : r.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="p-3 text-slate-300">{r.mitigation}</td>
                <td className="p-3 text-slate-400 font-mono text-xs">{r.detection}</td>
                <td className="p-3 text-cyan-300 font-mono text-xs">{r.fallback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { RiskMatrix } from '../components/RiskMatrix';
import { ClinicianGuide } from '../components/ClinicianGuide';
import { StakeholderAssumptions } from '../components/StakeholderAssumptions';
import { Code, FileJson } from 'lucide-react';

export const DocsRiskRegister: React.FC = () => {
  const sampleJsonAlert = {
    id: "ALT-101",
    patientId: "PAT-UNC-001",
    timestamp: "2026-09-30T10:00:00.000Z",
    category: "VITAL_SIGN",
    priority: "CRITICAL",
    message: "Severe Bradycardia detected: HR 34 bpm",
    source: "Cardiac Monitor Bay 1",
    patientStatus: "UNCONSCIOUS",
    historyCompleteness: 0,
    actionability: "HIGH",
    value: 34,
    unit: "bpm",
    referenceRange: "60 - 100 bpm",
    evidence: [
      {
        sourceAlertId: "ALT-101",
        timestamp: "2026-09-30T10:00:00.000Z",
        signal: "Heart Rate",
        observedValue: 34,
        expectedRange: "60 - 100 bpm",
        reason: "Hemodynamic collapse risk in trauma arrival",
        confidence: 0.99
      }
    ],
    processingDecision: {
      decision: "RETAIN",
      reason: "CRITICAL priority alert — zero suppression permitted by ED Safety Rule 1.",
      ruleTriggered: "RULE_1_CRITICAL_NON_SUPPRESSION",
      timestamp: "2026-09-30T10:00:00.120Z"
    }
  };

  const sampleJsonOverride = {
    alertId: "ALT-201",
    clinicianId: "MD-8492 (Dr. Alex Mercer)",
    action: "CLINICIAN_OVERRIDE",
    reason: "Alert is clinically relevant",
    feedback: "Patient has history of rapid decompensation; vital trend requires immediate bedside review.",
    timestamp: "2026-09-30T10:05:12.000Z"
  };

  return (
    <div className="space-y-8">
      {/* Clinician Guide */}
      <ClinicianGuide />

      {/* Stakeholder Assumptions & Validation */}
      <StakeholderAssumptions />

      {/* Comprehensive Risk Register */}
      <RiskMatrix />

      {/* JSON Payload Schemas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-cyan-950 border border-cyan-700/50 rounded-xl text-cyan-400">
            <FileJson className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Preliminary JSON Payload Schemas</h3>
            <p className="text-xs text-slate-400">Canonical data interfaces linking alert → evidence → decision → clinician response</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* Alert & Evidence Payload */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 font-sans flex items-center space-x-1.5">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>1. Alert, Evidence & Processing Decision Payload</span>
            </h4>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(sampleJsonAlert, null, 2)}
            </pre>
          </div>

          {/* Clinician Override Payload */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 font-sans flex items-center space-x-1.5">
              <Code className="w-4 h-4 text-amber-400" />
              <span>2. Clinician Override Transaction Payload</span>
            </h4>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-amber-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(sampleJsonOverride, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

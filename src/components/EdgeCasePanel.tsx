import React, { useState } from 'react';
import { EDGE_CASE_SCENARIOS, EdgeCaseScenario } from '../data/edgeCases';
import { ThresholdConfig, EdgeCaseResult } from '../types/alert';
import { processAlerts } from '../utils/alertProcessor';
import { Play, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

interface EdgeCasePanelProps {
  config: ThresholdConfig;
  onEdgeCaseResultsUpdate?: (allPassed: boolean) => void;
}

export const EdgeCasePanel: React.FC<EdgeCasePanelProps> = ({ config, onEdgeCaseResultsUpdate }) => {
  const [testResults, setTestResults] = useState<Record<string, EdgeCaseResult>>({});

  const runSingleTest = (scenario: EdgeCaseScenario): EdgeCaseResult => {
    // Actually execute the deduplication processor!
    const output = processAlerts(scenario.inputAlerts, config, false);

    let status: 'PASS' | 'FAIL' = 'PASS';
    let reason = 'Test executed cleanly and satisfied expected clinical safety rules.';
    let actualResult = '';

    if (scenario.id === 'EC1') {
      // Unconscious patient historyCompleteness = 0
      const allRetained = output.processedAlerts.length === scenario.inputAlerts.length;
      const allBypassed = output.processedAlerts.every(a => a.historyCompleteness < 30 ? a.isRawBypass || a.processingDecision?.decision === 'RETAIN' || a.processingDecision?.decision === 'RAW_BYPASS' : true);

      actualResult = `Retained ${output.processedAlerts.length} of ${scenario.inputAlerts.length} alerts. Bypass rules active.`;

      if (!allRetained || !allBypassed) {
        status = 'FAIL';
        reason = 'SAFETY FAILURE: Patient with 0% history suffered inappropriate alert suppression.';
      }
    } else if (scenario.id === 'EC2') {
      // Alert flood: 120 alerts exceeds maxAlertsPerBatch (100)
      actualResult = `Processed 120 alerts. System Fallback: ${output.isFallbackTriggered ? 'TRIGGERED (RAW MODE)' : 'NORMAL'}. Retained: ${output.processedAlerts.length}`;

      if (!output.isFallbackTriggered || !output.isRawMode) {
        status = 'FAIL';
        reason = 'CAPACITY FAILURE: Alert flood exceeded batch limits but failed to switch to RAW MODE.';
      } else {
        reason = 'FAIL SAFE VERIFIED: System automatically switched to RAW MODE upon capacity overflow.';
      }
    } else if (scenario.id === 'EC3') {
      // Critical escalation LOW -> MEDIUM -> HIGH -> CRITICAL
      const criticalAlertRetained = output.processedAlerts.some(a => a.priority === 'CRITICAL');
      actualResult = `Retained ${output.processedAlerts.length} primary cards. Critical escalation alert present: ${criticalAlertRetained ? 'YES' : 'NO'}.`;

      if (!criticalAlertRetained) {
        status = 'FAIL';
        reason = 'SAFETY FAILURE: Escalating CRITICAL alert was obscured by lower priority deduplication.';
      } else {
        reason = 'ESCALATION VERIFIED: Critical alert preserved and highlighted cleanly.';
      }
    } else if (scenario.id === 'EC4') {
      // Malformed alert
      actualResult = `Malformed payload sent. Fallback Triggered: ${output.isFallbackTriggered ? 'YES' : 'NO'}. Mode: ${output.isRawMode ? 'RAW MODE' : 'FILTERED'}.`;

      if (!output.isFallbackTriggered || !output.isRawMode) {
        status = 'FAIL';
        reason = 'VALIDATION FAILURE: Corrupted alert payload did not trigger safe RAW MODE fallback.';
      } else {
        reason = 'MALFORMED FAIL SAFE VERIFIED: Validation error safely reverted to raw stream.';
      }
    }

    return {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      expectedBehavior: scenario.expectedBehavior,
      actualResult,
      status,
      reason,
      inputAlertCount: scenario.inputAlerts.length,
      retainedAlertCount: output.processedAlerts.length,
      rawModeTriggered: output.isRawMode,
    };
  };

  const handleRunTest = (scenario: EdgeCaseScenario) => {
    const result = runSingleTest(scenario);
    const updated = { ...testResults, [scenario.id]: result };
    setTestResults(updated);

    const allScenariosRun = EDGE_CASE_SCENARIOS.every(s => updated[s.id] !== undefined);
    const allPassed = allScenariosRun && Object.values(updated).every(r => r.status === 'PASS');
    if (onEdgeCaseResultsUpdate) onEdgeCaseResultsUpdate(allPassed);
  };

  const handleRunAllTests = () => {
    const newResults: Record<string, EdgeCaseResult> = {};
    for (const scenario of EDGE_CASE_SCENARIOS) {
      newResults[scenario.id] = runSingleTest(scenario);
    }
    setTestResults(newResults);

    const allPassed = Object.values(newResults).every(r => r.status === 'PASS');
    if (onEdgeCaseResultsUpdate) onEdgeCaseResultsUpdate(allPassed);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Interactive Edge-Case & Failure-Case Testing Suite</span>
          </h3>
          <p className="text-xs text-slate-400">
            Executes real-time safety simulation tests against the processor engine to verify fallback and non-suppression rules.
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-950/40"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Execute All Edge Case Tests</span>
        </button>
      </div>

      {/* Grid of Edge Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EDGE_CASE_SCENARIOS.map(scenario => {
          const result = testResults[scenario.id];

          return (
            <div
              key={scenario.id}
              className={clsx(
                'bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition-all space-y-3',
                result
                  ? result.status === 'PASS'
                    ? 'border-emerald-600/60 bg-emerald-950/10'
                    : 'border-red-600/80 bg-red-950/20'
                  : 'border-slate-800'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{scenario.id}</span>
                  {result && (
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded text-xs font-mono font-bold flex items-center space-x-1',
                        result.status === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                      )}
                    >
                      {result.status === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                      )}
                      {result.status}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-100">{scenario.name}</h4>
                <p className="text-xs text-slate-400">{scenario.description}</p>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                  <p className="text-slate-400">
                    <strong className="text-slate-200">Expected:</strong> {scenario.expectedBehavior}
                  </p>

                  {result && (
                    <div className="border-t border-slate-800 pt-1.5 mt-1 space-y-1">
                      <p className="text-slate-300">
                        <strong className="text-cyan-400">Actual Result:</strong> {result.actualResult}
                      </p>
                      <p className={clsx("text-xs font-sans italic", result.status === 'PASS' ? "text-emerald-300" : "text-red-300")}>
                        Reason: {result.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleRunTest(scenario)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Run Scenario ({scenario.id})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

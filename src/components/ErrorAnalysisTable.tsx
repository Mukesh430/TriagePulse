import React, { useState } from 'react';
import { GroundTruthEvaluation } from '../types/alert';
import { Filter, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

interface ErrorAnalysisTableProps {
  evaluations: GroundTruthEvaluation[];
}

export const ErrorAnalysisTable: React.FC<ErrorAnalysisTableProps> = ({ evaluations }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'FP' | 'FN' | 'ERRORS_ONLY'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filteredList = evaluations.filter(item => {
    if (filterType === 'ERRORS_ONLY' && !item.isError) return false;
    if (filterType === 'FP' && item.errorType !== 'FP') return false;
    if (filterType === 'FN' && item.errorType !== 'FN') return false;
    if (filterSeverity !== 'ALL' && item.severity !== filterSeverity) return false;
    return true;
  });

  const fpCount = evaluations.filter(e => e.errorType === 'FP').length;
  const fnCount = evaluations.filter(e => e.errorType === 'FN').length;
  const criticalFnCount = evaluations.filter(e => e.errorType === 'FN' && e.severity === 'CRITICAL').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>False Positive & False Negative Error Analysis</span>
          </h3>
          <p className="text-xs text-slate-400">
            Explicit ground-truth validation table comparing simulated ideal decisions against actual system outputs.
          </p>
        </div>

        {/* Counter Summary Badges */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/60">
            False Positives (FP): <strong>{fpCount}</strong>
          </span>
          <span className={clsx("px-3 py-1.5 rounded-lg font-bold border", criticalFnCount > 0 ? "bg-red-950 text-red-300 border-red-700 animate-pulse" : "bg-slate-800 text-slate-300 border-slate-700")}>
            False Negatives (FN): <strong>{fnCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-semibold">Filter Error Type:</span>
          {(['ALL', 'ERRORS_ONLY', 'FP', 'FN'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={clsx(
                'px-2.5 py-1 rounded-md font-mono transition-colors',
                filterType === type
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-semibold">Filter Severity:</span>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase tracking-wider">
              <th className="p-3">Alert ID</th>
              <th className="p-3">Expected</th>
              <th className="p-3">Actual</th>
              <th className="p-3">Error Type</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Clinical Explanation & Ground Truth Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 font-mono">
                  No evaluation entries match the selected filter.
                </td>
              </tr>
            ) : (
              filteredList.map(item => (
                <tr
                  key={item.alertId}
                  className={clsx(
                    'hover:bg-slate-850/50 transition-colors',
                    item.errorType === 'FN' && item.severity === 'CRITICAL'
                      ? 'bg-red-950/40'
                      : item.isError
                      ? 'bg-amber-950/20'
                      : 'bg-slate-900'
                  )}
                >
                  <td className="p-3 font-mono font-bold text-slate-200">{item.alertId}</td>
                  <td className="p-3 font-mono text-cyan-400">{item.expected}</td>
                  <td className="p-3 font-mono text-slate-300">{item.actual}</td>
                  <td className="p-3 font-mono">
                    {item.errorType === 'NONE' ? (
                      <span className="text-emerald-400 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> NONE
                      </span>
                    ) : item.errorType === 'FP' ? (
                      <span className="text-amber-400 font-bold">FP (Noise Retained)</span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" /> FN (Hidden Alert)
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono">
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded text-xs font-semibold',
                        item.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border border-red-700'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-xs">{item.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

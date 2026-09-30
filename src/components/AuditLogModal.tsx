import React, { useState } from 'react';
import { AuditEntry } from '../types/alert';
import { X, History, Filter, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface AuditLogModalProps {
  logs: AuditEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs, isOpen, onClose }) => {
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(entry => {
    if (filterDecision !== 'ALL' && entry.decision !== filterDecision) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = entry.alertId.toLowerCase().includes(q);
      const matchPat = entry.patientId.toLowerCase().includes(q);
      const matchRule = entry.ruleTriggered.toLowerCase().includes(q);
      if (!matchId && !matchPat && !matchRule) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-950 border border-cyan-700/50 rounded-xl text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">System Transaction Audit Trail</h2>
              <p className="text-xs text-slate-400 font-mono">Immutable audit log for clinical safety compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Alert ID, Patient ID, Rule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Decision:</span>
            <select
              value={filterDecision}
              onChange={e => setFilterDecision(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Decisions</option>
              <option value="RETAIN">RETAIN</option>
              <option value="CONSOLIDATE">CONSOLIDATE</option>
              <option value="SUPPRESS">SUPPRESS</option>
              <option value="RAW_BYPASS">RAW_BYPASS</option>
            </select>
          </div>
        </div>

        {/* Log List */}
        <div className="overflow-y-auto p-4 flex-1 space-y-2 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">No audit log entries match your filter.</div>
          ) : (
            filteredLogs.map(entry => (
              <div
                key={entry.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 font-mono"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">{entry.alertId}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-cyan-400">Pat: {entry.patientId}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">{entry.category}</span>
                  </div>
                  <p className="text-slate-400 text-xs font-sans">{entry.reason}</p>
                  <p className="text-slate-500 text-xs">Rule: <span className="text-slate-300">{entry.ruleTriggered}</span></p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={clsx(
                      'px-2.5 py-0.5 rounded text-xs font-bold',
                      entry.decision === 'RETAIN'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : entry.decision === 'RAW_BYPASS'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : entry.decision === 'CONSOLIDATE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {entry.decision}
                  </span>

                  {entry.safetyOverride && (
                    <span className="text-emerald-400 text-xs flex items-center">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Safety Bypass
                    </span>
                  )}

                  {entry.clinicianOverride && (
                    <span className="text-amber-400 text-xs flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Overridden
                    </span>
                  )}

                  <span className="text-slate-500 text-xs">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">Total Audit Entries: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};

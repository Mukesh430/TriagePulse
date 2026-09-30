import React from 'react';
import { Alert } from '../types/alert';
import { X, FileText, Activity, ShieldCheck, Clock, CheckCircle2, Layers } from 'lucide-react';

interface EvidenceDrawerProps {
  alert: Alert | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-700/50 rounded-lg text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Traceable Evidence Drawer</h2>
              <p className="text-xs text-slate-400 font-mono">Alert ID: {alert.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {/* Summary Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Patient: <strong className="text-slate-200 font-mono">{alert.patientId}</strong></span>
              <span className="text-xs font-mono text-cyan-400">Status: {alert.patientStatus}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100">{alert.message}</h3>
            <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono pt-1">
              <span>Priority: <strong className="text-amber-400">{alert.priority}</strong></span>
              <span>Category: <strong className="text-slate-300">{alert.category}</strong></span>
              <span>History: <strong className="text-emerald-400">{alert.historyCompleteness}%</strong></span>
            </div>
          </div>

          {/* Decision Rationale */}
          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>System Processing Decision Rationale</span>
            </div>
            <p className="text-xs text-cyan-100 font-mono leading-relaxed">
              {alert.processingDecision?.reason || 'Retained primary alert for clinician evaluation.'}
            </p>
            <div className="text-xs text-slate-400 pt-1 font-mono">
              Rule Triggered: <span className="text-cyan-400">{alert.processingDecision?.ruleTriggered || 'RULE_DEFAULT_RETAIN'}</span>
            </div>
          </div>

          {/* Evidence Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Associated Signals & Observed Measurements</span>
            </h4>

            {alert.evidence && alert.evidence.length > 0 ? (
              <div className="space-y-2">
                {alert.evidence.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>Signal: {item.signal}</span>
                      <span className="text-cyan-400">Observed: {item.observedValue}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Expected Range: {item.expectedRange}</span>
                      <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                    </div>
                    <div className="text-slate-400 italic font-sans text-xs border-t border-slate-850 pt-1.5 mt-1">
                      Rationale: {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-500 text-xs text-center font-mono">
                No detailed evidence telemetry linked to this record.
              </div>
            )}
          </div>

          {/* Consolidated Group Details */}
          {(alert.duplicateCount || 0) > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
                <Layers className="w-4 h-4" />
                <span>Consolidated Duplicate Alert IDs ({alert.duplicateCount})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {alert.relatedAlertIds?.map((id, idx) => (
                  <span key={idx} className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clinician Override Status */}
          {alert.override && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Clinician Override Recorded</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 font-mono">
                <p>Action: {alert.override.action}</p>
                <p>Reason: {alert.override.reason}</p>
                <p className="font-sans italic text-emerald-200">&quot;{alert.override.feedback}&quot;</p>
                <p className="text-slate-400 text-xs pt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(alert.override.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

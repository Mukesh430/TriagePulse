import React from 'react';
import { Alert } from '../types/alert';
import { AlertCircle, AlertTriangle, Layers, FileText, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface AlertCardProps {
  alert: Alert;
  onOpenEvidence: (alert: Alert) => void;
  onOpenOverride: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onOpenEvidence,
  onOpenOverride,
}) => {
  const isCritical = alert.priority === 'CRITICAL';
  const isHigh = alert.priority === 'HIGH';
  const isIncompleteHistory = alert.historyCompleteness < 30;
  const isConsolidated = (alert.duplicateCount || 0) > 0;
  const isRawBypass = alert.isRawBypass;
  const isOverridden = alert.override !== undefined || alert.clinicianResponse === 'OVERRIDDEN';

  return (
    <div
      className={clsx(
        'rounded-xl p-4 transition-all duration-200 border relative overflow-hidden',
        isCritical
          ? 'bg-red-950/40 border-red-600/80 shadow-lg shadow-red-950/50 ring-1 ring-red-500/50'
          : isHigh
          ? 'bg-amber-950/20 border-amber-600/50 hover:border-amber-500'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      )}
    >
      {/* Top Bar: Priority Badge, Category, Timestamp, History Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          {/* Priority Badge */}
          <span
            className={clsx(
              'px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-1',
              isCritical
                ? 'bg-red-600 text-white animate-pulse'
                : isHigh
                ? 'bg-amber-500 text-slate-950'
                : alert.priority === 'MEDIUM'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            )}
          >
            {isCritical && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
            {isHigh && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
            {alert.priority}
          </span>

          {/* Category */}
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {alert.category}
          </span>

          {/* Raw Bypass Safety Indicator */}
          {isIncompleteHistory && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-700/60 flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              <span>SAFETY BYPASS (History &lt; 30%)</span>
            </span>
          )}

          {/* Overridden Indicator */}
          {isOverridden && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center space-x-1">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>OVERRIDDEN BY CLINICIAN</span>
            </span>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-400 font-mono">
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Main Alert Content */}
      <div className="mb-3">
        <h3 className={clsx("text-base font-semibold leading-snug mb-1", isCritical ? "text-red-200" : "text-slate-100")}>
          {alert.message}
        </h3>

        {/* Value and Source info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
          <span>Source: <strong className="text-slate-200">{alert.source}</strong></span>
          {alert.value !== undefined && (
            <span>
              Observed Value: <strong className="text-cyan-400">{alert.value} {alert.unit || ''}</strong>
            </span>
          )}
          {alert.referenceRange && (
            <span>Ref Range: <span className="font-mono text-slate-400">{alert.referenceRange}</span></span>
          )}
        </div>
      </div>

      {/* Patient Meta Bar */}
      <div className="bg-slate-950/60 rounded-lg p-2.5 mb-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-slate-400">Patient: <strong className="text-slate-200 font-mono">{alert.patientId}</strong></span>
          <span className="text-slate-400">Status: 
            <strong className={clsx("ml-1 font-semibold", alert.patientStatus === 'UNCONSCIOUS' ? "text-red-400" : alert.patientStatus === 'DISTRESSED' ? "text-amber-400" : "text-slate-200")}>
              {alert.patientStatus}
            </strong>
          </span>
        </div>

        {/* History Completeness Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs">History:</span>
          <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={clsx("h-full transition-all", alert.historyCompleteness < 30 ? "bg-red-500" : alert.historyCompleteness < 70 ? "bg-amber-500" : "bg-emerald-500")}
              style={{ width: `${alert.historyCompleteness}%` }}
            />
          </div>
          <span className={clsx("font-mono text-xs font-semibold", alert.historyCompleteness < 30 ? "text-red-400" : "text-slate-300")}>
            {alert.historyCompleteness}%
          </span>
        </div>
      </div>

      {/* Consolidation / Processing Reason Box */}
      {isConsolidated && (
        <div className="bg-cyan-950/40 border border-cyan-700/50 rounded-lg px-3 py-2 mb-3 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-300">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>
              <strong>{alert.duplicateCount} duplicate alert{alert.duplicateCount! > 1 ? 's' : ''} consolidated</strong> within sliding window
            </span>
          </div>
          <span className="text-cyan-400 font-mono font-semibold">Consolidated</span>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <div className="text-slate-400 truncate max-w-xs font-mono">
          Decision: {alert.processingDecision?.ruleTriggered || (isRawBypass ? 'RAW_BYPASS' : 'RETAIN')}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenEvidence(alert)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Evidence</span>
          </button>

          <button
            onClick={() => onOpenOverride(alert)}
            className={clsx(
              "flex items-center space-x-1 px-3 py-1.5 rounded transition-colors border",
              isOverridden
                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isOverridden ? 'Override Logged' : 'Clinician Override'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

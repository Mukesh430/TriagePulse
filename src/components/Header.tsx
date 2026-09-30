import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, ShieldAlert, History } from 'lucide-react';

interface HeaderProps {
  isRawMode: boolean;
  isFallback: boolean;
  fallbackReason?: string;
  onOpenAuditLog: () => void;
  onToggleRawMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRawMode,
  isFallback,
  fallbackReason,
  onOpenAuditLog,
  onToggleRawMode,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      {/* Persistent Fail-Safe or Force Raw Banner */}
      {(isRawMode || isFallback) && (
        <div className="bg-amber-600 text-white px-4 py-2 text-sm font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 animate-pulse text-yellow-200" />
            <span>
              <strong>{isFallback ? 'FAIL SAFE ACTIVATED:' : 'FORCE BYPASS ACTIVE:'}</strong>{' '}
              {fallbackReason || 'Raw unfiltered alert stream is currently displayed.'}
            </span>
          </div>
          <button
            onClick={onToggleRawMode}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-200 rounded text-xs font-mono uppercase tracking-wider transition-colors border border-amber-400"
          >
            {isFallback ? 'Acknowledge & Reset' : 'Restore Filtering'}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-sm shadow-cyan-500/10">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">TriagePulse</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                v1.0 ED Safety Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400">Emergency Department Alert-Fatigue Analyzer</p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center space-x-4">
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {isFallback ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-950/80 text-red-300 border border-red-800/60">
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                FALLBACK ACTIVE
              </span>
            ) : isRawMode ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                RAW MODE
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                FILTER ACTIVE
              </span>
            )}
          </div>

          {/* Audit Log Button */}
          <button
            onClick={onOpenAuditLog}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="View system audit trail"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};

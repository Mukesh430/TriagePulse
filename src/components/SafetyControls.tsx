import React from 'react';
import { ThresholdConfig, Category } from '../types/alert';
import { ShieldAlert, RotateCcw, Sliders, AlertOctagon, Zap } from 'lucide-react';

interface SafetyControlsProps {
  config: ThresholdConfig;
  isForceRawMode: boolean;
  onUpdateConfig: (newConfig: ThresholdConfig) => void;
  onToggleForceRawMode: () => void;
  onResetDefaults: () => void;
}

export const SafetyControls: React.FC<SafetyControlsProps> = ({
  config,
  isForceRawMode,
  onUpdateConfig,
  onToggleForceRawMode,
  onResetDefaults,
}) => {
  const handleWindowChange = (category: Category, minutes: number) => {
    onUpdateConfig({
      ...config,
      windowMinutes: {
        ...config.windowMinutes,
        [category]: Math.max(1, Math.min(30, minutes)),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Emergency Bypass Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Safety & Fail-Safe Emergency Controls</span>
            </h2>
            <p className="text-xs text-slate-400">
              Immediate control overrides to manage system deduplication state and fallbacks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onResetDefaults}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Reset Safe Defaults</span>
            </button>

            <button
              onClick={onToggleForceRawMode}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isForceRawMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/50'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50 animate-pulse'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{isForceRawMode ? 'DISABLE RAW MODE (RESTORE FILTER)' : 'FORCE BYPASS FILTER (RAW MODE)'}</span>
            </button>
          </div>
        </div>

        {isForceRawMode && (
          <div className="bg-red-950/70 border border-red-700/80 p-3.5 rounded-xl text-red-200 text-xs flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>
              <strong>EMERGENCY OVERRIDE ENGAGED:</strong> Filtering engine is completely disabled. All raw alerts bypass deduplication and are displayed directly to the clinician feed.
            </span>
          </div>
        )}
      </div>

      {/* Threshold & Sliding Window Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sliding Windows */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3>Category-Specific Sliding Windows (1 – 30 Minutes)</h3>
          </div>
          <p className="text-xs text-slate-400">
            Configure deduplication look-back duration per category. Duplicate alerts arriving within window consolidate into a single card.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            {(['VITAL_SIGN', 'LAB', 'PHARMACY', 'WORKFLOW', 'OTHER'] as Category[]).map(cat => (
              <div key={cat} className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-300 font-semibold">{cat}</span>
                  <span className="text-cyan-400 font-bold">{config.windowMinutes[cat]} Minutes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={config.windowMinutes[cat]}
                  onChange={e => handleWindowChange(cat, parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Safety & System Capacity Constraints */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3>Clinical Safety & System Capacity Thresholds</h3>
          </div>
          <p className="text-xs text-slate-400">
            System capacity limits enforce fail-safe fallback to RAW MODE whenever thresholds are breached.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            {/* Min History Completeness */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300 font-semibold">Min Patient History Threshold</span>
                <span className="text-red-400 font-bold">{config.minHistoryCompleteness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={config.minHistoryCompleteness}
                onChange={e =>
                  onUpdateConfig({
                    ...config,
                    minHistoryCompleteness: parseInt(e.target.value),
                  })
                }
                className="w-full accent-red-500 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-slate-500 text-xs">
                Alerts for patients with history completeness below this threshold automatically BYPASS filtering (Rule 5).
              </p>
            </div>

            {/* Max Batch Capacity */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300 font-semibold">Max Alerts Per Batch</span>
                <span className="text-amber-400 font-bold">{config.maxAlertsPerBatch} Alerts</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={config.maxAlertsPerBatch}
                onChange={e =>
                  onUpdateConfig({
                    ...config,
                    maxAlertsPerBatch: parseInt(e.target.value),
                  })
                }
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-slate-500 text-xs">
                Batch sizes exceeding this limit trigger immediate system fallback to RAW MODE (Capacity overflow protection).
              </p>
            </div>

            {/* Similarity Matching Threshold */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300 font-semibold">Similarity Matching Threshold</span>
                <span className="text-cyan-400 font-bold">{Math.round(config.similarityThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={Math.round(config.similarityThreshold * 100)}
                onChange={e =>
                  onUpdateConfig({
                    ...config,
                    similarityThreshold: parseInt(e.target.value) / 100,
                  })
                }
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
              />
              <p className="text-slate-500 text-xs">
                Minimum matching similarity required to group two alerts as duplicates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

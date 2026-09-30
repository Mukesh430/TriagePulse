import React from 'react';
import { Alert, SystemMetrics, GroundTruthEvaluation } from '../types/alert';
import { MetricCard } from '../components/MetricCard';
import { Charts } from '../components/Charts';
import { ErrorAnalysisTable } from '../components/ErrorAnalysisTable';
import { CheckCircle2, AlertOctagon, Activity, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface ExperimentMetricsProps {
  rawAlerts: Alert[];
  filteredAlerts: Alert[];
  metrics: SystemMetrics;
  evaluations: GroundTruthEvaluation[];
  onRunExperiment: () => void;
}

export const ExperimentMetrics: React.FC<ExperimentMetricsProps> = ({
  rawAlerts,
  filteredAlerts,
  metrics,
  evaluations,
  onRunExperiment,
}) => {
  return (
    <div className="space-y-6">
      {/* Experiment Runner Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Before vs After Alert-Fatigue Experiment Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dynamically executes simulated alert stream through baseline vs deduplication engine and calculates outcomes.
          </p>
        </div>

        <button
          onClick={onRunExperiment}
          className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-950/40"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-Run Experiment Pipeline</span>
        </button>
      </div>

      {/* Target Achievement Banner (NO HARDCODED SUCCESS!) */}
      <div
        className={clsx(
          'rounded-2xl p-5 border flex items-center justify-between shadow-lg',
          metrics.targetAchieved
            ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
            : 'bg-red-950/50 border-red-600/80 text-red-200'
        )}
      >
        <div className="flex items-center space-x-3">
          {metrics.targetAchieved ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertOctagon className="w-7 h-7 text-red-400 flex-shrink-0 animate-pulse" />
          )}
          <div>
            <h3 className="text-base font-bold">
              {metrics.targetAchieved ? 'SYSTEM TARGET ACHIEVED' : 'TARGET NOT ACHIEVED'}
            </h3>
            <p className="text-xs font-mono opacity-90 mt-0.5">
              {metrics.targetAchieved
                ? `Noise reduction (${metrics.noiseReduction}%) satisfies target (>=30%) while preserving 100% CRITICAL sensitivity.`
                : metrics.targetFailureReason || 'System failed to meet target noise reduction or critical sensitivity thresholds.'}
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs hidden sm:block">
          <div>Critical Sensitivity: <strong className="text-white">{metrics.criticalSensitivity}%</strong></div>
          <div>Noise Reduction: <strong className="text-white">{metrics.noiseReduction}%</strong></div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Baseline Raw Stream"
          value={metrics.totalRawAlerts}
          subtitle="Total simulated alerts"
          icon={Activity}
          variant="amber"
        />
        <MetricCard
          title="Filtered Output"
          value={metrics.totalFilteredAlerts}
          subtitle="Retained primary cards"
          icon={ShieldCheck}
          variant="cyan"
        />
        <MetricCard
          title="False Positives (FP)"
          value={metrics.falsePositives}
          subtitle="Non-actionable noise retained"
          icon={AlertOctagon}
          variant="amber"
        />
        <MetricCard
          title="False Negatives (FN)"
          value={metrics.falseNegatives}
          subtitle="Actionable alerts hidden"
          icon={AlertOctagon}
          variant={metrics.falseNegatives === 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Recharts Visualizations */}
      <Charts metrics={metrics} rawAlerts={rawAlerts} filteredAlerts={filteredAlerts} />

      {/* FP / FN Ground Truth Table */}
      <ErrorAnalysisTable evaluations={evaluations} />
    </div>
  );
};

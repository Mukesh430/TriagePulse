import React from 'react';
import { Alert, SystemMetrics } from '../types/alert';
import { AlertFeed } from '../components/AlertFeed';
import { MetricCard } from '../components/MetricCard';
import { Bell, Layers, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

interface LiveAlertTriageProps {
  rawAlerts: Alert[];
  filteredAlerts: Alert[];
  metrics: SystemMetrics;
  isRawMode: boolean;
  onToggleRawModeView: (viewRaw: boolean) => void;
  onOpenEvidence: (alert: Alert) => void;
  onOpenOverride: (alert: Alert) => void;
}

export const LiveAlertTriage: React.FC<LiveAlertTriageProps> = ({
  rawAlerts,
  filteredAlerts,
  metrics,
  isRawMode,
  onToggleRawModeView,
  onOpenEvidence,
  onOpenOverride,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Raw Stream"
          value={metrics.totalRawAlerts}
          subtitle="Unfiltered incoming alerts"
          icon={Bell}
          variant="amber"
        />
        <MetricCard
          title="Filtered Feed"
          value={metrics.totalFilteredAlerts}
          subtitle="Consolidated active cards"
          icon={Activity}
          variant="cyan"
        />
        <MetricCard
          title="Consolidated"
          value={metrics.duplicatesConsolidated}
          subtitle="Duplicates grouped in window"
          icon={Layers}
          variant="emerald"
        />
        <MetricCard
          title="Critical Sensitivity"
          value={`${metrics.criticalSensitivity}%`}
          subtitle={`${metrics.criticalAlertsRetained}/${metrics.criticalAlerts} Critical retained`}
          icon={AlertCircle}
          variant={metrics.criticalSensitivity === 100 ? 'emerald' : 'red'}
          target="100%"
        />
        <MetricCard
          title="Noise Reduction"
          value={`${metrics.noiseReduction}%`}
          subtitle="Alert volume reduction"
          icon={ShieldCheck}
          variant={metrics.noiseReduction >= 30 ? 'emerald' : 'amber'}
          target=">= 30%"
        />
      </div>

      {/* Main Alert Feed */}
      <AlertFeed
        rawAlerts={rawAlerts}
        filteredAlerts={filteredAlerts}
        isRawMode={isRawMode}
        onToggleRawModeView={onToggleRawModeView}
        onOpenEvidence={onOpenEvidence}
        onOpenOverride={onOpenOverride}
      />
    </div>
  );
};

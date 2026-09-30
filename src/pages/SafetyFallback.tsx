import React from 'react';
import { ThresholdConfig, SystemMetrics } from '../types/alert';
import { SafetyControls } from '../components/SafetyControls';
import { EdgeCasePanel } from '../components/EdgeCasePanel';
import { SafetyValidationGate } from '../components/SafetyValidationGate';

interface SafetyFallbackProps {
  config: ThresholdConfig;
  metrics: SystemMetrics;
  isForceRawMode: boolean;
  isFallback: boolean;
  edgeCasesPassed: boolean;
  onUpdateConfig: (newConfig: ThresholdConfig) => void;
  onToggleForceRawMode: () => void;
  onResetDefaults: () => void;
  onEdgeCaseResultsUpdate: (allPassed: boolean) => void;
}

export const SafetyFallback: React.FC<SafetyFallbackProps> = ({
  config,
  metrics,
  isForceRawMode,
  isFallback,
  edgeCasesPassed,
  onUpdateConfig,
  onToggleForceRawMode,
  onResetDefaults,
  onEdgeCaseResultsUpdate,
}) => {
  return (
    <div className="space-y-6">
      {/* Emergency Control Sliders & Buttons */}
      <SafetyControls
        config={config}
        isForceRawMode={isForceRawMode}
        onUpdateConfig={onUpdateConfig}
        onToggleForceRawMode={onToggleForceRawMode}
        onResetDefaults={onResetDefaults}
      />

      {/* Pre-Deployment Safety Gate */}
      <SafetyValidationGate
        metrics={metrics}
        isRawMode={isForceRawMode}
        isFallback={isFallback}
        edgeCasesPassed={edgeCasesPassed}
      />

      {/* Interactive Edge Cases */}
      <EdgeCasePanel
        config={config}
        onEdgeCaseResultsUpdate={onEdgeCaseResultsUpdate}
      />
    </div>
  );
};

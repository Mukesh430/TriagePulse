import { useState, useMemo, useCallback } from 'react';
import { INITIAL_ALERTS, DEFAULT_THRESHOLDS } from './data/simulatedData';
import { Alert, ThresholdConfig, OverrideRecord } from './types/alert';
import { processAlerts } from './utils/alertProcessor';
import { calculateMetrics } from './utils/metrics';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { OverrideModal } from './components/OverrideModal';
import { AuditLogModal } from './components/AuditLogModal';
import { LiveAlertTriage } from './pages/LiveAlertTriage';
import { SafetyFallback } from './pages/SafetyFallback';
import { ExperimentMetrics } from './pages/ExperimentMetrics';
import { DocsRiskRegister } from './pages/DocsRiskRegister';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('triage');
  const [rawAlerts, setRawAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [config, setConfig] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [isForceRawMode, setIsForceRawMode] = useState<boolean>(false);

  // Modals & Drawers
  const [activeEvidenceAlert, setActiveEvidenceAlert] = useState<Alert | null>(null);
  const [activeOverrideAlert, setActiveOverrideAlert] = useState<Alert | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [edgeCasesPassed, setEdgeCasesPassed] = useState<boolean>(true);

  // Dynamic Alert Processing Pipeline
  const processorResult = useMemo(() => {
    return processAlerts(rawAlerts, config, isForceRawMode);
  }, [rawAlerts, config, isForceRawMode]);

  // Dynamic Metrics & Error Evaluations Calculation
  const { metrics, evaluations } = useMemo(() => {
    return calculateMetrics(
      rawAlerts,
      processorResult.allAlertsWithDecisions,
      processorResult.processedAlerts,
      processorResult.processingTimeMs
    );
  }, [rawAlerts, processorResult]);

  // Handle Clinician Override Submission
  const handleOverrideSubmit = useCallback((override: OverrideRecord) => {
    setRawAlerts(prev =>
      prev.map(alert => {
        if (alert.id === override.alertId) {
          return {
            ...alert,
            override,
            clinicianResponse: 'OVERRIDDEN',
          };
        }
        return alert;
      })
    );
  }, []);

  // Handle Re-Running Experiment Pipeline
  const handleRunExperiment = useCallback(() => {
    // Re-trigger dynamic calculation & timestamp update
    setRawAlerts([...rawAlerts]);
  }, [rawAlerts]);

  // Reset to Safe Defaults
  const handleResetDefaults = useCallback(() => {
    setConfig(DEFAULT_THRESHOLDS);
    setIsForceRawMode(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        isRawMode={processorResult.isRawMode}
        isFallback={processorResult.isFallbackTriggered}
        fallbackReason={processorResult.fallbackReason}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onToggleRawMode={() => setIsForceRawMode(prev => !prev)}
      />

      {/* Navigation Bar */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Page View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'triage' && (
          <LiveAlertTriage
            rawAlerts={rawAlerts}
            filteredAlerts={processorResult.processedAlerts}
            metrics={metrics}
            isRawMode={processorResult.isRawMode}
            onToggleRawModeView={viewRaw => setIsForceRawMode(viewRaw)}
            onOpenEvidence={alert => setActiveEvidenceAlert(alert)}
            onOpenOverride={alert => setActiveOverrideAlert(alert)}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyFallback
            config={config}
            metrics={metrics}
            isForceRawMode={isForceRawMode}
            isFallback={processorResult.isFallbackTriggered}
            edgeCasesPassed={edgeCasesPassed}
            onUpdateConfig={setConfig}
            onToggleForceRawMode={() => setIsForceRawMode(prev => !prev)}
            onResetDefaults={handleResetDefaults}
            onEdgeCaseResultsUpdate={setEdgeCasesPassed}
          />
        )}

        {activeTab === 'metrics' && (
          <ExperimentMetrics
            rawAlerts={rawAlerts}
            filteredAlerts={processorResult.processedAlerts}
            metrics={metrics}
            evaluations={evaluations}
            onRunExperiment={handleRunExperiment}
          />
        )}

        {activeTab === 'docs' && <DocsRiskRegister />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        TriagePulse ED Alert-Fatigue Analyzer — Safety-First Deduplication Prototype (Simulated Data Only)
      </footer>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        alert={activeEvidenceAlert}
        onClose={() => setActiveEvidenceAlert(null)}
      />

      {/* Clinician Override Modal */}
      <OverrideModal
        alert={activeOverrideAlert}
        onClose={() => setActiveOverrideAlert(null)}
        onSubmitOverride={handleOverrideSubmit}
      />

      {/* Transaction Audit Log Modal */}
      <AuditLogModal
        logs={processorResult.auditLogs}
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />
    </div>
  );
}

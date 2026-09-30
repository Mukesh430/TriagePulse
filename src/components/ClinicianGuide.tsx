import React from 'react';
import { BookOpen, ShieldAlert, Layers, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export const ClinicianGuide: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-cyan-950 border border-cyan-700/50 rounded-xl text-cyan-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Clinician Operational Guide</h3>
          <p className="text-xs text-slate-400">Instructions for ED nurses, physicians, and triage coordinators</p>
        </div>
      </div>

      {/* Mandatory Safety Boundary Alert */}
      <div className="bg-red-950/60 border border-red-700/80 p-4 rounded-xl text-red-200 text-xs sm:text-sm space-y-1">
        <div className="flex items-center space-x-2 font-bold text-red-300 uppercase tracking-wider">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>NON-NEGOTIABLE CLINICAL SAFETY BOUNDARY</span>
        </div>
        <p className="leading-relaxed">
          <strong>TriagePulse does NOT make autonomous diagnoses, treatment decisions, medication orders, or triage level assignments.</strong> It functions exclusively as an alert consolidation, deduplication, and fatigue-reduction analyzer. All diagnostic and clinical decisions remain entirely with qualified human clinicians.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
        {/* Section 1: Modes */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-cyan-400">
            <Layers className="w-4 h-4" />
            <h4>1. Consolidated Feed vs. Raw Mode</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong>Consolidated Feed:</strong> Deduplicates repetitive telemetry/lab noise within category-specific sliding windows (e.g. 2 mins for vitals). Displays single primary alert cards with duplicate counts.
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong>Raw Stream:</strong> Displays the complete, unfiltered feed of all incoming telemetry signals without consolidation.
          </p>
        </div>

        {/* Section 2: Non-Suppression Safety Rules */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <h4>2. Strict Safety Non-Suppression Rules</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong>Rule 1 (CRITICAL Priority):</strong> All CRITICAL alerts (e.g., Cardiac Arrest, Severe Hypoxia, Bradycardia) NEVER undergo suppression or hiding.
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong>Rule 2 (Incomplete History):</strong> If patient history completeness is &lt; 30%, filtering is automatically bypassed to protect unknown baseline patients.
          </p>
        </div>

        {/* Section 3: Traceable Evidence */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-amber-400">
            <FileText className="w-4 h-4" />
            <h4>3. Traceable Evidence Drawer</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Clicking <strong>&quot;Evidence&quot;</strong> on any alert card expands a drawer detailing original timestamps, signal telemetry readings, expected reference ranges, confidence scores, and rule trigger rationales.
          </p>
        </div>

        {/* Section 4: Clinician Override */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
            <h4>4. Clinician Override & Accountability</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Clinicians can override any system consolidation or suppression decision. Overriding requires selecting a mandatory clinical reason and providing free-text feedback, which is immediately recorded in the immutable audit log.
          </p>
        </div>
      </div>
    </div>
  );
};

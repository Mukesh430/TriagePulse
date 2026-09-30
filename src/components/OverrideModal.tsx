import React, { useState } from 'react';
import { Alert, OverrideRecord } from '../types/alert';
import { X, UserCheck, AlertTriangle } from 'lucide-react';

interface OverrideModalProps {
  alert: Alert | null;
  onClose: () => void;
  onSubmitOverride: (override: OverrideRecord) => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  alert,
  onClose,
  onSubmitOverride,
}) => {
  const [reason, setReason] = useState<string>('Alert is clinically relevant');
  const [feedback, setFeedback] = useState<string>('');
  const [clinicianId, setClinicianId] = useState<string>('MD-8492 (Dr. Alex Mercer)');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!alert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setErrorMsg('Mandatory free-text feedback is required for clinical override accountability.');
      return;
    }

    const override: OverrideRecord = {
      alertId: alert.id,
      clinicianId,
      action: 'CLINICIAN_OVERRIDE',
      reason,
      feedback: feedback.trim(),
      timestamp: new Date().toISOString(),
    };

    onSubmitOverride(override);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-950/60 border border-amber-600/40 rounded-xl text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Record Clinician Override</h2>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Target Alert Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-xs text-slate-400 font-mono">Patient: {alert.patientId}</span>
            <p className="text-xs font-semibold text-slate-200">{alert.message}</p>
          </div>

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-700/80 text-red-300 p-3 rounded-lg flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Clinician ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clinician Identifier / Session
            </label>
            <input
              type="text"
              value={clinicianId}
              onChange={e => setClinicianId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Mandatory Reason Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mandatory Override Reason <span className="text-red-400">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Alert is clinically relevant">Alert is clinically relevant</option>
              <option value="Duplicate was actually meaningful">Duplicate was actually meaningful</option>
              <option value="Patient condition changed">Patient condition changed</option>
              <option value="System consolidation was incorrect">System consolidation was incorrect</option>
              <option value="Need raw alert visibility">Need raw alert visibility</option>
              <option value="Other">Other clinical reason</option>
            </select>
          </div>

          {/* Mandatory Free-text Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mandatory Feedback & Clinical Justification <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide specific clinical reasoning for overriding this alert decision..."
              value={feedback}
              onChange={e => {
                setFeedback(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-slate-500 text-xs mt-1">
              Required for hospital safety audit compliance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Submit Clinician Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

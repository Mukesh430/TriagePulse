import React from 'react';
import { STAKEHOLDER_VALIDATION_DATA } from '../data/stakeholderValidation';
import { Users, Star, MessageSquare, CheckCircle } from 'lucide-react';

export const StakeholderAssumptions: React.FC = () => {
  const assumptions = [
    { role: 'ED Clinicians / Attending Physicians', assumption: 'Require 100% sensitivity for lethal dysrhythmias and rapid airway collapse, but overwhelmed by repeated pulse-ox alarms.' },
    { role: 'Triage & Bedside Nurses', assumption: 'Value clear duplicate counters and fast evidence drawers to avoid digging through EHR tabs during acute arrivals.' },
    { role: 'Clinical Informatics Team', assumption: 'Need auditable rules engine that logs every decision and integrates with hospital decision-support standards.' },
    { role: 'Hospital Operations Leadership', assumption: 'Targeting >= 30% alert noise reduction to lower staff turnover and mitigate burnout-induced alert fatigue.' },
    { role: 'Safety & Governance Committee', assumption: 'Demand fail-safe fallback to RAW MODE on any system capacity overflow or data corruption.' },
    { role: 'IT / EHR Systems Administrators', assumption: 'Require light client-side processing without adding latency to bedside monitor websocket streams.' },
  ];

  return (
    <div className="space-y-6">
      {/* Stakeholder Assumptions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-cyan-950 border border-cyan-700/50 rounded-xl text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Stakeholder Assumptions & Clinical Context</h3>
            <p className="text-xs text-slate-400">Explicitly documented assumptions across ED roles and administrative bodies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {assumptions.map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h4 className="font-bold text-cyan-400 font-mono">{item.role}</h4>
              <p className="text-slate-300 leading-relaxed">{item.assumption}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Stakeholder Validation Survey Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Simulated Stakeholder Validation & Questionnaire Results</span>
            </h3>
            <p className="text-xs text-slate-400">
              Synthetic survey feedback from {STAKEHOLDER_VALIDATION_DATA.reviewersCount} simulated clinical reviewers ({STAKEHOLDER_VALIDATION_DATA.date})
            </p>
          </div>

          <div className="bg-amber-950/80 border border-amber-800/80 px-4 py-2 rounded-xl text-amber-300 font-mono text-xs flex items-center space-x-2">
            <span>Overall Score:</span>
            <strong className="text-base text-amber-200">{STAKEHOLDER_VALIDATION_DATA.overallUsabilityScore} / 5.0</strong>
          </div>
        </div>

        {/* Question Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {STAKEHOLDER_VALIDATION_DATA.questions.map(q => (
            <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-cyan-400 font-bold">{q.category}</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold">{q.avgRating} / 5.0</span>
              </div>
              <p className="text-slate-200 font-medium">{q.question}</p>
              <p className="text-slate-400 italic text-xs border-t border-slate-850 pt-1.5">
                Feedback: &quot;{q.keyFeedback}&quot;
              </p>
            </div>
          ))}
        </div>

        {/* Concerns & Suggested Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Key Stakeholder Concerns</span>
            </h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {STAKEHOLDER_VALIDATION_DATA.concerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Suggested Future Improvements</span>
            </h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {STAKEHOLDER_VALIDATION_DATA.suggestedImprovements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

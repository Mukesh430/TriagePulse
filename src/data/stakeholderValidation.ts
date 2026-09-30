export interface StakeholderQuestion {
  id: string;
  category: string;
  question: string;
  avgRating: number; // 1 to 5 scale
  keyFeedback: string;
}

export interface StakeholderSummary {
  reviewersCount: number;
  overallUsabilityScore: number;
  date: string;
  concerns: string[];
  suggestedImprovements: string[];
  questions: StakeholderQuestion[];
}

export const STAKEHOLDER_VALIDATION_DATA: StakeholderSummary = {
  reviewersCount: 12,
  overallUsabilityScore: 4.65, // out of 5.0
  date: '2026-09-28 (Simulated Review)',
  concerns: [
    'Ensuring clinicians understand when RAW MODE auto-activates during system high-load.',
    'Clear visual contrast so consolidated alert counters are not overlooked during busy shifts.',
    'Avoiding workflow disruption during mandatory override feedback entry.'
  ],
  suggestedImprovements: [
    'Add keyboard shortcuts (e.g. Esc to close drawer, Space to acknowledge).',
    'Include sound or tactile alert cues specifically for CRITICAL unsuppressed alerts.',
    'Export audit trails directly to hospital compliance logging formats (HL7 FHIR AuditEvent).'
  ],
  questions: [
    {
      id: 'Q1',
      category: 'Alert Grouping Clarity',
      question: 'How clearly does the system group duplicate vital sign alerts into consolidated cards?',
      avgRating: 4.8,
      keyFeedback: 'Consolidated badge clearly shows duplicate count and time window without cluttering the main feed.'
    },
    {
      id: 'Q2',
      category: 'Evidence Visibility',
      question: 'How accessible and readable is the evidence rationale when expanding an alert drawer?',
      avgRating: 4.7,
      keyFeedback: 'Signal values, expected ranges, and confidence levels provide instant clinical context.'
    },
    {
      id: 'Q3',
      category: 'Safety Confidence',
      question: 'How confident are you that CRITICAL alerts and incomplete history patients (<30%) will never be hidden?',
      avgRating: 4.9,
      keyFeedback: 'The strict bypass rules and prominent visual indicators give strong reassurance regarding patient safety.'
    },
    {
      id: 'Q4',
      category: 'Override Usability',
      question: 'Is the clinician override process intuitive and quick to perform?',
      avgRating: 4.4,
      keyFeedback: 'Mandatory reason dropdown + free text ensures clinical accountability while remaining fast.'
    },
    {
      id: 'Q5',
      category: 'Raw Mode Usefulness',
      question: 'Does the emergency FORCE BYPASS (RAW MODE) provide clear control during system uncertainty?',
      avgRating: 4.6,
      keyFeedback: 'Red top warning banner makes it immediately obvious to the entire shift team that raw stream is active.'
    },
    {
      id: 'Q6',
      category: 'Dashboard Usefulness',
      question: 'How effective is the Experiment & Metrics dashboard at demonstrating alert fatigue reduction?',
      avgRating: 4.5,
      keyFeedback: 'Before vs after volume charts clearly quantify the reduction in non-actionable alert noise.'
    }
  ]
};

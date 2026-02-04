export type StageId = 
  | 'target'
  | 'first_contact'
  | 'in_conversation'
  | 'pitch_shared'
  | 'due_diligence'
  | 'term_sheet'
  | 'committed'
  | 'passed';

export interface Stage {
  id: StageId;
  name: string;
  emoji: string;
  color: string; // Tailwind color class
  order: number;
}

export const STAGES: Stage[] = [
  { id: 'target', name: 'Target', emoji: '🎯', color: 'slate', order: 0 },
  { id: 'first_contact', name: 'First Contact', emoji: '📧', color: 'blue', order: 1 },
  { id: 'in_conversation', name: 'In Conversation', emoji: '💬', color: 'cyan', order: 2 },
  { id: 'pitch_shared', name: 'Pitch Shared', emoji: '📊', color: 'purple', order: 3 },
  { id: 'due_diligence', name: 'Due Diligence', emoji: '🔍', color: 'amber', order: 4 },
  { id: 'term_sheet', name: 'Term Sheet', emoji: '📝', color: 'orange', order: 5 },
  { id: 'committed', name: 'Committed', emoji: '✅', color: 'green', order: 6 },
  { id: 'passed', name: 'Passed', emoji: '❌', color: 'red', order: 7 },
];

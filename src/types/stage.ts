export type StageId = string;

export interface Stage {
  id: StageId;
  name: string;
  emoji: string;
  color: string; // Tailwind color class
  order: number;
  isDefault?: boolean;
}

export const DEFAULT_STAGES: Stage[] = [
  { id: 'target', name: 'Target', emoji: '🎯', color: 'slate', order: 0, isDefault: true },
  { id: 'first_contact', name: 'First Contact', emoji: '📧', color: 'blue', order: 1, isDefault: true },
  { id: 'in_conversation', name: 'In Conversation', emoji: '💬', color: 'cyan', order: 2, isDefault: true },
  { id: 'pitch_shared', name: 'Pitch Shared', emoji: '📊', color: 'purple', order: 3, isDefault: true },
  { id: 'due_diligence', name: 'Due Diligence', emoji: '🔍', color: 'amber', order: 4, isDefault: true },
  { id: 'term_sheet', name: 'Term Sheet', emoji: '📝', color: 'orange', order: 5, isDefault: true },
  { id: 'committed', name: 'Committed', emoji: '✅', color: 'green', order: 6, isDefault: true },
  { id: 'passed', name: 'Passed', emoji: '❌', color: 'red', order: 7, isDefault: true },
];

/** @deprecated Use DEFAULT_STAGES or useStages() hook instead */
export const STAGES = DEFAULT_STAGES;

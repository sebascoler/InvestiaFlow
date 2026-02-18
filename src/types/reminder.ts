export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface FollowUpRule {
  id: string;
  stageId: string;       // '*' = all stages, or specific stage ID
  daysSinceContact: number;
  priority: ReminderPriority;
  message: string;       // Custom message template
}

export interface FollowUpReminder {
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadFirm: string;
  leadStage: string;
  daysSinceContact: number;
  priority: ReminderPriority;
  message: string;
  rule: FollowUpRule;
}

export const DEFAULT_FOLLOW_UP_RULES: FollowUpRule[] = [
  { id: 'default-all', stageId: '*', daysSinceContact: 14, priority: 'medium', message: 'Follow up needed' },
  { id: 'default-dd', stageId: 'due_diligence', daysSinceContact: 7, priority: 'high', message: 'Due diligence stalled' },
  { id: 'default-ts', stageId: 'term_sheet', daysSinceContact: 5, priority: 'urgent', message: 'Term sheet follow-up urgent' },
];

export const PRIORITY_CONFIG: Record<ReminderPriority, { color: string; bgColor: string; borderColor: string; label: string; order: number }> = {
  urgent: { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'Urgent', order: 0 },
  high: { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', label: 'High', order: 1 },
  medium: { color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', label: 'Medium', order: 2 },
  low: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Low', order: 3 },
};

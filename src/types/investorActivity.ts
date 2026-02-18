export type InvestorActivityType = 'viewed' | 'downloaded' | 'question_asked' | 'login';

export interface InvestorActivity {
  id: string;
  teamId: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  type: InvestorActivityType;
  documentId: string | null;
  documentName: string | null;
  createdAt: Date;
}

export const ACTIVITY_CONFIG: Record<InvestorActivityType, { emoji: string; label: string; color: string }> = {
  viewed: { emoji: '👁️', label: 'Viewed document', color: 'text-blue-600' },
  downloaded: { emoji: '📥', label: 'Downloaded document', color: 'text-green-600' },
  question_asked: { emoji: '❓', label: 'Asked a question', color: 'text-purple-600' },
  login: { emoji: '🔑', label: 'Logged in to Data Room', color: 'text-gray-600' },
};

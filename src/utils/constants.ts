import { STAGES } from '../types/stage';

export { STAGES };

export const STAGE_COLORS: Record<string, { bg: string; border: string }> = {
  target: { bg: 'bg-slate-100', border: 'border-slate-300' },
  first_contact: { bg: 'bg-blue-100', border: 'border-blue-300' },
  in_conversation: { bg: 'bg-cyan-100', border: 'border-cyan-300' },
  pitch_shared: { bg: 'bg-purple-100', border: 'border-purple-300' },
  due_diligence: { bg: 'bg-amber-100', border: 'border-amber-300' },
  term_sheet: { bg: 'bg-orange-100', border: 'border-orange-300' },
  committed: { bg: 'bg-green-100', border: 'border-green-300' },
  passed: { bg: 'bg-red-100', border: 'border-red-300' },
};

export const FOLLOW_UP_DAYS = 14;

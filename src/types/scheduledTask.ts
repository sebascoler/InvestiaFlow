import { Lead } from './lead';
import { AutomationRule } from './automation';

export interface ScheduledTask {
  id: string;
  userId: string;
  leadId: string;
  ruleId: string;
  scheduledAt: Date; // Fecha/hora en que debe ejecutarse
  executedAt: Date | null; // Fecha/hora en que se ejecutó (null si aún no se ejecutó)
  status: 'pending' | 'executing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
}

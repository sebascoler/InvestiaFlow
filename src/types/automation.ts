import { StageId } from './stage';

export interface AutomationRule {
  id: string;
  userId: string; // Owner - kept for backward compatibility
  teamId?: string; // Team that owns this rule (new field)
  name: string;
  triggerStage: StageId;
  documentIds: string[];
  delayDays: number;
  emailSubject: string;
  emailBody: string; // Soporta variables: {{name}}, {{firm}}, etc.
  isActive: boolean;
  createdAt: Date;
}

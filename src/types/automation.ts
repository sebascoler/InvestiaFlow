import { StageId } from './stage';

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  triggerStage: StageId;
  documentIds: string[];
  delayDays: number;
  emailSubject: string;
  emailBody: string; // Soporta variables: {{name}}, {{firm}}, etc.
  isActive: boolean;
  createdAt: Date;
}

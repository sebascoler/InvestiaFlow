import { StageId } from './stage';

export type ActivityType = 
  | 'created'
  | 'updated'
  | 'stage_changed'
  | 'note_added'
  | 'document_shared'
  | 'tag_added'
  | 'tag_removed';

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: {
    fromStage?: StageId;
    toStage?: StageId;
    field?: string;
    oldValue?: any;
    newValue?: any;
    tags?: string[];
    documentId?: string;
    documentName?: string;
  };
  createdAt: Date;
}

export interface Comment {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

import { StageId } from './stage';

export interface Lead {
  id: string;
  userId: string; // Owner (founder)
  name: string;
  email: string;
  firm: string;
  stage: StageId;
  stageEnteredAt: Date; // Fecha en que el lead entró al stage actual
  createdAt: Date;
  updatedAt: Date;
  lastContactDate: Date | null;
  notes: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  tags?: string[]; // Tags/etiquetas para categorizar leads
  customFields?: Record<string, any>;
}

// Helper para asegurar que un lead tenga stageEnteredAt
export const ensureStageEnteredAt = (lead: Lead): Lead => {
  if (!lead.stageEnteredAt) {
    return {
      ...lead,
      stageEnteredAt: lead.createdAt, // Fallback a createdAt si no existe
    };
  }
  return lead;
};

export interface LeadFormData {
  name: string;
  email: string;
  firm: string;
  notes?: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  tags?: string[];
}

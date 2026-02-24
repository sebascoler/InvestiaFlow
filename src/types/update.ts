export type UpdateStatus = 'draft' | 'marked_sent';

export type UpdateCadence = 'monthly' | 'quarterly' | 'custom';

export interface InvestorUpdate {
  id: string;
  teamId: string;
  title: string;
  highlights: string;
  metrics: string;
  progress: string;
  asks: string;
  focus: string;
  status: UpdateStatus;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

export interface UpdateCadenceSettings {
  cadence: UpdateCadence;
  customDays?: number; // only used when cadence === 'custom'
  lastUpdateGeneratedAt?: Date;
}

export interface InvestorVerificationCode {
  id: string;
  email: string;
  code: string; // 6 dígitos
  leadId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface InvestorSession {
  sessionToken: string;
  leadId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface InvestorDocument {
  id: string;
  documentId: string;
  name: string;
  category: string;
  description?: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date | string;
  sharedAt: Date | string;
  viewedAt: Date | string | null;
  downloadedAt: Date | string | null;
  downloadUrl?: string;
}

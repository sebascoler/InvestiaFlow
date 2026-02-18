export type QAThreadStatus = 'open' | 'answered' | 'closed';
export type QASenderType = 'investor' | 'founder';

export interface QAThread {
  id: string;
  teamId: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  documentId: string | null;    // null = general question
  documentName: string | null;
  subject: string;
  status: QAThreadStatus;
  lastMessageBy: QASenderType;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QAMessage {
  id: string;
  threadId: string;
  senderType: QASenderType;
  senderName: string;
  senderId: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
}

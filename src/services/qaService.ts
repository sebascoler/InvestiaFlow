import { QAThread, QAMessage } from '../types/qa';

const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Mock data
const mockThreads: QAThread[] = [
  {
    id: 'thread-1',
    teamId: 'team-1',
    leadId: 'lead-1',
    leadName: 'John Smith',
    leadEmail: 'john@venture.com',
    documentId: 'doc-1',
    documentName: 'Pitch Deck Q4 2024',
    subject: 'Revenue projections methodology',
    status: 'open',
    lastMessageBy: 'investor',
    messageCount: 2,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'thread-2',
    teamId: 'team-1',
    leadId: 'lead-2',
    leadName: 'Sarah Johnson',
    leadEmail: 'sarah@capital.com',
    documentId: null,
    documentName: null,
    subject: 'Timeline for Series A close',
    status: 'answered',
    lastMessageBy: 'founder',
    messageCount: 4,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'thread-3',
    teamId: 'team-1',
    leadId: 'lead-3',
    leadName: 'Mike Chen',
    leadEmail: 'mike@fund.com',
    documentId: 'doc-2',
    documentName: 'Financial Model',
    subject: 'Unit economics breakdown',
    status: 'open',
    lastMessageBy: 'investor',
    messageCount: 1,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

const mockMessages: Record<string, QAMessage[]> = {
  'thread-1': [
    {
      id: 'msg-1',
      threadId: 'thread-1',
      senderType: 'investor',
      senderName: 'John Smith',
      senderId: 'lead-1',
      content: 'Could you explain the methodology behind the revenue projections in slide 12? The growth assumptions seem aggressive for the market.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'msg-2',
      threadId: 'thread-1',
      senderType: 'investor',
      senderName: 'John Smith',
      senderId: 'lead-1',
      content: 'Also, what is the customer acquisition cost trend looking like for the past 6 months?',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      readAt: null,
    },
  ],
  'thread-2': [
    {
      id: 'msg-3',
      threadId: 'thread-2',
      senderType: 'investor',
      senderName: 'Sarah Johnson',
      senderId: 'lead-2',
      content: 'When do you expect to close the Series A round?',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'msg-4',
      threadId: 'thread-2',
      senderType: 'founder',
      senderName: 'Demo User',
      senderId: 'user-1',
      content: 'We are targeting end of Q1. We have strong interest from several funds and are finalizing terms.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'msg-5',
      threadId: 'thread-2',
      senderType: 'investor',
      senderName: 'Sarah Johnson',
      senderId: 'lead-2',
      content: 'Great, please keep us updated on the timeline.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'msg-6',
      threadId: 'thread-2',
      senderType: 'founder',
      senderName: 'Demo User',
      senderId: 'user-1',
      content: 'Will do! We should have more concrete dates by next week.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      readAt: null,
    },
  ],
  'thread-3': [
    {
      id: 'msg-7',
      threadId: 'thread-3',
      senderType: 'investor',
      senderName: 'Mike Chen',
      senderId: 'lead-3',
      content: 'Can you provide a more detailed breakdown of the unit economics? Specifically the LTV:CAC ratio and payback period.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      readAt: null,
    },
  ],
};

const mockService = {
  async getThreads(teamId: string): Promise<QAThread[]> {
    return [...mockThreads]
      .filter(t => t.teamId === teamId || !teamId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  async getThreadsForLead(leadId: string): Promise<QAThread[]> {
    return [...mockThreads]
      .filter(t => t.leadId === leadId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  async getMessages(threadId: string): Promise<QAMessage[]> {
    return [...(mockMessages[threadId] || [])].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  },

  async sendMessage(threadId: string, content: string, senderType: 'founder' | 'investor', senderName: string, senderId: string): Promise<QAMessage> {
    const newMessage: QAMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderType,
      senderName,
      senderId,
      content,
      createdAt: new Date(),
      readAt: null,
    };

    if (!mockMessages[threadId]) {
      mockMessages[threadId] = [];
    }
    mockMessages[threadId].push(newMessage);

    // Update thread
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.lastMessageBy = senderType;
      thread.messageCount += 1;
      thread.updatedAt = new Date();
      if (senderType === 'founder') {
        thread.status = 'answered';
      }
    }

    return newMessage;
  },

  async updateThreadStatus(threadId: string, status: 'open' | 'answered' | 'closed'): Promise<void> {
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.status = status;
      thread.updatedAt = new Date();
    }
  },
};

async function getFirebaseService() {
  const mod = await import('./qaService.firebase');
  return mod.firebaseQAService;
}

export const qaService = {
  async getThreads(teamId: string): Promise<QAThread[]> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.getThreads(teamId);
    }
    return mockService.getThreads(teamId);
  },

  async getThreadsForLead(leadId: string): Promise<QAThread[]> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.getThreadsForLead(leadId);
    }
    return mockService.getThreadsForLead(leadId);
  },

  async getMessages(threadId: string): Promise<QAMessage[]> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.getMessages(threadId);
    }
    return mockService.getMessages(threadId);
  },

  async sendMessage(threadId: string, content: string, senderType: 'founder' | 'investor', senderName: string, senderId: string): Promise<QAMessage> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.sendMessage(threadId, content, senderType, senderName, senderId);
    }
    return mockService.sendMessage(threadId, content, senderType, senderName, senderId);
  },

  async updateThreadStatus(threadId: string, status: 'open' | 'answered' | 'closed'): Promise<void> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.updateThreadStatus(threadId, status);
    }
    return mockService.updateThreadStatus(threadId, status);
  },
};

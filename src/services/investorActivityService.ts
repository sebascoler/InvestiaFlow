import { InvestorActivity } from '../types/investorActivity';

const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Generate realistic sample data
function generateMockActivities(): InvestorActivity[] {
  const now = new Date();
  return [
    {
      id: 'act-1',
      teamId: 'team-1',
      leadId: 'lead-1',
      leadName: 'John Smith',
      leadEmail: 'john@venture.com',
      type: 'viewed',
      documentId: 'doc-1',
      documentName: 'Pitch Deck Q4 2024',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'act-2',
      teamId: 'team-1',
      leadId: 'lead-2',
      leadName: 'Sarah Johnson',
      leadEmail: 'sarah@capital.com',
      type: 'downloaded',
      documentId: 'doc-2',
      documentName: 'Financial Model',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: 'act-3',
      teamId: 'team-1',
      leadId: 'lead-1',
      leadName: 'John Smith',
      leadEmail: 'john@venture.com',
      type: 'downloaded',
      documentId: 'doc-1',
      documentName: 'Pitch Deck Q4 2024',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 'act-4',
      teamId: 'team-1',
      leadId: 'lead-3',
      leadName: 'Mike Chen',
      leadEmail: 'mike@fund.com',
      type: 'login',
      documentId: null,
      documentName: null,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: 'act-5',
      teamId: 'team-1',
      leadId: 'lead-3',
      leadName: 'Mike Chen',
      leadEmail: 'mike@fund.com',
      type: 'viewed',
      documentId: 'doc-3',
      documentName: 'Cap Table',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];
}

// Mock implementation
const mockService = {
  async getActivities(teamId: string, limit: number = 50): Promise<InvestorActivity[]> {
    return generateMockActivities()
      .filter(a => a.teamId === teamId || !teamId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async getActivitiesForLead(leadId: string, limit: number = 20): Promise<InvestorActivity[]> {
    return generateMockActivities()
      .filter(a => a.leadId === leadId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },
};

// Lazy Firebase implementation
async function getFirebaseService() {
  const mod = await import('./investorActivityService.firebase');
  return mod.firebaseInvestorActivityService;
}

export const investorActivityService = {
  async getActivities(teamId: string, limit?: number): Promise<InvestorActivity[]> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.getActivities(teamId, limit);
    }
    return mockService.getActivities(teamId, limit);
  },

  async getActivitiesForLead(leadId: string, limit?: number): Promise<InvestorActivity[]> {
    if (USE_FIREBASE) {
      const service = await getFirebaseService();
      return service.getActivitiesForLead(leadId, limit);
    }
    return mockService.getActivitiesForLead(leadId, limit);
  },
};

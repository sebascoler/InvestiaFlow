import { InvestorUpdate } from '../types/update';

// In-memory storage for mock mode
let updatesDB: InvestorUpdate[] = [];

const updateServiceMock = {
  async getUpdates(teamId: string): Promise<InvestorUpdate[]> {
    return updatesDB
      .filter(u => u.teamId === teamId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getUpdate(id: string): Promise<InvestorUpdate | null> {
    return updatesDB.find(u => u.id === id) || null;
  },

  async createUpdate(teamId: string, data: Partial<InvestorUpdate>): Promise<InvestorUpdate> {
    const now = new Date();
    const update: InvestorUpdate = {
      id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      teamId,
      title: data.title || `Investor Update — ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      highlights: data.highlights || '',
      metrics: data.metrics || '',
      progress: data.progress || '',
      asks: data.asks || '',
      focus: data.focus || '',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    updatesDB.push(update);
    return update;
  },

  async saveUpdate(id: string, data: Partial<InvestorUpdate>): Promise<InvestorUpdate> {
    const index = updatesDB.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Update not found');

    updatesDB[index] = {
      ...updatesDB[index],
      ...data,
      updatedAt: new Date(),
    };
    return updatesDB[index];
  },

  async markAsSent(id: string): Promise<InvestorUpdate> {
    const index = updatesDB.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Update not found');

    const now = new Date();
    updatesDB[index] = {
      ...updatesDB[index],
      status: 'marked_sent',
      sentAt: now,
      updatedAt: now,
    };
    return updatesDB[index];
  },

  async deleteUpdate(id: string): Promise<void> {
    updatesDB = updatesDB.filter(u => u.id !== id);
  },
};

// Firebase implementation
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

let firebaseService: typeof updateServiceMock | null = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;

  try {
    const mod = await import('./updateService.firebase');
    firebaseService = mod.updateServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('[updateService] Firebase not available, using mock:', error);
    return null;
  }
};

export const updateService = {
  async getUpdates(teamId: string): Promise<InvestorUpdate[]> {
    const service = await getFirebaseService();
    return service ? service.getUpdates(teamId) : updateServiceMock.getUpdates(teamId);
  },

  async getUpdate(id: string): Promise<InvestorUpdate | null> {
    const service = await getFirebaseService();
    return service ? service.getUpdate(id) : updateServiceMock.getUpdate(id);
  },

  async createUpdate(teamId: string, data?: Partial<InvestorUpdate>): Promise<InvestorUpdate> {
    const service = await getFirebaseService();
    return service
      ? service.createUpdate(teamId, data || {})
      : updateServiceMock.createUpdate(teamId, data || {});
  },

  async saveUpdate(id: string, data: Partial<InvestorUpdate>): Promise<InvestorUpdate> {
    const service = await getFirebaseService();
    return service
      ? service.saveUpdate(id, data)
      : updateServiceMock.saveUpdate(id, data);
  },

  async markAsSent(id: string): Promise<InvestorUpdate> {
    const service = await getFirebaseService();
    return service ? service.markAsSent(id) : updateServiceMock.markAsSent(id);
  },

  async deleteUpdate(id: string): Promise<void> {
    const service = await getFirebaseService();
    return service ? service.deleteUpdate(id) : updateServiceMock.deleteUpdate(id);
  },
};

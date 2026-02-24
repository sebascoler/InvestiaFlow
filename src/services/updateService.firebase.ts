import { InvestorUpdate } from '../types/update';
import { firestoreService, dateToTimestamp, timestampToDate } from '../firebase/firestore';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';

const COLLECTION_NAME = 'updates';

const firestoreToUpdate = (data: any): InvestorUpdate => ({
  ...data,
  createdAt: timestampToDate(data.createdAt) || new Date(),
  updatedAt: timestampToDate(data.updatedAt) || new Date(),
  sentAt: timestampToDate(data.sentAt),
});

const updateToFirestore = (update: Partial<InvestorUpdate>): any => {
  const data: any = { ...update };

  // Remove undefined fields
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });

  if (data.createdAt) data.createdAt = dateToTimestamp(data.createdAt);
  if (data.updatedAt) data.updatedAt = dateToTimestamp(data.updatedAt);
  if (data.sentAt) data.sentAt = dateToTimestamp(data.sentAt);

  return data;
};

export const updateServiceFirebase = {
  async getUpdates(teamId: string): Promise<InvestorUpdate[]> {
    await ensureFirebase();
    if (!isFirebaseReady()) return [];

    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const orderBy = firebaseFirestore.orderBy;

    const docs = await firestoreService.getDocs<InvestorUpdate>(
      COLLECTION_NAME,
      [where('teamId', '==', teamId), orderBy('createdAt', 'desc')]
    );

    return docs.map(firestoreToUpdate);
  },

  async getUpdate(id: string): Promise<InvestorUpdate | null> {
    await ensureFirebase();
    if (!isFirebaseReady()) return null;

    const data = await firestoreService.getDoc<InvestorUpdate>(COLLECTION_NAME, id);
    return data ? firestoreToUpdate(data) : null;
  },

  async createUpdate(teamId: string, data: Partial<InvestorUpdate>): Promise<InvestorUpdate> {
    await ensureFirebase();
    if (!isFirebaseReady()) throw new Error('Firebase not available');

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

    await firestoreService.setDoc(COLLECTION_NAME, update.id, updateToFirestore(update));
    return update;
  },

  async saveUpdate(id: string, data: Partial<InvestorUpdate>): Promise<InvestorUpdate> {
    await ensureFirebase();
    if (!isFirebaseReady()) throw new Error('Firebase not available');

    const current = await this.getUpdate(id);
    if (!current) throw new Error('Update not found');

    const updated = {
      ...current,
      ...data,
      updatedAt: new Date(),
    };

    await firestoreService.updateDoc(COLLECTION_NAME, id, updateToFirestore(data));
    return updated;
  },

  async markAsSent(id: string): Promise<InvestorUpdate> {
    await ensureFirebase();
    if (!isFirebaseReady()) throw new Error('Firebase not available');

    const now = new Date();
    const current = await this.getUpdate(id);
    if (!current) throw new Error('Update not found');

    const updates = {
      status: 'marked_sent' as const,
      sentAt: now,
      updatedAt: now,
    };

    await firestoreService.updateDoc(COLLECTION_NAME, id, updateToFirestore(updates));
    return { ...current, ...updates };
  },

  async deleteUpdate(id: string): Promise<void> {
    await ensureFirebase();
    if (!isFirebaseReady()) throw new Error('Firebase not available');
    await firestoreService.deleteDoc(COLLECTION_NAME, id);
  },
};

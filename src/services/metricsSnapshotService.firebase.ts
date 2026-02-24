import { MetricsSnapshot } from '../types/metrics';
import { firestoreService, dateToTimestamp, timestampToDate } from '../firebase/firestore';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';

const COLLECTION_NAME = 'metricsSnapshots';

const firestoreToSnapshot = (data: any): MetricsSnapshot => ({
  ...data,
  createdAt: timestampToDate(data.createdAt) || new Date(),
  updatedAt: timestampToDate(data.updatedAt) || new Date(),
});

const snapshotToFirestore = (data: Partial<MetricsSnapshot>): any => {
  const result: any = { ...data };
  Object.keys(result).forEach(key => {
    if (result[key] === undefined) delete result[key];
  });
  if (result.createdAt) result.createdAt = dateToTimestamp(result.createdAt);
  if (result.updatedAt) result.updatedAt = dateToTimestamp(result.updatedAt);
  return result;
};

export const metricsSnapshotServiceFirebase = {
  async getSnapshots(teamId: string): Promise<MetricsSnapshot[]> {
    await ensureFirebase();
    if (!isFirebaseReady()) return [];

    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const orderBy = firebaseFirestore.orderBy;

    const docs = await firestoreService.getDocs<MetricsSnapshot>(
      COLLECTION_NAME,
      [where('teamId', '==', teamId), orderBy('month', 'desc')]
    );
    return docs.map(firestoreToSnapshot);
  },

  async getSnapshot(id: string): Promise<MetricsSnapshot | null> {
    await ensureFirebase();
    if (!isFirebaseReady()) return null;
    const data = await firestoreService.getDoc<MetricsSnapshot>(COLLECTION_NAME, id);
    return data ? firestoreToSnapshot(data) : null;
  },

  async getSnapshotByMonth(teamId: string, month: string): Promise<MetricsSnapshot | null> {
    await ensureFirebase();
    if (!isFirebaseReady()) return null;

    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;

    const docs = await firestoreService.getDocs<MetricsSnapshot>(
      COLLECTION_NAME,
      [where('teamId', '==', teamId), where('month', '==', month)]
    );
    return docs.length > 0 ? firestoreToSnapshot(docs[0]) : null;
  },

  async saveSnapshot(teamId: string, month: string, metrics: Record<string, number | null>, customMetrics?: any[]): Promise<MetricsSnapshot> {
    await ensureFirebase();
    if (!isFirebaseReady()) throw new Error('Firebase not available');

    const existing = await this.getSnapshotByMonth(teamId, month);
    const now = new Date();

    if (existing) {
      const updates = { metrics, customMetrics, updatedAt: now };
      await firestoreService.updateDoc(COLLECTION_NAME, existing.id, snapshotToFirestore(updates));
      return { ...existing, ...updates };
    }

    const snapshot: MetricsSnapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      teamId,
      month,
      metrics,
      customMetrics,
      createdAt: now,
      updatedAt: now,
    };
    await firestoreService.setDoc(COLLECTION_NAME, snapshot.id, snapshotToFirestore(snapshot));
    return snapshot;
  },

  async deleteSnapshot(id: string): Promise<void> {
    await ensureFirebase();
    if (!isFirebaseReady()) throw new Error('Firebase not available');
    await firestoreService.deleteDoc(COLLECTION_NAME, id);
  },
};

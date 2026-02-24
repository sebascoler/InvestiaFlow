import { MetricsSnapshot } from '../types/metrics';

// In-memory storage for mock mode
let snapshotsDB: MetricsSnapshot[] = [];

const metricsSnapshotServiceMock = {
  async getSnapshots(teamId: string): Promise<MetricsSnapshot[]> {
    return snapshotsDB
      .filter(s => s.teamId === teamId)
      .sort((a, b) => b.month.localeCompare(a.month));
  },

  async getSnapshot(id: string): Promise<MetricsSnapshot | null> {
    return snapshotsDB.find(s => s.id === id) || null;
  },

  async getSnapshotByMonth(teamId: string, month: string): Promise<MetricsSnapshot | null> {
    return snapshotsDB.find(s => s.teamId === teamId && s.month === month) || null;
  },

  async saveSnapshot(teamId: string, month: string, metrics: Record<string, number | null>, customMetrics?: any[]): Promise<MetricsSnapshot> {
    const existing = snapshotsDB.find(s => s.teamId === teamId && s.month === month);
    const now = new Date();

    if (existing) {
      existing.metrics = metrics;
      existing.customMetrics = customMetrics;
      existing.updatedAt = now;
      return existing;
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
    snapshotsDB.push(snapshot);
    return snapshot;
  },

  async deleteSnapshot(id: string): Promise<void> {
    snapshotsDB = snapshotsDB.filter(s => s.id !== id);
  },
};

// Firebase
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

let firebaseService: typeof metricsSnapshotServiceMock | null = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  try {
    const mod = await import('./metricsSnapshotService.firebase');
    firebaseService = mod.metricsSnapshotServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('[metricsSnapshotService] Firebase not available:', error);
    return null;
  }
};

export const metricsSnapshotService = {
  async getSnapshots(teamId: string): Promise<MetricsSnapshot[]> {
    const service = await getFirebaseService();
    return service ? service.getSnapshots(teamId) : metricsSnapshotServiceMock.getSnapshots(teamId);
  },

  async getSnapshot(id: string): Promise<MetricsSnapshot | null> {
    const service = await getFirebaseService();
    return service ? service.getSnapshot(id) : metricsSnapshotServiceMock.getSnapshot(id);
  },

  async getSnapshotByMonth(teamId: string, month: string): Promise<MetricsSnapshot | null> {
    const service = await getFirebaseService();
    return service ? service.getSnapshotByMonth(teamId, month) : metricsSnapshotServiceMock.getSnapshotByMonth(teamId, month);
  },

  async saveSnapshot(teamId: string, month: string, metrics: Record<string, number | null>, customMetrics?: any[]): Promise<MetricsSnapshot> {
    const service = await getFirebaseService();
    return service
      ? service.saveSnapshot(teamId, month, metrics, customMetrics)
      : metricsSnapshotServiceMock.saveSnapshot(teamId, month, metrics, customMetrics);
  },

  async deleteSnapshot(id: string): Promise<void> {
    const service = await getFirebaseService();
    return service ? service.deleteSnapshot(id) : metricsSnapshotServiceMock.deleteSnapshot(id);
  },
};

import { Stage, DEFAULT_STAGES } from '../types/stage';

const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Mock implementation - always returns default stages
const stageServiceMock = {
  async getStages(_teamId?: string): Promise<Stage[]> {
    return [...DEFAULT_STAGES];
  },
  async saveStages(_teamId: string, _stages: Stage[]): Promise<void> {
    // Mock: no-op (stages stay as defaults)
    console.log('[Mock] saveStages called');
  },
};

let firebaseService: any = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  try {
    const mod = await import('./stageService.firebase');
    firebaseService = mod.stageServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('Firebase stage service not available, using mock:', error);
    return null;
  }
};

export const stageService = {
  async getStages(teamId?: string): Promise<Stage[]> {
    const service = await getFirebaseService();
    return service ? service.getStages(teamId) : stageServiceMock.getStages(teamId);
  },
  async saveStages(teamId: string, stages: Stage[]): Promise<void> {
    const service = await getFirebaseService();
    return service ? service.saveStages(teamId, stages) : stageServiceMock.saveStages(teamId, stages);
  },
};

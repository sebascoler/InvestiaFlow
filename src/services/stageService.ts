import { Stage, DEFAULT_STAGES } from '../types/stage';

const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// In-memory + localStorage persistence for mock mode
const STORAGE_PREFIX = 'investiaflow_stages_';
const stagesCache = new Map<string, Stage[]>();

function loadStagesFromStorage(teamId: string): Stage[] | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${teamId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveStatesToStorage(teamId: string, stages: Stage[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${teamId}`, JSON.stringify(stages));
  } catch {
    // localStorage may be unavailable (SSR, private browsing overflow)
  }
}

const stageServiceMock = {
  async getStages(teamId?: string): Promise<Stage[]> {
    if (!teamId) return [...DEFAULT_STAGES];
    // Check in-memory cache first
    const cached = stagesCache.get(teamId);
    if (cached) return [...cached];
    // Then localStorage
    const stored = loadStagesFromStorage(teamId);
    if (stored) {
      stagesCache.set(teamId, stored);
      return [...stored];
    }
    return [...DEFAULT_STAGES];
  },
  async saveStages(teamId: string, stages: Stage[]): Promise<void> {
    stagesCache.set(teamId, [...stages]);
    saveStatesToStorage(teamId, stages);
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

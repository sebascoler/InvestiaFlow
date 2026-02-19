import { Stage, DEFAULT_STAGES } from '../types/stage';

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

function saveStagesToStorage(teamId: string, stages: Stage[]): void {
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
    saveStagesToStorage(teamId, stages);
  },
};

// Use the same pattern as teamService: try Firebase, fall back to mock
const getFirebaseService = async () => {
  try {
    const { isFirebaseReady } = await import('../firebase/config');
    if (isFirebaseReady()) {
      const { stageServiceFirebase } = await import('./stageService.firebase');
      return stageServiceFirebase;
    }
    return null;
  } catch {
    return null;
  }
};

export const stageService = {
  async getStages(teamId?: string): Promise<Stage[]> {
    const service = await getFirebaseService();
    if (service) {
      try {
        return await service.getStages(teamId);
      } catch {
        // Firebase read failed — fall back to local cache
        return stageServiceMock.getStages(teamId);
      }
    }
    return stageServiceMock.getStages(teamId);
  },
  async saveStages(teamId: string, stages: Stage[]): Promise<void> {
    const service = await getFirebaseService();
    if (service) {
      // Firebase-first: let errors propagate so UI can show them
      await service.saveStages(teamId, stages);
      // On success, also update local cache
      await stageServiceMock.saveStages(teamId, stages);
      return;
    }
    // No Firebase available — save to local only
    return stageServiceMock.saveStages(teamId, stages);
  },
};

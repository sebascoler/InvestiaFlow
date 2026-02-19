// Firebase implementation of stageService
// Uses the same pattern as teamService.firebase.ts and leadService.firebase.ts
import { Stage, DEFAULT_STAGES } from '../types/stage';
import { firestoreService, dateToTimestamp } from '../firebase/firestore';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';

const COLLECTION_NAME = 'teamStages';

export const stageServiceFirebase = {
  async getStages(teamId?: string): Promise<Stage[]> {
    if (!teamId) return [...DEFAULT_STAGES];

    await ensureFirebase();
    if (!isFirebaseReady()) {
      console.warn('[stageServiceFirebase] Firebase not ready, returning defaults');
      return [...DEFAULT_STAGES];
    }

    try {
      const data = await firestoreService.getDoc<{ stages: any[] }>(COLLECTION_NAME, teamId);

      if (data && Array.isArray(data.stages) && data.stages.length > 0) {
        return data.stages.map((s: any, index: number) => ({
          id: s.id,
          name: s.name,
          emoji: s.emoji,
          color: s.color,
          order: s.order ?? index,
          isDefault: s.isDefault ?? false,
        }));
      }

      return [...DEFAULT_STAGES];
    } catch (error) {
      console.error('[stageServiceFirebase] Failed to load stages:', error);
      throw error;
    }
  },

  async saveStages(teamId: string, stages: Stage[]): Promise<void> {
    await ensureFirebase();
    if (!isFirebaseReady()) {
      throw new Error('Firebase not available');
    }

    await firestoreService.setDoc(COLLECTION_NAME, teamId, {
      teamId,
      stages: stages.map((s, index) => ({
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        color: s.color,
        order: index,
        isDefault: s.isDefault ?? false,
      })),
      updatedAt: dateToTimestamp(new Date()),
    });
  },
};

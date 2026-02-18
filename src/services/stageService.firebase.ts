import { Stage, DEFAULT_STAGES } from '../types/stage';

// Use the firebase helpers from the codebase
const getFirestore = async () => {
  const { db } = await import('../firebase/config');
  const { doc, getDoc, setDoc } = await import('firebase/firestore');
  const firestore = db();
  return { firestore, doc, getDoc, setDoc };
};

export const stageServiceFirebase = {
  async getStages(teamId?: string): Promise<Stage[]> {
    if (!teamId) return [...DEFAULT_STAGES];

    try {
      const { firestore, doc, getDoc: fsGetDoc } = await getFirestore();
      if (!firestore) return [...DEFAULT_STAGES];

      const docRef = doc(firestore, 'teamStages', teamId);
      const docSnap = await fsGetDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return (data.stages || []).map((s: any, index: number) => ({
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
      console.warn('Failed to load custom stages, using defaults:', error);
      return [...DEFAULT_STAGES];
    }
  },

  async saveStages(teamId: string, stages: Stage[]): Promise<void> {
    const { firestore, doc, setDoc: fsSetDoc } = await getFirestore();
    if (!firestore) throw new Error('Firestore not available');

    const docRef = doc(firestore, 'teamStages', teamId);
    await fsSetDoc(docRef, {
      teamId,
      stages: stages.map((s, index) => ({
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        color: s.color,
        order: index,
        isDefault: s.isDefault ?? false,
      })),
      updatedAt: new Date(),
    }, { merge: true });
  },
};

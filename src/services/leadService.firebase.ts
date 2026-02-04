// Firebase implementation of leadService
import { Lead, LeadFormData } from '../types/lead';
import { StageId } from '../types/stage';
import { firestoreService, dateToTimestamp, timestampToDate } from '../firebase/firestore';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';
import { automationService } from './automationService';

const COLLECTION_NAME = 'leads';

// Helper to convert Firestore data to Lead
const firestoreToLead = (data: any): Lead => {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt) || new Date(),
    updatedAt: timestampToDate(data.updatedAt) || new Date(),
    lastContactDate: timestampToDate(data.lastContactDate),
    stageEnteredAt: timestampToDate(data.stageEnteredAt) || data.createdAt,
  } as Lead;
};

// Helper to convert Lead to Firestore data
const leadToFirestore = (lead: Partial<Lead>): any => {
  const data: any = { ...lead };
  
  // Remove undefined fields (Firestore doesn't allow undefined)
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Convert dates to timestamps
  if (data.createdAt) data.createdAt = dateToTimestamp(data.createdAt);
  if (data.updatedAt) data.updatedAt = dateToTimestamp(data.updatedAt);
  if (data.lastContactDate) data.lastContactDate = dateToTimestamp(data.lastContactDate);
  if (data.stageEnteredAt) data.stageEnteredAt = dateToTimestamp(data.stageEnteredAt);
  
  return data;
};

export const leadServiceFirebase = {
  // Obtener todos los leads del usuario
  async getLeads(userId: string): Promise<Lead[]> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }
    
    console.log('[leadServiceFirebase] Getting leads for userId:', userId);
    
    // Load where function directly from firebase/firestore
    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    
    if (!where) {
      throw new Error('where function not available');
    }
    
    // Also ensure our firestore service has loaded
    const { firestoreService } = await import('../firebase/firestore');
    
    try {
      const leads = await firestoreService.getDocs<Lead>(
        COLLECTION_NAME,
        [where('userId', '==', userId)]
      );
      
      console.log('[leadServiceFirebase] Found leads:', leads.length);
      const mappedLeads = leads.map(firestoreToLead);
      console.log('[leadServiceFirebase] Mapped leads:', mappedLeads);
      
      return mappedLeads;
    } catch (error: any) {
      console.error('[leadServiceFirebase] Error getting leads:', error);
      if (error.message?.includes('permission') || error.code === 'permission-denied') {
        console.error('[leadServiceFirebase] Permission denied - check Firestore rules');
      }
      throw error;
    }
  },

  // Obtener lead por ID
  async getLead(id: string): Promise<Lead | null> {
    const lead = await firestoreService.getDoc<Lead>(COLLECTION_NAME, id);
    return lead ? firestoreToLead(lead) : null;
  },

  // Crear nuevo lead
  async createLead(userId: string, data: LeadFormData): Promise<Lead> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }
    
    const now = new Date();
    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...data,
      stage: 'target',
      stageEnteredAt: now,
      createdAt: now,
      updatedAt: now,
      lastContactDate: null,
      notes: data.notes || '',
    };

    console.log('[leadServiceFirebase] Creating lead with userId:', userId);
    console.log('[leadServiceFirebase] Lead data:', newLead);

    const firestoreData = leadToFirestore(newLead);
    await firestoreService.setDoc(COLLECTION_NAME, newLead.id, firestoreData);
    
    console.log('[leadServiceFirebase] Lead created successfully:', newLead.id);
    
    return newLead;
  },

  // Actualizar lead
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const currentLead = await this.getLead(id);
    if (!currentLead) throw new Error('Lead not found');

    const updatedLead = {
      ...currentLead,
      ...updates,
      updatedAt: new Date(),
      // Preservar stageEnteredAt si no se está cambiando el stage
      stageEnteredAt: updates.stage === undefined 
        ? currentLead.stageEnteredAt 
        : (updates.stageEnteredAt || currentLead.stageEnteredAt),
    };

    const firestoreData = leadToFirestore(updatedLead);
    await firestoreService.updateDoc(COLLECTION_NAME, id, firestoreData);
    
    return updatedLead;
  },

  // Cambiar stage de lead (trigger de automatización)
  async changeStage(id: string, newStage: StageId, stageChangeNotes?: string): Promise<Lead> {
    const lead = await this.getLead(id);
    if (!lead) throw new Error('Lead not found');

    const oldStage = lead.stage;
    const now = new Date();
    
    // Actualizar notas si se proporcionan
    const updatedNotes = stageChangeNotes 
      ? `${lead.notes ? lead.notes + '\n\n' : ''}[${now.toLocaleDateString()}] Cambio a ${newStage}: ${stageChangeNotes}`
      : lead.notes;

    const updatedLead = await this.updateLead(id, { 
      stage: newStage,
      stageEnteredAt: now,
      notes: updatedNotes,
    });

    // Trigger automation service
    await automationService.onStageChange(updatedLead, oldStage, newStage);

    return updatedLead;
  },

  // Eliminar lead
  async deleteLead(id: string): Promise<void> {
    await firestoreService.deleteDoc(COLLECTION_NAME, id);
  },
};

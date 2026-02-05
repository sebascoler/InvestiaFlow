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
  // Obtener todos los leads del usuario/team
  async getLeads(userId: string, teamId?: string | null, ownerId?: string | null): Promise<Lead[]> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }
    
    console.log('[leadServiceFirebase] Getting leads for userId:', userId, 'teamId:', teamId, 'ownerId:', ownerId);
    
    // Load where function directly from firebase/firestore
    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const or = firebaseFirestore.or;
    
    if (!where) {
      throw new Error('where function not available');
    }
    
    // Also ensure our firestore service has loaded
    const { firestoreService } = await import('../firebase/firestore');
    
    try {
      // Build queries: if teamId is provided, get leads with teamId AND leads from owner (for migration)
      // Firestore rules don't handle complex OR queries well, so we do two separate queries
      let allLeads: any[] = [];
      
      if (teamId && ownerId) {
        // For team members, get all leads that belong to the team AND leads created by the owner
        // This allows all team members to see team leads, including legacy ones without teamId
        try {
          // Query 1: Get leads with teamId
          const teamLeads = await firestoreService.getDocs<Lead>(
            COLLECTION_NAME,
            [where('teamId', '==', teamId)]
          );
          console.log('[leadServiceFirebase] Found team leads:', teamLeads.length);
          allLeads.push(...teamLeads);
        } catch (error: any) {
          console.warn('[leadServiceFirebase] Error fetching team leads:', error);
        }
        
        try {
          // Query 2: Get leads from owner (legacy leads without teamId)
          const ownerLeads = await firestoreService.getDocs<Lead>(
            COLLECTION_NAME,
            [where('userId', '==', ownerId)]
          );
          console.log('[leadServiceFirebase] Found owner leads:', ownerLeads.length);
          allLeads.push(...ownerLeads);
        } catch (error: any) {
          console.warn('[leadServiceFirebase] Error fetching owner leads:', error);
        }
        
        // Remove duplicates (in case a lead has both teamId and userId matching)
        const uniqueLeads = Array.from(
          new Map(allLeads.map(lead => [lead.id, lead])).values()
        );
        allLeads = uniqueLeads;
      } else if (teamId) {
        // If teamId but no ownerId, just filter by teamId
        allLeads = await firestoreService.getDocs<Lead>(
          COLLECTION_NAME,
          [where('teamId', '==', teamId)]
        );
      } else {
        // Fallback to userId only (for users without teams)
        allLeads = await firestoreService.getDocs<Lead>(
          COLLECTION_NAME,
          [where('userId', '==', userId)]
        );
      }
      
      console.log('[leadServiceFirebase] Total unique leads:', allLeads.length);
      if (allLeads.length > 0) {
        console.log('[leadServiceFirebase] Sample lead:', {
          id: allLeads[0].id,
          userId: allLeads[0].userId,
          teamId: allLeads[0].teamId,
        });
      }
      const mappedLeads = allLeads.map(firestoreToLead);
      console.log('[leadServiceFirebase] Mapped leads count:', mappedLeads.length);
      
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
  async createLead(userId: string, data: LeadFormData, teamId?: string | null): Promise<Lead> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }
    
    const now = new Date();
    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      teamId: teamId || undefined,
      ...data,
      stage: 'target',
      stageEnteredAt: now,
      createdAt: now,
      updatedAt: now,
      lastContactDate: null,
      notes: data.notes || '',
      tags: data.tags || [],
    };

    console.log('[leadServiceFirebase] Creating lead with userId:', userId);
    console.log('[leadServiceFirebase] Lead data:', newLead);

    const firestoreData = leadToFirestore(newLead);
    await firestoreService.setDoc(COLLECTION_NAME, newLead.id, firestoreData);
    
    // Registrar actividad de creación
    try {
      const { leadHistoryService } = await import('./leadHistoryService');
      await leadHistoryService.addActivity(
        newLead.id,
        userId,
        'created',
        `Lead "${data.name}" creado`
      );
    } catch (error) {
      console.warn('[leadServiceFirebase] Error recording activity:', error);
    }
    
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
    
    // Registrar actividad de actualización
    try {
      const { leadHistoryService } = await import('./leadHistoryService');
      const changedFields = Object.keys(updates).filter(key => 
        key !== 'updatedAt' && updates[key as keyof Lead] !== currentLead[key as keyof Lead]
      );
      
      if (changedFields.length > 0) {
        // Si cambió tags, registrar actividad específica
        if (updates.tags && JSON.stringify(updates.tags) !== JSON.stringify(currentLead.tags)) {
          const addedTags = (updates.tags || []).filter(t => !currentLead.tags?.includes(t));
          const removedTags = (currentLead.tags || []).filter(t => !updates.tags?.includes(t));
          
          if (addedTags.length > 0) {
            await leadHistoryService.addActivity(
              id,
              currentLead.userId,
              'tag_added',
              `Tags agregados: ${addedTags.join(', ')}`,
              { tags: addedTags }
            );
          }
          if (removedTags.length > 0) {
            await leadHistoryService.addActivity(
              id,
              currentLead.userId,
              'tag_removed',
              `Tags eliminados: ${removedTags.join(', ')}`,
              { tags: removedTags }
            );
          }
        } else {
          await leadHistoryService.addActivity(
            id,
            currentLead.userId,
            'updated',
            `Lead actualizado: ${changedFields.join(', ')}`
          );
        }
      }
    } catch (error) {
      console.warn('[leadServiceFirebase] Error recording activity:', error);
    }
    
    return updatedLead;
  },

  // Cambiar stage de lead (trigger de automatización)
  async changeStage(id: string, newStage: StageId, stageChangeNotes?: string): Promise<Lead> {
    const lead = await this.getLead(id);
    if (!lead) throw new Error('Lead not found');

    const oldStage = lead.stage;
    const now = new Date();
    
    // Registrar actividad de cambio de stage
    try {
      const { leadHistoryService } = await import('./leadHistoryService');
      const stageNames: Record<StageId, string> = {
        target: 'Target',
        first_contact: 'First Contact',
        in_conversation: 'In Conversation',
        pitch_shared: 'Pitch Shared',
        due_diligence: 'Due Diligence',
        term_sheet: 'Term Sheet',
        committed: 'Committed',
        passed: 'Passed',
      };
      await leadHistoryService.addActivity(
        id,
        lead.userId,
        'stage_changed',
        `Stage cambiado de ${stageNames[oldStage]} a ${stageNames[newStage]}${stageChangeNotes ? `: ${stageChangeNotes}` : ''}`,
        {
          fromStage: oldStage,
          toStage: newStage,
        }
      );
    } catch (error) {
      console.warn('[leadServiceFirebase] Error recording activity:', error);
    }
    
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

  // Obtener leads por stage o stages superiores (para compartir documentos)
  async getLeadsByStageOrHigher(userId: string, minStage: StageId, teamId?: string | null, ownerId?: string | null): Promise<Lead[]> {
    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const or = firebaseFirestore.or;
    const { STAGES } = await import('../types/stage');
    
    if (!where) {
      throw new Error('where function not available');
    }
    
    // Build query: if teamId is provided, get leads with teamId OR leads from owner (for migration)
    // Otherwise, filter by userId (for users without teams)
    let queryConstraints;
    if (teamId && ownerId) {
      queryConstraints = [
        or(
          where('teamId', '==', teamId),
          where('userId', '==', ownerId)
        )
      ];
    } else if (teamId) {
      queryConstraints = [where('teamId', '==', teamId)];
    } else {
      // Fallback to userId only (for users without teams)
      queryConstraints = [where('userId', '==', userId)];
    }
    
    // Get all leads for this user/team
    const allLeads = await firestoreService.getDocs<Lead>(
      COLLECTION_NAME,
      queryConstraints
    );
    
    const mappedLeads = allLeads.map(firestoreToLead);
    
    // Filter leads that are in minStage or higher stages
    const minStageOrder = STAGES.find(s => s.id === minStage)?.order ?? -1;
    
    return mappedLeads.filter(lead => {
      const leadStageOrder = STAGES.find(s => s.id === lead.stage)?.order ?? -1;
      return leadStageOrder >= minStageOrder;
    });
  },
};

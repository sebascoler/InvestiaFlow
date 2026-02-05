import { Lead, LeadFormData, ensureStageEnteredAt } from '../types/lead';
import { StageId } from '../types/stage';
import { automationService } from './automationService';

// Check if Firebase is configured
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Mock data storage (en memoria para Fase 1)
let leadsDB: Lead[] = [
  {
    id: 'lead-1',
    userId: 'user-1',
    name: 'María González',
    email: 'maria@vc-fund.com',
    firm: 'Venture Capital Fund',
    stage: 'in_conversation',
    stageEnteredAt: new Date('2025-02-01'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-02-01'),
    lastContactDate: new Date('2025-02-01'),
    notes: 'Muy interesada en métricas de retención',
  },
  {
    id: 'lead-2',
    userId: 'user-1',
    name: 'Carlos Rodríguez',
    email: 'carlos@angel-investors.com',
    firm: 'Angel Investors Network',
    stage: 'pitch_shared',
    stageEnteredAt: new Date('2025-01-28'),
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-28'),
    lastContactDate: new Date('2025-01-28'),
    notes: 'Solicitó más información sobre modelo de negocio',
  },
  {
    id: 'lead-3',
    userId: 'user-1',
    name: 'Ana Martínez',
    email: 'ana@seed-capital.vc',
    firm: 'Seed Capital Partners',
    stage: 'target',
    stageEnteredAt: new Date('2025-01-25'),
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
    lastContactDate: null,
    notes: 'Potencial inversor para ronda seed',
  },
  {
    id: 'lead-4',
    userId: 'user-1',
    name: 'Roberto Silva',
    email: 'roberto@growth-fund.com',
    firm: 'Growth Fund',
    stage: 'due_diligence',
    stageEnteredAt: new Date('2025-02-03'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-02-03'),
    lastContactDate: new Date('2025-02-03'),
    notes: 'En proceso de due diligence, muy avanzado',
  },
  {
    id: 'lead-5',
    userId: 'user-1',
    name: 'Laura Fernández',
    email: 'laura@tech-vc.com',
    firm: 'Tech VC',
    stage: 'first_contact',
    stageEnteredAt: new Date('2025-02-02'),
    createdAt: new Date('2025-01-30'),
    updatedAt: new Date('2025-02-02'),
    lastContactDate: new Date('2025-02-02'),
    notes: 'Primera conversación muy positiva',
  },
  {
    id: 'lead-6',
    userId: 'user-1',
    name: 'Pedro López',
    email: 'pedro@early-stage.vc',
    firm: 'Early Stage Ventures',
    stage: 'committed',
    stageEnteredAt: new Date('2025-01-20'),
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2025-01-20'),
    lastContactDate: new Date('2025-01-20'),
    notes: 'Inversor confirmado, esperando cierre legal',
  },
];

// Mock implementation
const leadServiceMock = {
  // Obtener todos los leads del usuario
  async getLeads(userId: string): Promise<Lead[]> {
    return leadsDB
      .filter(lead => lead.userId === userId)
      .map(lead => ensureStageEnteredAt(lead));
  },

  // Obtener lead por ID
  async getLead(id: string): Promise<Lead | null> {
    const lead = leadsDB.find(lead => lead.id === id);
    return lead ? ensureStageEnteredAt(lead) : null;
  },

  // Crear nuevo lead
  async createLead(userId: string, data: LeadFormData): Promise<Lead> {
    const now = new Date();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      userId,
      name: data.name,
      email: data.email,
      firm: data.firm,
      stage: 'target',
      stageEnteredAt: now,
      createdAt: now,
      updatedAt: now,
      lastContactDate: null,
      notes: data.notes || '',
      tags: data.tags || [],
      linkedinUrl: data.linkedinUrl,
      phoneNumber: data.phoneNumber,
    };
    leadsDB.push(newLead);
    
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
      console.warn('[leadService] Error recording activity:', error);
    }
    
    return newLead;
  },

  // Actualizar lead
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const index = leadsDB.findIndex(lead => lead.id === id);
    if (index === -1) throw new Error('Lead not found');
    
    // Preservar stageEnteredAt si no se está cambiando el stage
    const currentLead = leadsDB[index];
    const finalUpdates = {
      ...updates,
      updatedAt: new Date(),
      // Si no se está cambiando el stage, preservar stageEnteredAt
      stageEnteredAt: updates.stage === undefined ? currentLead.stageEnteredAt : (updates.stageEnteredAt || currentLead.stageEnteredAt),
    };
    
    leadsDB[index] = {
      ...currentLead,
      ...finalUpdates,
    };
    
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
      console.warn('[leadService] Error recording activity:', error);
    }
    
    return leadsDB[index];
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
    leadsDB = leadsDB.filter(lead => lead.id !== id);
  },

  // Obtener leads por stage o stages superiores
  async getLeadsByStageOrHigher(userId: string, minStage: StageId): Promise<Lead[]> {
    const { STAGES } = await import('../types/stage');
    const userLeads = leadsDB.filter(lead => lead.userId === userId);
    const minStageOrder = STAGES.find(s => s.id === minStage)?.order ?? -1;
    
    return userLeads.filter(lead => {
      const leadStageOrder = STAGES.find(s => s.id === lead.stage)?.order ?? -1;
      return leadStageOrder >= minStageOrder;
    });
  },
};

// Lazy load Firebase service
let firebaseService: any = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  
  try {
    const module = await import('./leadService.firebase');
    firebaseService = module.leadServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const leadService = {
  async getLeads(userId: string): Promise<Lead[]> {
    const service = await getFirebaseService();
    return service ? service.getLeads(userId) : leadServiceMock.getLeads(userId);
  },

  async getLead(id: string): Promise<Lead | null> {
    const service = await getFirebaseService();
    return service ? service.getLead(id) : leadServiceMock.getLead(id);
  },

  async createLead(userId: string, data: LeadFormData): Promise<Lead> {
    const service = await getFirebaseService();
    return service ? service.createLead(userId, data) : leadServiceMock.createLead(userId, data);
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const service = await getFirebaseService();
    return service ? service.updateLead(id, updates) : leadServiceMock.updateLead(id, updates);
  },

  async changeStage(id: string, newStage: StageId, stageChangeNotes?: string): Promise<Lead> {
    const service = await getFirebaseService();
    return service 
      ? service.changeStage(id, newStage, stageChangeNotes) 
      : leadServiceMock.changeStage(id, newStage, stageChangeNotes);
  },

  async deleteLead(id: string): Promise<void> {
    const service = await getFirebaseService();
    return service ? service.deleteLead(id) : leadServiceMock.deleteLead(id);
  },

  async getLeadsByStageOrHigher(userId: string, minStage: StageId): Promise<Lead[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getLeadsByStageOrHigher(userId, minStage) 
      : leadServiceMock.getLeadsByStageOrHigher(userId, minStage);
  },
};

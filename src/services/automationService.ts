import { AutomationRule } from '../types/automation';
import { Lead } from '../types/lead';
import { StageId } from '../types/stage';
import { documentService } from './documentService';
import { emailService } from './emailService';
import { scheduledTaskService } from './scheduledTaskService';

// Check if Firebase is configured
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Mock data storage
let rulesDB: AutomationRule[] = [
  {
    id: 'rule-1',
    userId: 'user-1',
    name: 'Share Pitch Deck on Pitch Shared',
    triggerStage: 'pitch_shared',
    documentIds: ['doc-1', 'doc-4'],
    delayDays: 0,
    emailSubject: '📊 Pitch Deck Available - InvestiaFlow',
    emailBody: 'Hi {{name}},\n\nWe\'ve shared our pitch deck with you. You can access it in your Data Room.\n\nBest regards,\nInvestiaFlow Team',
    isActive: true,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'rule-2',
    userId: 'user-1',
    name: 'Share Financials on Due Diligence',
    triggerStage: 'due_diligence',
    documentIds: ['doc-2', 'doc-5'],
    delayDays: 0,
    emailSubject: '📊 Financial Documents Available',
    emailBody: 'Hi {{name}},\n\nWe\'ve shared financial documents with you for due diligence.\n\nBest regards,\nInvestiaFlow Team',
    isActive: true,
    createdAt: new Date('2025-01-20'),
  },
];

const automationServiceMock = {
  // Obtener todas las reglas del usuario
  async getRules(userId: string): Promise<AutomationRule[]> {
    return rulesDB.filter(rule => rule.userId === userId);
  },

  // Obtener regla por ID
  async getRule(id: string): Promise<AutomationRule | null> {
    return rulesDB.find(rule => rule.id === id) || null;
  },

  // Crear nueva regla
  async createRule(userId: string, rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      userId,
      ...rule,
      createdAt: new Date(),
    };
    rulesDB.push(newRule);
    return newRule;
  },

  // Actualizar regla
  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const index = rulesDB.findIndex(rule => rule.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    rulesDB[index] = {
      ...rulesDB[index],
      ...updates,
    };
    return rulesDB[index];
  },

  // Eliminar regla
  async deleteRule(id: string): Promise<void> {
    rulesDB = rulesDB.filter(rule => rule.id !== id);
  },

  // Toggle activar/desactivar regla
  async toggleRule(id: string): Promise<AutomationRule> {
    const rule = await this.getRule(id);
    if (!rule) throw new Error('Rule not found');
    return await this.updateRule(id, { isActive: !rule.isActive });
  },

  // Trigger cuando un lead cambia de stage
  async onStageChange(lead: Lead, oldStage: StageId, newStage: StageId): Promise<void> {
    console.log(`[Automation] Lead ${lead.name} moved from ${oldStage} to ${newStage}`);
    
    // Obtener reglas activas para este stage
    const activeRules = rulesDB.filter(
      rule => rule.userId === lead.userId && 
              rule.triggerStage === newStage && 
              rule.isActive
    );

    if (activeRules.length === 0) {
      console.log(`[Automation] No active rules for stage ${newStage}`);
      return;
    }

    // Ejecutar cada regla activa
    for (const rule of activeRules) {
      await this.executeRule(lead, rule);
    }
  },

  // Ejecutar una regla específica
  async executeRule(lead: Lead, rule: AutomationRule): Promise<void> {
    console.log(`[Automation] Executing rule: ${rule.name} for lead ${lead.name}`);

    if (rule.delayDays > 0) {
      console.log(`[Automation] Rule will execute in ${rule.delayDays} days`);
      
      // Create scheduled task
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + rule.delayDays);
      
      await scheduledTaskService.createTask(
        lead.userId,
        lead.id,
        rule.id,
        scheduledAt
      );
      
      console.log(`[Automation] Scheduled task created for ${scheduledAt.toISOString()}`);
      return;
    }

    // Obtener documentos
    const documents = await documentService.getDocuments(lead.userId);
    const documentsToShare = documents.filter(doc => rule.documentIds.includes(doc.id));

    if (documentsToShare.length === 0) {
      console.log(`[Automation] No documents found for rule ${rule.name}`);
      return;
    }

    // Compartir documentos
    for (const doc of documentsToShare) {
      await this.shareDocument(lead, doc.id, rule);
    }

    // Enviar email si está configurado
    if (rule.emailBody) {
      const emailBody = this.replaceTemplateVariables(rule.emailBody, lead);
      const emailSubject = this.replaceTemplateVariables(rule.emailSubject, lead);
      
      // Crear links de documentos
      const documentLinks = documentsToShare.map(doc => doc.name);
      
      // Generate data room URL for investor access
      // Use VITE_APP_URL env var if available, otherwise try window.location.origin
      let appOrigin: string | undefined;
      if (typeof window !== 'undefined' && window.location) {
        appOrigin = window.location.origin;
      } else if (import.meta.env.VITE_APP_URL) {
        appOrigin = import.meta.env.VITE_APP_URL;
      }
      
      const dataRoomUrl = appOrigin 
        ? `${appOrigin}/investor/login?email=${encodeURIComponent(lead.email)}`
        : undefined;
      
      await emailService.sendDocumentEmail(
        lead.email,
        emailSubject,
        emailBody,
        documentLinks,
        lead,
        documentsToShare,
        dataRoomUrl
      );
    }
  },

  // Compartir documento con lead
  async shareDocument(lead: Lead, documentId: string, rule: AutomationRule): Promise<void> {
    console.log(`[Automation] Sharing document ${documentId} with ${lead.name} (${lead.email})`);
    
    // Crear registro en SharedDocument
    await documentService.shareDocumentWithLead(lead.id, documentId);
  },

  // Reemplazar variables en templates
  replaceTemplateVariables(template: string, lead: Lead): string {
    return template
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{firm\}\}/g, lead.firm)
      .replace(/\{\{email\}\}/g, lead.email);
  },
};

// Lazy load Firebase service
let firebaseService: any = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  
  try {
    const module = await import('./automationService.firebase');
    firebaseService = module.automationServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const automationService = {
  async getRules(userId: string): Promise<AutomationRule[]> {
    const service = await getFirebaseService();
    return service ? service.getRules(userId) : automationServiceMock.getRules(userId);
  },

  async getRule(id: string): Promise<AutomationRule | null> {
    const service = await getFirebaseService();
    return service ? service.getRule(id) : automationServiceMock.getRule(id);
  },

  async createRule(userId: string, rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>): Promise<AutomationRule> {
    const service = await getFirebaseService();
    return service 
      ? service.createRule(userId, rule)
      : automationServiceMock.createRule(userId, rule);
  },

  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const service = await getFirebaseService();
    return service 
      ? service.updateRule(id, updates)
      : automationServiceMock.updateRule(id, updates);
  },

  async deleteRule(id: string): Promise<void> {
    const service = await getFirebaseService();
    return service ? service.deleteRule(id) : automationServiceMock.deleteRule(id);
  },

  async toggleRule(id: string): Promise<AutomationRule> {
    const service = await getFirebaseService();
    return service ? service.toggleRule(id) : automationServiceMock.toggleRule(id);
  },

  async onStageChange(lead: Lead, oldStage: StageId, newStage: StageId): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.onStageChange(lead, oldStage, newStage)
      : automationServiceMock.onStageChange(lead, oldStage, newStage);
  },

  async executeRule(lead: Lead, rule: AutomationRule): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.executeRule(lead, rule)
      : automationServiceMock.executeRule(lead, rule);
  },

  async shareDocument(lead: Lead, documentId: string, rule: AutomationRule): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.shareDocument(lead, documentId, rule)
      : automationServiceMock.shareDocument(lead, documentId, rule);
  },

  replaceTemplateVariables(template: string, lead: Lead): string {
    return template
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{firm\}\}/g, lead.firm)
      .replace(/\{\{email\}\}/g, lead.email);
  },
};

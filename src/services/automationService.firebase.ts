// Firebase implementation of automationService
import { AutomationRule } from '../types/automation';
import { Lead } from '../types/lead';
import { StageId } from '../types/stage';
import { firestoreService, dateToTimestamp, timestampToDate } from '../firebase/firestore';
import { documentService } from './documentService';
import { emailService } from './emailService';
import { scheduledTaskService } from './scheduledTaskService';

const COLLECTION_NAME = 'automationRules';

// Helper to convert Firestore data to AutomationRule
const firestoreToRule = (data: any): AutomationRule => {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt) || new Date(),
  } as AutomationRule;
};

// Helper to convert AutomationRule to Firestore data
const ruleToFirestore = (rule: Partial<AutomationRule>): any => {
  const data: any = { ...rule };
  
  // Remove undefined fields (Firestore doesn't allow undefined)
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Convert dates to timestamps
  if (data.createdAt) data.createdAt = dateToTimestamp(data.createdAt);
  
  return data;
};

export const automationServiceFirebase = {
  // Obtener todas las reglas del usuario
  async getRules(userId: string): Promise<AutomationRule[]> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    const rules = await firestoreService.getDocs<AutomationRule>(
      COLLECTION_NAME,
      [whereFunc('userId', '==', userId)]
    );
    return rules.map(firestoreToRule);
  },

  // Obtener regla por ID
  async getRule(id: string): Promise<AutomationRule | null> {
    const rule = await firestoreService.getDoc<AutomationRule>(COLLECTION_NAME, id);
    return rule ? firestoreToRule(rule) : null;
  },

  // Crear nueva regla
  async createRule(
    userId: string, 
    rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>
  ): Promise<AutomationRule> {
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRule: AutomationRule = {
      id: ruleId,
      userId,
      ...rule,
      createdAt: new Date(),
    };

    const firestoreData = ruleToFirestore(newRule);
    await firestoreService.setDoc(COLLECTION_NAME, ruleId, firestoreData);
    
    return newRule;
  },

  // Actualizar regla
  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const currentRule = await this.getRule(id);
    if (!currentRule) throw new Error('Rule not found');

    const updatedRule = {
      ...currentRule,
      ...updates,
    };

    const firestoreData = ruleToFirestore(updatedRule);
    await firestoreService.updateDoc(COLLECTION_NAME, id, firestoreData);
    
    return updatedRule;
  },

  // Eliminar regla
  async deleteRule(id: string): Promise<void> {
    await firestoreService.deleteDoc(COLLECTION_NAME, id);
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
    const allRules = await this.getRules(lead.userId);
    const activeRules = allRules.filter(
      rule => rule.triggerStage === newStage && rule.isActive
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
      
      // Generate data room URL (if you have a public data room page)
      const dataRoomUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/dataroom`
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

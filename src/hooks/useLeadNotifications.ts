import { useEffect } from 'react';
import { useLeads } from '../contexts/LeadsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Lead } from '../types/lead';

/**
 * Hook que genera notificaciones automáticas basadas en el estado de los leads
 * - Notifica cuando un lead necesita follow-up (más de 14 días sin contacto)
 * - Notifica cuando un lead está en un stage avanzado por mucho tiempo
 */
export const useLeadNotifications = () => {
  const { leads } = useLeads();
  const { addNotification, notifications } = useNotifications();

  useEffect(() => {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Verificar leads que necesitan follow-up
    leads.forEach(lead => {
      // Solo verificar leads activos (no passed ni committed)
      if (lead.stage === 'passed' || lead.stage === 'committed') {
        return;
      }

      // Verificar si necesita follow-up (más de 14 días sin contacto)
      if (lead.lastContactDate) {
        const lastContact = new Date(lead.lastContactDate);
        if (lastContact < fourteenDaysAgo) {
          const daysSinceContact = Math.floor(
            (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Verificar si ya existe una notificación para este lead
          const existingNotification = notifications.find(
            n => n.message.includes(lead.name) && n.message.includes('follow-up')
          );

          if (!existingNotification) {
            addNotification(
              'warning',
              'Follow-up necesario',
              `${lead.name} necesita seguimiento (${daysSinceContact} días sin contacto)`,
              `/crm?lead=${lead.id}`
            );
          }
        }
      } else if (lead.stage !== 'target') {
        // Lead sin último contacto pero que ya está en proceso
        const daysSinceStage = Math.floor(
          (now.getTime() - lead.stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceStage >= 14) {
          const existingNotification = notifications.find(
            n => n.message.includes(lead.name) && n.message.includes('sin contacto')
          );

          if (!existingNotification) {
            addNotification(
              'warning',
              'Follow-up necesario',
              `${lead.name} está en ${lead.stage} desde hace ${daysSinceStage} días sin contacto`,
              `/crm?lead=${lead.id}`
            );
          }
        }
      }

      // Notificar si un lead está en Due Diligence por más de 30 días
      if (lead.stage === 'due_diligence') {
        const daysInStage = Math.floor(
          (now.getTime() - lead.stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysInStage >= 30) {
          const existingNotification = notifications.find(
            n => n.message.includes(lead.name) && n.message.includes('Due Diligence')
          );

          if (!existingNotification) {
            addNotification(
              'info',
              'Due Diligence extendido',
              `${lead.name} lleva ${daysInStage} días en Due Diligence`,
              `/crm?lead=${lead.id}`
            );
          }
        }
      }
    });
  }, [leads, addNotification, notifications]);
};

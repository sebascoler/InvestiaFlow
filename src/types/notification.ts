export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'investor_viewed' | 'investor_downloaded';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string; // URL opcional para navegar cuando se hace click
  // Campos adicionales para notificaciones de actividad de inversores
  userId?: string;
  teamId?: string; // Team that owns this notification
  leadId?: string;
  leadName?: string;
  documentId?: string;
  documentName?: string;
}

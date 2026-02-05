// Notification Service - Uses Firebase if available, otherwise mock
import { Notification } from '../types/notification';
import { firestoreService, timestampToDate, dateToTimestamp } from '../firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Mock storage
const notificationsDB: Notification[] = [];

export const notificationServiceMock = {
  async getNotifications(userId: string, teamId?: string | null): Promise<Notification[]> {
    return notificationsDB
      .filter(n => n.userId === userId || (teamId && n.teamId === teamId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const index = notificationsDB.findIndex(
      n => n.id === notificationId && n.userId === userId
    );
    if (index !== -1) {
      notificationsDB[index].read = true;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    notificationsDB.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
  },

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const index = notificationsDB.findIndex(
      n => n.id === notificationId && n.userId === userId
    );
    if (index !== -1) {
      notificationsDB.splice(index, 1);
    }
  },
};

// Helper to convert Firestore data to Notification
const firestoreToNotification = (data: any): Notification => {
  return {
    ...data,
    createdAt: timestampToDate(data.createdAt) || new Date(),
  } as Notification;
};

export const notificationServiceFirebase = {
  async getNotifications(userId: string, teamId?: string | null): Promise<Notification[]> {
    try {
      const firebaseFirestore = await import('firebase/firestore');
      const whereFunc = firebaseFirestore.where;
      const orderByFunc = firebaseFirestore.orderBy;
      const orFunc = firebaseFirestore.or;
      
      // Build query: filter by userId OR teamId (for migration period)
      let queryConstraints;
      if (teamId) {
        queryConstraints = [
          orFunc(
            whereFunc('userId', '==', userId),
            whereFunc('teamId', '==', teamId)
          ),
          orderByFunc('createdAt', 'desc'),
        ];
      } else {
        queryConstraints = [
          whereFunc('userId', '==', userId),
          orderByFunc('createdAt', 'desc'),
        ];
      }
      
      const notifications = await firestoreService.getDocs<Notification>(
        NOTIFICATIONS_COLLECTION,
        queryConstraints
      );
      
      return notifications.map(firestoreToNotification);
    } catch (error) {
      console.error('[notificationServiceFirebase] Error getting notifications:', error);
      throw error;
    }
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      // Verify ownership
      const notification = await firestoreService.getDoc<Notification>(
        NOTIFICATIONS_COLLECTION,
        notificationId
      );
      
      if (!notification || notification.userId !== userId) {
        throw new Error('Notification not found or access denied');
      }
      
      await firestoreService.updateDoc(NOTIFICATIONS_COLLECTION, notificationId, {
        read: true,
      });
    } catch (error) {
      console.error('[notificationServiceFirebase] Error marking as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const firebaseFirestore = await import('firebase/firestore');
      const whereFunc = firebaseFirestore.where;
      
      const notifications = await firestoreService.getDocs<Notification>(
        NOTIFICATIONS_COLLECTION,
        [whereFunc('userId', '==', userId), whereFunc('read', '==', false)]
      );
      
      // Update all unread notifications
      const batch = await import('firebase/firestore').then(m => m.writeBatch);
      const { db } = await import('../firebase/config');
      const dbInstance = db();
      
      if (dbInstance && batch) {
        const batchInstance = batch(dbInstance);
        const { doc: docFunc } = await import('firebase/firestore');
        
        notifications.forEach(n => {
          const ref = docFunc(dbInstance, NOTIFICATIONS_COLLECTION, n.id);
          batchInstance.update(ref, { read: true });
        });
        
        await batchInstance.commit();
      }
    } catch (error) {
      console.error('[notificationServiceFirebase] Error marking all as read:', error);
      throw error;
    }
  },

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      // Verify ownership
      const notification = await firestoreService.getDoc<Notification>(
        NOTIFICATIONS_COLLECTION,
        notificationId
      );
      
      if (!notification || notification.userId !== userId) {
        throw new Error('Notification not found or access denied');
      }
      
      await firestoreService.deleteDoc(NOTIFICATIONS_COLLECTION, notificationId);
    } catch (error) {
      console.error('[notificationServiceFirebase] Error deleting notification:', error);
      throw error;
    }
  },
};

// Try to load Firebase service
const getFirebaseService = async () => {
  try {
    const { isFirebaseReady } = await import('../firebase/config');
    if (isFirebaseReady()) {
      return notificationServiceFirebase;
    }
    return null;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const notificationService = {
  async getNotifications(userId: string, teamId?: string | null): Promise<Notification[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getNotifications(userId, teamId) 
      : notificationServiceMock.getNotifications(userId, teamId);
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.markAsRead(userId, notificationId) 
      : notificationServiceMock.markAsRead(userId, notificationId);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.markAllAsRead(userId) 
      : notificationServiceMock.markAllAsRead(userId);
  },

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.deleteNotification(userId, notificationId) 
      : notificationServiceMock.deleteNotification(userId, notificationId);
  },
};

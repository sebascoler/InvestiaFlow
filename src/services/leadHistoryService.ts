import { LeadActivity, ActivityType, Comment } from '../types/leadHistory';
import { Lead } from '../types/lead';
import { StageId } from '../types/stage';

// Check if Firebase is configured
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Mock implementation
const leadHistoryServiceMock = {
  async getActivities(leadId: string): Promise<LeadActivity[]> {
    // Mock: return empty array
    return [];
  },

  async addActivity(
    leadId: string,
    userId: string,
    type: ActivityType,
    description: string,
    metadata?: LeadActivity['metadata']
  ): Promise<LeadActivity> {
    const activity: LeadActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      userId,
      type,
      description,
      metadata,
      createdAt: new Date(),
    };
    console.log('[LeadHistory] Mock activity created:', activity);
    return activity;
  },

  async getComments(leadId: string): Promise<Comment[]> {
    // Mock: return empty array
    return [];
  },

  async addComment(leadId: string, userId: string, userName: string, content: string): Promise<Comment> {
    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      userId,
      userName,
      content,
      createdAt: new Date(),
    };
    console.log('[LeadHistory] Mock comment created:', comment);
    return comment;
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    throw new Error('Not implemented in mock');
  },

  async deleteComment(commentId: string): Promise<void> {
    console.log('[LeadHistory] Mock comment deleted:', commentId);
  },
};

// Firebase implementation
const leadHistoryServiceFirebase = {
  async getActivities(leadId: string): Promise<LeadActivity[]> {
    const { ensureFirebase, isFirebaseReady } = await import('../firebase/config');
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      return [];
    }

    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const { firestoreService } = await import('../firebase/firestore');
    const { timestampToDate } = await import('../firebase/firestore');

    try {
      const activities = await firestoreService.getDocs<LeadActivity>(
        'leadActivities',
        [where('leadId', '==', leadId)]
      );

      return activities.map(activity => ({
        ...activity,
        createdAt: timestampToDate(activity.createdAt) || new Date(),
      })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: any) {
      console.error('[LeadHistory] Error getting activities:', error);
      // Si es error de permisos, retornar array vacío en lugar de fallar
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('[LeadHistory] Permission denied, returning empty array');
        return [];
      }
      return [];
    }
  },

  async addActivity(
    leadId: string,
    userId: string,
    type: ActivityType,
    description: string,
    metadata?: LeadActivity['metadata']
  ): Promise<LeadActivity> {
    const { ensureFirebase, isFirebaseReady } = await import('../firebase/config');
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      return leadHistoryServiceMock.addActivity(leadId, userId, type, description, metadata);
    }

    const { firestoreService } = await import('../firebase/firestore');
    const { dateToTimestamp } = await import('../firebase/firestore');

    const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const activity: LeadActivity = {
      id: activityId,
      leadId,
      userId,
      type,
      description,
      metadata,
      createdAt: new Date(),
    };

    const firestoreData: any = {
      ...activity,
      createdAt: dateToTimestamp(activity.createdAt),
    };

    // Remove undefined fields
    Object.keys(firestoreData).forEach(key => {
      if (firestoreData[key] === undefined) {
        delete firestoreData[key];
      }
    });

    await firestoreService.setDoc('leadActivities', activityId, firestoreData);
    return activity;
  },

  async getComments(leadId: string): Promise<Comment[]> {
    const { ensureFirebase, isFirebaseReady } = await import('../firebase/config');
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      return [];
    }

    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const { firestoreService } = await import('../firebase/firestore');
    const { timestampToDate } = await import('../firebase/firestore');

    try {
      const comments = await firestoreService.getDocs<Comment>(
        'leadComments',
        [where('leadId', '==', leadId)]
      );

      return comments.map(comment => ({
        ...comment,
        createdAt: timestampToDate(comment.createdAt) || new Date(),
        updatedAt: comment.updatedAt ? timestampToDate(comment.updatedAt) : undefined,
      })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: any) {
      console.error('[LeadHistory] Error getting comments:', error);
      // Si es error de permisos, retornar array vacío en lugar de fallar
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('[LeadHistory] Permission denied, returning empty array');
        return [];
      }
      return [];
    }
  },

  async addComment(leadId: string, userId: string, userName: string, content: string): Promise<Comment> {
    const { ensureFirebase, isFirebaseReady } = await import('../firebase/config');
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      return leadHistoryServiceMock.addComment(leadId, userId, userName, content);
    }

    const { firestoreService } = await import('../firebase/firestore');
    const { dateToTimestamp } = await import('../firebase/firestore');

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const comment: Comment = {
      id: commentId,
      leadId,
      userId,
      userName,
      content,
      createdAt: new Date(),
    };

    const firestoreData = {
      ...comment,
      createdAt: dateToTimestamp(comment.createdAt),
    };

    await firestoreService.setDoc('leadComments', commentId, firestoreData);
    return comment;
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const { ensureFirebase, isFirebaseReady } = await import('../firebase/config');
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }

    const { firestoreService } = await import('../firebase/firestore');
    const { timestampToDate, dateToTimestamp } = await import('../firebase/firestore');

    const comment = await firestoreService.getDoc<Comment>('leadComments', commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const updatedComment: Comment = {
      ...comment,
      content,
      updatedAt: new Date(),
      createdAt: timestampToDate(comment.createdAt) || new Date(),
    };

    const firestoreData: any = {
      ...updatedComment,
      createdAt: dateToTimestamp(updatedComment.createdAt),
      updatedAt: dateToTimestamp(updatedComment.updatedAt!),
    };

    await firestoreService.updateDoc('leadComments', commentId, firestoreData);
    return updatedComment;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { ensureFirebase, isFirebaseReady } = await import('../firebase/config');
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }

    const { firestoreService } = await import('../firebase/firestore');
    await firestoreService.deleteDoc('leadComments', commentId);
  },
};

// Lazy load Firebase service
let firebaseService: any = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  
  try {
    firebaseService = leadHistoryServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const leadHistoryService = {
  async getActivities(leadId: string): Promise<LeadActivity[]> {
    const service = await getFirebaseService();
    return service ? service.getActivities(leadId) : leadHistoryServiceMock.getActivities(leadId);
  },

  async addActivity(
    leadId: string,
    userId: string,
    type: ActivityType,
    description: string,
    metadata?: LeadActivity['metadata']
  ): Promise<LeadActivity> {
    const service = await getFirebaseService();
    return service 
      ? service.addActivity(leadId, userId, type, description, metadata)
      : leadHistoryServiceMock.addActivity(leadId, userId, type, description, metadata);
  },

  async getComments(leadId: string): Promise<Comment[]> {
    const service = await getFirebaseService();
    return service ? service.getComments(leadId) : leadHistoryServiceMock.getComments(leadId);
  },

  async addComment(leadId: string, userId: string, userName: string, content: string): Promise<Comment> {
    const service = await getFirebaseService();
    return service 
      ? service.addComment(leadId, userId, userName, content)
      : leadHistoryServiceMock.addComment(leadId, userId, userName, content);
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const service = await getFirebaseService();
    if (!service) throw new Error('Firebase service not available');
    return service.updateComment(commentId, content);
  },

  async deleteComment(commentId: string): Promise<void> {
    const service = await getFirebaseService();
    if (!service) {
      return leadHistoryServiceMock.deleteComment(commentId);
    }
    return service.deleteComment(commentId);
  },
};

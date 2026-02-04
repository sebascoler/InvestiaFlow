import { ScheduledTask } from '../types/scheduledTask';
import { Lead } from '../types/lead';
import { AutomationRule } from '../types/automation';
import { automationService } from './automationService';
import { leadService } from './leadService';
import { firestoreService, dateToTimestamp, timestampToDate } from '../firebase/firestore';
import { isFirebaseReady, ensureFirebase } from '../firebase/config';

const COLLECTION_NAME = 'scheduledTasks';

// Check if Firebase is configured
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Helper to convert Firestore data to ScheduledTask
const firestoreToTask = (data: any): ScheduledTask => {
  return {
    ...data,
    scheduledAt: timestampToDate(data.scheduledAt) || new Date(),
    executedAt: timestampToDate(data.executedAt),
    createdAt: timestampToDate(data.createdAt) || new Date(),
  } as ScheduledTask;
};

// Helper to convert ScheduledTask to Firestore data
const taskToFirestore = (task: Partial<ScheduledTask>): any => {
  const data: any = { ...task };
  
  // Remove undefined fields
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Convert dates to timestamps
  if (data.scheduledAt) data.scheduledAt = dateToTimestamp(data.scheduledAt);
  if (data.executedAt) data.executedAt = dateToTimestamp(data.executedAt);
  if (data.createdAt) data.createdAt = dateToTimestamp(data.createdAt);
  
  return data;
};

// Mock implementation
const scheduledTaskServiceMock = {
  async createTask(
    userId: string,
    leadId: string,
    ruleId: string,
    scheduledAt: Date
  ): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      leadId,
      ruleId,
      scheduledAt,
      executedAt: null,
      status: 'pending',
      createdAt: new Date(),
    };
    
    console.log('[ScheduledTask] Mock task created:', task);
    return task;
  },

  async getPendingTasks(userId: string): Promise<ScheduledTask[]> {
    // Mock: return empty array
    return [];
  },

  async executeTask(taskId: string): Promise<void> {
    console.log(`[ScheduledTask] Mock executing task: ${taskId}`);
  },
};

// Firebase implementation
const scheduledTaskServiceFirebase = {
  async createTask(
    userId: string,
    leadId: string,
    ruleId: string,
    scheduledAt: Date
  ): Promise<ScheduledTask> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: ScheduledTask = {
      id: taskId,
      userId,
      leadId,
      ruleId,
      scheduledAt,
      executedAt: null,
      status: 'pending',
      createdAt: new Date(),
    };

    const firestoreData = taskToFirestore(task);
    await firestoreService.setDoc(COLLECTION_NAME, taskId, firestoreData);
    
    return task;
  },

  async getPendingTasks(userId: string): Promise<ScheduledTask[]> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      // Return empty array if Firebase not available (mock mode)
      return [];
    }

    try {
      // Load where function directly from firebase/firestore
      const firebaseFirestore = await import('firebase/firestore');
      const where = firebaseFirestore.where;
      
      if (!where) {
        console.warn('[ScheduledTask] where function not available, returning empty array');
        return [];
      }
      
      const now = new Date();
      const tasks = await firestoreService.getDocs<ScheduledTask>(
        COLLECTION_NAME,
        [
          where('userId', '==', userId),
          where('status', '==', 'pending')
        ]
      );
      
      // Filter tasks that are due (scheduledAt <= now)
      return tasks
        .map(firestoreToTask)
        .filter(task => task.scheduledAt <= now);
    } catch (error: any) {
      // If permission error, return empty array (user might not have access yet)
      if (error.message?.includes('permission') || error.code === 'permission-denied') {
        console.warn('[ScheduledTask] Permission denied, returning empty array');
        return [];
      }
      throw error;
    }
  },

  async executeTask(taskId: string): Promise<void> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firestore not available');
    }

    const task = await firestoreService.getDoc<ScheduledTask>(COLLECTION_NAME, taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const taskData = firestoreToTask(task);
    
    // Mark as executing
    await firestoreService.updateDoc(COLLECTION_NAME, taskId, {
      status: 'executing',
    });

    try {
      // Get lead and rule
      const lead = await leadService.getLead(taskData.leadId);
      const rule = await automationService.getRule(taskData.ruleId);

      if (!lead || !rule) {
        throw new Error('Lead or rule not found');
      }

      // Execute the rule
      await automationService.executeRule(lead, rule);

      // Mark as completed
      await firestoreService.updateDoc(COLLECTION_NAME, taskId, {
        status: 'completed',
        executedAt: new Date(),
      });
    } catch (error: any) {
      // Mark as failed
      await firestoreService.updateDoc(COLLECTION_NAME, taskId, {
        status: 'failed',
        error: error.message || 'Unknown error',
        executedAt: new Date(),
      });
      throw error;
    }
  },
};

// Lazy load Firebase service
let firebaseService: any = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  
  try {
    await ensureFirebase();
    if (isFirebaseReady()) {
      firebaseService = scheduledTaskServiceFirebase;
      return firebaseService;
    }
    return null;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const scheduledTaskService = {
  async createTask(
    userId: string,
    leadId: string,
    ruleId: string,
    scheduledAt: Date
  ): Promise<ScheduledTask> {
    const service = await getFirebaseService();
    return service 
      ? service.createTask(userId, leadId, ruleId, scheduledAt)
      : scheduledTaskServiceMock.createTask(userId, leadId, ruleId, scheduledAt);
  },

  async getPendingTasks(userId: string): Promise<ScheduledTask[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getPendingTasks(userId)
      : scheduledTaskServiceMock.getPendingTasks(userId);
  },

  async executeTask(taskId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.executeTask(taskId)
      : scheduledTaskServiceMock.executeTask(taskId);
  },
};

// Function to check and execute pending tasks
// This should be called periodically (e.g., every minute via Cloud Function or client-side polling)
export const checkAndExecutePendingTasks = async (userId: string): Promise<void> => {
  try {
    const pendingTasks = await scheduledTaskService.getPendingTasks(userId);
    
    console.log(`[ScheduledTask] Found ${pendingTasks.length} pending tasks`);
    
    // Execute tasks in parallel (or sequentially if you prefer)
    await Promise.all(
      pendingTasks.map(task => 
        scheduledTaskService.executeTask(task.id).catch(error => {
          console.error(`[ScheduledTask] Error executing task ${task.id}:`, error);
        })
      )
    );
  } catch (error) {
    console.error('[ScheduledTask] Error checking pending tasks:', error);
  }
};

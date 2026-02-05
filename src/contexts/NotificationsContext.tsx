import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationType } from '../types/notification';
import { useAuth } from './AuthContext';
import { useTeam } from './TeamContext';
import { notificationService } from '../services/notificationService';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, actionUrl?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usingFirestore, setUsingFirestore] = useState(false);

  // Setup Firestore listener or load from localStorage
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const setupNotifications = async () => {
      await ensureFirebase();
      const useFirebase = isFirebaseReady();

      if (useFirebase) {
        // Use Firestore listener for real-time updates
        try {
          const firebaseFirestore = await import('firebase/firestore');
          const { db } = await import('../firebase/config');
          const dbInstance = db();
          
          if (dbInstance) {
            const { collection, query, where, orderBy, onSnapshot, or } = firebaseFirestore;
            const notificationsRef = collection(dbInstance, 'notifications');
            
            // Build query: filter by userId OR teamId (for migration period)
            let q;
            if (currentTeam?.id) {
              q = query(
                notificationsRef,
                or(
                  where('userId', '==', user.id),
                  where('teamId', '==', currentTeam.id)
                ),
                orderBy('createdAt', 'desc')
              );
            } else {
              q = query(
                notificationsRef,
                where('userId', '==', user.id),
                orderBy('createdAt', 'desc')
              );
            }

            const unsubscribe = onSnapshot(
              q,
              (snapshot) => {
                const firestoreNotifications: Notification[] = snapshot.docs.map((doc) => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                  } as Notification;
                });
                setNotifications(firestoreNotifications);
              },
              (error) => {
                console.error('Error listening to notifications:', error);
                // Fallback to loading once
                loadNotificationsOnce();
              }
            );

            setUsingFirestore(true);
            return () => unsubscribe();
          }
        } catch (error) {
          console.warn('Firestore listener not available, using localStorage:', error);
          loadFromLocalStorage();
        }
      } else {
        // Mock mode - use localStorage
        loadFromLocalStorage();
      }
    };

    const loadNotificationsOnce = async () => {
      try {
        const teamId = currentTeam?.id || null;
        const notifs = await notificationService.getNotifications(user.id, teamId);
        setNotifications(notifs);
      } catch (error) {
        console.error('Error loading notifications:', error);
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem('investiaflow_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(
            parsed.map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            }))
          );
        } catch (error) {
          console.error('Error loading notifications from localStorage:', error);
        }
      }
    };

    setupNotifications();
  }, [user, currentTeam?.id]);

  // Save to localStorage only in mock mode
  useEffect(() => {
    if (!usingFirestore && notifications.length > 0) {
      localStorage.setItem('investiaflow_notifications', JSON.stringify(notifications));
    }
  }, [notifications, usingFirestore]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      createdAt: new Date(),
      read: false,
      actionUrl,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Mantener máximo 50 notificaciones
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    
    // Update in Firestore if using Firebase
    if (usingFirestore) {
      try {
        await notificationService.markAsRead(user.id, id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Revert optimistic update
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: false } : n))
        );
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Update in Firestore if using Firebase
    if (usingFirestore) {
      try {
        await notificationService.markAllAsRead(user.id);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        // Revert optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: n.read })));
      }
    }
  };

  const removeNotification = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Delete from Firestore if using Firebase
    if (usingFirestore) {
      try {
        await notificationService.deleteNotification(user.id, id);
      } catch (error) {
        console.error('Error deleting notification:', error);
        // Reload notifications to revert
        const teamId = currentTeam?.id || null;
        const notifs = await notificationService.getNotifications(user.id, teamId);
        setNotifications(notifs);
      }
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

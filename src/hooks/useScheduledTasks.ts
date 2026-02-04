import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkAndExecutePendingTasks } from '../services/scheduledTaskService';

// Hook para verificar y ejecutar tareas programadas pendientes
// Se ejecuta cada minuto cuando el usuario está autenticado
export const useScheduledTasks = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Check immediately
    checkAndExecutePendingTasks(user.id).catch(error => {
      console.error('[useScheduledTasks] Error checking tasks:', error);
    });

    // Then check every minute
    const interval = setInterval(() => {
      checkAndExecutePendingTasks(user.id).catch(error => {
        console.error('[useScheduledTasks] Error checking tasks:', error);
      });
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [user, isAuthenticated]);
};

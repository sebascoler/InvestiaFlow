import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { LeadsProvider } from '../../contexts/LeadsContext';
import { DocumentsProvider } from '../../contexts/DocumentsContext';
import { AutomationProvider } from '../../contexts/AutomationContext';
import { NotificationsProvider } from '../../contexts/NotificationsContext';
import { MobileMenuProvider } from '../../contexts/MobileMenuContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useScheduledTasks } from '../../hooks/useScheduledTasks';
import { useLeadNotifications } from '../../hooks/useLeadNotifications';

// Inner component that uses the providers
const LayoutContent: React.FC = () => {
  useScheduledTasks();
  useLeadNotifications();
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider>
      <NotificationsProvider>
        <MobileMenuProvider>
          <LeadsProvider userId={user.id}>
            <DocumentsProvider userId={user.id}>
              <AutomationProvider userId={user.id}>
                <LayoutContent />
              </AutomationProvider>
            </DocumentsProvider>
          </LeadsProvider>
        </MobileMenuProvider>
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default Layout;

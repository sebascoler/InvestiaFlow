import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/crm') return 'CRM Pipeline';
  if (pathname === '/dataroom') return 'Data Room';
  if (pathname === '/automation') return 'Automation';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/help') return 'Help';
  return 'InvestiaFlow';
};

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { isOpen, toggleMenu } = useMobileMenu();

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Header] Menu button clicked, current state:', isOpen);
    toggleMenu();
    console.log('[Header] After toggle, new state should be:', !isOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Hamburger button - visible only on mobile */}
          <button
            onClick={handleMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative z-50 cursor-pointer"
            aria-label="Toggle menu"
            type="button"
          >
            {isOpen ? <X size={24} className="text-gray-900" /> : <Menu size={24} className="text-gray-900" />}
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">{pageTitle}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <NotificationBell />
          <div className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-gray-100 rounded-lg">
            <User size={18} className="lg:w-5 lg:h-5 text-gray-600" />
            <span className="text-xs lg:text-sm font-medium text-gray-700 hidden md:inline">{user?.name || 'User'}</span>
            {user?.email && (
              <span className="text-xs text-gray-500 hidden lg:inline">({user.email})</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

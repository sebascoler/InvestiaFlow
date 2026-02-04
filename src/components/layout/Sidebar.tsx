import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Zap, Settings, LogOut, HelpCircle, BarChart3, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'CRM Pipeline', href: '/crm', icon: LayoutDashboard },
  { name: 'Data Room', href: '/dataroom', icon: FolderOpen },
  { name: 'Automation', href: '/automation', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isOpen, closeMenu } = useMobileMenu();

  // Close menu when route changes (only if menu is open)
  useEffect(() => {
    if (isOpen) {
      closeMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only depend on pathname, not closeMenu to avoid infinite loop

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);


  return (
    <>
      {/* Overlay - visible only on mobile when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50
          lg:relative lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      <div className="p-4 lg:p-6 border-b border-gray-800 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">InvestiaFlow</h1>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">Fundraising CRM</p>
        </div>
        {/* Close button - visible only on mobile */}
        <button
          onClick={closeMenu}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 p-2 lg:p-4 overflow-y-auto min-h-0">
        <ul className="space-y-1 lg:space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href === '/dashboard' && location.pathname === '/') ||
                           (item.href === '/crm' && location.pathname === '/crm');
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={closeMenu}
                  className={`
                    flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className="lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-2 lg:p-4 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} className="lg:w-5 lg:h-5" />
          <span className="text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </div>
    </>
  );
};

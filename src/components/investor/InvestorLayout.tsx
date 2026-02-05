import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { investorAuthService } from '../../services/investorAuthService';
import { Button } from '../shared/Button';

interface InvestorLayoutProps {
  children: React.ReactNode;
}

export const InvestorLayout: React.FC<InvestorLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    investorAuthService.clearInvestorSession();
    navigate('/investor/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">InvestiaFlow</h1>
              <span className="ml-3 text-sm text-gray-500">Data Room</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

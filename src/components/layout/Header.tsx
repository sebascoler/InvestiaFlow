import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <User size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            {user?.email && (
              <span className="text-xs text-gray-500">({user.email})</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AutomationRule } from '../types/automation';
import { automationService } from '../services/automationService';

interface AutomationContextType {
  rules: AutomationRule[];
  loading: boolean;
  error: string | null;
  refreshRules: () => Promise<void>;
  createRule: (rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>) => Promise<AutomationRule>;
  updateRule: (id: string, updates: Partial<AutomationRule>) => Promise<AutomationRule>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<AutomationRule>;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export const useAutomation = () => {
  const context = useContext(AutomationContext);
  if (!context) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
};

interface AutomationProviderProps {
  children: ReactNode;
  userId: string;
}

export const AutomationProvider: React.FC<AutomationProviderProps> = ({ children, userId }) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRules = await automationService.getRules(userId);
      setRules(fetchedRules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRules();
  }, [userId]);

  const createRule = async (rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>): Promise<AutomationRule> => {
    try {
      setError(null);
      const newRule = await automationService.createRule(userId, rule);
      await refreshRules();
      return newRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create rule';
      setError(errorMessage);
      throw err;
    }
  };

  const updateRule = async (id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> => {
    try {
      setError(null);
      const updatedRule = await automationService.updateRule(id, updates);
      await refreshRules();
      return updatedRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update rule';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteRule = async (id: string): Promise<void> => {
    try {
      setError(null);
      await automationService.deleteRule(id);
      await refreshRules();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete rule';
      setError(errorMessage);
      throw err;
    }
  };

  const toggleRule = async (id: string): Promise<AutomationRule> => {
    try {
      setError(null);
      const updatedRule = await automationService.toggleRule(id);
      await refreshRules();
      return updatedRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle rule';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AutomationContext.Provider
      value={{
        rules,
        loading,
        error,
        refreshRules,
        createRule,
        updateRule,
        deleteRule,
        toggleRule,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

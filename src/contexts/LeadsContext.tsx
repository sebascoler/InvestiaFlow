import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, LeadFormData } from '../types/lead';
import { StageId } from '../types/stage';
import { leadService } from '../services/leadService';

interface LeadsContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
  createLead: (data: LeadFormData) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  changeStage: (id: string, newStage: StageId, stageChangeNotes?: string) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

interface LeadsProviderProps {
  children: ReactNode;
  userId: string;
}

export const LeadsProvider: React.FC<LeadsProviderProps> = ({ children, userId }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[LeadsContext] Refreshing leads for userId:', userId);
      const fetchedLeads = await leadService.getLeads(userId);
      console.log('[LeadsContext] Fetched leads:', fetchedLeads.length);
      setLeads(fetchedLeads);
    } catch (err) {
      console.error('[LeadsContext] Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLeads();
  }, [userId]);

  const createLead = async (data: LeadFormData): Promise<Lead> => {
    try {
      setError(null);
      const newLead = await leadService.createLead(userId, data);
      await refreshLeads();
      return newLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lead';
      setError(errorMessage);
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    try {
      setError(null);
      const updatedLead = await leadService.updateLead(id, updates);
      await refreshLeads();
      return updatedLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead';
      setError(errorMessage);
      throw err;
    }
  };

  const changeStage = async (id: string, newStage: StageId, stageChangeNotes?: string): Promise<Lead> => {
    try {
      setError(null);
      const updatedLead = await leadService.changeStage(id, newStage, stageChangeNotes);
      await refreshLeads();
      return updatedLead;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change stage';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteLead = async (id: string): Promise<void> => {
    try {
      setError(null);
      await leadService.deleteLead(id);
      await refreshLeads();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loading,
        error,
        refreshLeads,
        createLead,
        updateLead,
        changeStage,
        deleteLead,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

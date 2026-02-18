import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, StageId, DEFAULT_STAGES } from '../types/stage';
import { stageService } from '../services/stageService';
import { useTeam } from './TeamContext';

interface StagesContextType {
  stages: Stage[];
  loading: boolean;
  getStageById: (id: StageId) => Stage | undefined;
  getStageColor: (id: StageId) => { bg: string; border: string };
  getStageOrder: (id: StageId) => number;
  saveStages: (stages: Stage[]) => Promise<void>;
  refreshStages: () => Promise<void>;
}

const StagesContext = createContext<StagesContextType | undefined>(undefined);

export const StagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTeam } = useTeam();
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [loading, setLoading] = useState(true);

  const loadStages = useCallback(async () => {
    try {
      setLoading(true);
      const loaded = await stageService.getStages(currentTeam?.id);
      setStages(loaded.length > 0 ? loaded : DEFAULT_STAGES);
    } catch (error) {
      console.warn('Failed to load stages:', error);
      setStages(DEFAULT_STAGES);
    } finally {
      setLoading(false);
    }
  }, [currentTeam?.id]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const getStageById = useCallback((id: StageId): Stage | undefined => {
    return stages.find(s => s.id === id);
  }, [stages]);

  const getStageColor = useCallback((id: StageId): { bg: string; border: string } => {
    const stage = stages.find(s => s.id === id);
    const color = stage?.color || 'gray';
    return {
      bg: `bg-${color}-100`,
      border: `border-${color}-300`,
    };
  }, [stages]);

  const getStageOrder = useCallback((id: StageId): number => {
    const stage = stages.find(s => s.id === id);
    return stage?.order ?? 999;
  }, [stages]);

  const handleSaveStages = useCallback(async (newStages: Stage[]) => {
    if (!currentTeam?.id) return;
    await stageService.saveStages(currentTeam.id, newStages);
    setStages(newStages);
  }, [currentTeam?.id]);

  const value = useMemo(() => ({
    stages,
    loading,
    getStageById,
    getStageColor,
    getStageOrder,
    saveStages: handleSaveStages,
    refreshStages: loadStages,
  }), [stages, loading, getStageById, getStageColor, getStageOrder, handleSaveStages, loadStages]);

  return (
    <StagesContext.Provider value={value}>
      {children}
    </StagesContext.Provider>
  );
};

export const useStages = (): StagesContextType => {
  const context = useContext(StagesContext);
  if (!context) {
    throw new Error('useStages must be used within a StagesProvider');
  }
  return context;
};

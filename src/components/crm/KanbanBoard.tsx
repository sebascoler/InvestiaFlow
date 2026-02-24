import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { StageId } from '../../types/stage';
import { Lead } from '../../types/lead';
import { StageColumn } from './StageColumn';
import { StageChangeModal, CommitmentData } from './StageChangeModal';
import { useLeads } from '../../contexts/LeadsContext';
import { useStages } from '../../contexts/StagesContext';
import { Loader } from '../shared/Loader';

interface KanbanBoardProps {
  leads?: Lead[]; // Leads filtrados (opcional, si no se pasa usa todos)
  filteredStages?: StageId[]; // Stages seleccionados en el filtro (opcional)
  onLeadClick: (lead: Lead) => void;
  onAddLead: (stageId?: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads: filteredLeads, filteredStages, onLeadClick, onAddLead }) => {
  const { leads: allLeads, loading, changeStage } = useLeads();
  const { stages } = useStages();
  const leads = filteredLeads || allLeads;
  const [pendingStageChange, setPendingStageChange] = useState<{
    leadId: string;
    leadName: string;
    fromStage: StageId;
    toStage: StageId;
  } | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === result.source.droppableId) return;

    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;

    const fromStage = lead.stage as StageId;
    const toStage = destination.droppableId as StageId;

    // Abrir modal para pedir notas
    setPendingStageChange({
      leadId: draggableId,
      leadName: lead.name,
      fromStage,
      toStage,
    });
  };

  const handleStageChangeConfirm = async (notes: string, commitmentData?: CommitmentData) => {
    if (!pendingStageChange) return;

    try {
      await changeStage(pendingStageChange.leadId, pendingStageChange.toStage, notes, commitmentData);
      setPendingStageChange(null);
    } catch (error) {
      console.error('Error changing stage:', error);
    }
  };

  const getLeadsByStage = (stageId: string): Lead[] => {
    return leads.filter(lead => lead.stage === stageId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  const totalLeads = leads.length;

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        {totalLeads === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads yet</h3>
              <p className="text-gray-500 mb-6">
                Start building your investor pipeline by adding your first lead
              </p>
              <button
                onClick={() => onAddLead()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Your First Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4" role="region" aria-label="Investor pipeline board">
            {(filteredStages && filteredStages.length > 0
              ? stages.filter(stage => filteredStages.includes(stage.id))
              : stages
            ).map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsByStage(stage.id)}
                onLeadClick={onLeadClick}
                onAddLead={() => onAddLead(stage.id)}
              />
            ))}
          </div>
        )}
      </DragDropContext>

      {pendingStageChange && (
        <StageChangeModal
          isOpen={!!pendingStageChange}
          onClose={() => setPendingStageChange(null)}
          onSubmit={handleStageChangeConfirm}
          fromStage={pendingStageChange.fromStage}
          toStage={pendingStageChange.toStage}
          leadName={pendingStageChange.leadName}
        />
      )}
    </>
  );
};

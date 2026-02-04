import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '../components/crm/KanbanBoard';
import { LeadModal } from '../components/crm/LeadModal';
import { LeadDetailPanel } from '../components/crm/LeadDetailPanel';
import { StageChangeModal } from '../components/crm/StageChangeModal';
import { Button } from '../components/shared/Button';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { useLeads } from '../contexts/LeadsContext';
import { Lead, LeadFormData } from '../types/lead';
import { StageId } from '../types/stage';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const CRMPage: React.FC = () => {
  const { createLead, updateLead, deleteLead, changeStage } = useLeads();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [initialStage, setInitialStage] = useState<StageId | undefined>();
  const [pendingStageChange, setPendingStageChange] = useState<{
    leadId: string;
    leadName: string;
    fromStage: StageId;
    toStage: StageId;
    otherUpdates: Partial<Lead>;
  } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddLead = (stageId?: string) => {
    setInitialStage(stageId as StageId | undefined);
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailPanelOpen(true);
  };

  const handleModalSubmit = async (data: LeadFormData & { stage?: StageId }) => {
    try {
      if (selectedLead) {
        // Edit mode - verificar si cambió el stage
        const stageChanged = data.stage && data.stage !== selectedLead.stage;
        
        if (stageChanged) {
          // Si cambió el stage, pedir notas primero
          setPendingStageChange({
            leadId: selectedLead.id,
            leadName: selectedLead.name,
            fromStage: selectedLead.stage,
            toStage: data.stage!,
            otherUpdates: data,
          });
          setIsModalOpen(false);
          return;
        } else {
          // Si no cambió el stage, actualizar normalmente
          await updateLead(selectedLead.id, data);
          addToast('Lead updated successfully', 'success');
        }
      } else {
        // Create mode
        await createLead(data);
        addToast('Lead created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedLead(null);
      setInitialStage(undefined);
    } catch (error) {
      addToast('Failed to save lead', 'error');
    }
  };

  const handleStageChangeConfirm = async (notes: string) => {
    if (!pendingStageChange) return;

    try {
      // Cambiar stage con notas
      await changeStage(pendingStageChange.leadId, pendingStageChange.toStage, notes);
      
      // Aplicar otros updates si los hay
      if (Object.keys(pendingStageChange.otherUpdates).length > 0) {
        await updateLead(pendingStageChange.leadId, pendingStageChange.otherUpdates);
      }
      
      addToast('Lead updated successfully', 'success');
      setPendingStageChange(null);
      
      // Si el panel estaba abierto, cerrarlo para refrescar
      if (isDetailPanelOpen) {
        setIsDetailPanelOpen(false);
        setSelectedLead(null);
      }
    } catch (error) {
      addToast('Failed to update lead', 'error');
    }
  };

  const handleEdit = () => {
    setIsDetailPanelOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedLead) {
      try {
        await deleteLead(selectedLead.id);
        addToast('Lead deleted successfully', 'success');
        setIsDetailPanelOpen(false);
        setSelectedLead(null);
      } catch (error) {
        addToast('Failed to delete lead', 'error');
      }
    }
  };

  return (
    <div className={`relative ${isDetailPanelOpen ? 'mr-96' : ''} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
        <Button
          variant="primary"
          onClick={() => handleAddLead()}
        >
          <Plus size={20} className="mr-2" />
          Add Lead
        </Button>
      </div>

      <KanbanBoard
        onLeadClick={handleLeadClick}
        onAddLead={handleAddLead}
      />

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
          setInitialStage(undefined);
        }}
        onSubmit={handleModalSubmit}
        lead={selectedLead}
        initialStage={initialStage}
      />

      {isDetailPanelOpen && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => {
            setIsDetailPanelOpen(false);
            setSelectedLead(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default CRMPage;

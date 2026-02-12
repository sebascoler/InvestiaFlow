import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '../components/crm/KanbanBoard';
import { LeadModal } from '../components/crm/LeadModal';
import { LeadDetailPanel } from '../components/crm/LeadDetailPanel';
import { StageChangeModal } from '../components/crm/StageChangeModal';
import { SearchAndFilters, FilterOptions } from '../components/crm/SearchAndFilters';
import { Button } from '../components/shared/Button';
import { PermissionGate } from '../components/shared/PermissionGate';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { Tour } from '../components/onboarding/Tour';
import { getTourSteps } from '../utils/onboardingSteps';
import { useOnboarding } from '../hooks/useOnboarding';
import { useLeads } from '../contexts/LeadsContext';
import { Lead, LeadFormData } from '../types/lead';
import { StageId } from '../types/stage';
import { filterAndSortLeads } from '../utils/leadFilters';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const CRMPage: React.FC = () => {
  const { leads, createLead, updateLead, deleteLead, changeStage } = useLeads();
  const { shouldShowTutorial, progress } = useOnboarding();
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
  const [showTour, setShowTour] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    stages: [],
    tags: [],
    dateRange: { start: null, end: null },
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Show tour if user should see CRM tutorial
  useEffect(() => {
    if (shouldShowTutorial('crm') && progress && !progress.completed) {
      const verifyElements = () => {
        const addLead = document.querySelector('[data-tour="crm-add-lead"]');
        const kanban = document.querySelector('[data-tour="crm-kanban"]');
        return addLead !== null && kanban !== null;
      };
      
      const timer = setTimeout(() => {
        if (verifyElements()) {
          setShowTour(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowTour(false);
    }
  }, [shouldShowTutorial, progress]);

  // Obtener todos los tags únicos de los leads
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    leads.forEach(lead => {
      lead.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [leads]);

  // Filtrar y ordenar leads
  const filteredLeads = useMemo(() => {
    return filterAndSortLeads(leads, filters);
  }, [leads, filters]);

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
        setIsModalOpen(false);
        setSelectedLead(null);
        setInitialStage(undefined);
      }
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

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      stages: [],
      tags: [],
      dateRange: { start: null, end: null },
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  return (
    <>
      {showTour && (
        <Tour
          steps={getTourSteps('crm')}
          tourId="crm"
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
      <div className={`relative ${isDetailPanelOpen ? 'mr-96' : ''} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
          <PermissionGate action="create" resource="leads">
            <Button
              variant="primary"
              onClick={() => handleAddLead()}
              data-tour="crm-add-lead"
            >
              <Plus size={20} className="mr-2" />
              Add Lead
            </Button>
          </PermissionGate>
        </div>

        <div data-tour="crm-filters">
          <SearchAndFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
            availableTags={availableTags}
          />
        </div>

        <div data-tour="crm-kanban">
          <KanbanBoard
            leads={filteredLeads}
            filteredStages={filters.stages.length > 0 ? filters.stages : undefined}
            onLeadClick={handleLeadClick}
            onAddLead={handleAddLead}
          />
        </div>

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
    </>
  );
};

export default CRMPage;

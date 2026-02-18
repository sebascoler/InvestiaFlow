import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { Stage, DEFAULT_STAGES } from '../../types/stage';
import { useStages } from '../../contexts/StagesContext';
import { Button } from '../shared/Button';
import { StageEditorModal } from './StageEditorModal';

export const StageManager: React.FC = () => {
  const { stages, saveStages } = useStages();
  const [localStages, setLocalStages] = useState<Stage[]>([]);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalStages([...stages]);
    setHasChanges(false);
  }, [stages]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(localStages);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const reindexed = items.map((s, i) => ({ ...s, order: i }));
    setLocalStages(reindexed);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveStages(localStages);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save stages:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (stageId: string) => {
    const updated = localStages.filter(s => s.id !== stageId).map((s, i) => ({ ...s, order: i }));
    setLocalStages(updated);
    setHasChanges(true);
  };

  const handleEditSave = (stage: Stage) => {
    if (isAddingNew) {
      const newStages = [...localStages, { ...stage, order: localStages.length }];
      setLocalStages(newStages);
    } else {
      const updated = localStages.map(s => s.id === stage.id ? stage : s);
      setLocalStages(updated);
    }
    setEditingStage(null);
    setIsAddingNew(false);
    setHasChanges(true);
  };

  const handleResetDefaults = () => {
    setLocalStages([...DEFAULT_STAGES]);
    setHasChanges(true);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingStage({
      id: '',
      name: '',
      emoji: '📌',
      color: 'gray',
      order: localStages.length,
      isDefault: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Stages</h3>
          <p className="text-sm text-gray-500">Customize your fundraising pipeline stages. Drag to reorder.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleResetDefaults} disabled={isSaving}>
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {localStages.map((stage, index) => (
                <Draggable key={stage.id} draggableId={stage.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
                        snapshot.isDragging ? 'shadow-lg border-primary-300' : 'border-gray-200'
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                        <GripVertical size={20} />
                      </div>
                      <span className="text-xl">{stage.emoji}</span>
                      <span className="flex-1 font-medium text-gray-900">{stage.name}</span>
                      <div className={`w-6 h-6 rounded bg-${stage.color}-200 border border-${stage.color}-400`} />
                      <button
                        onClick={() => { setIsAddingNew(false); setEditingStage(stage); }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(stage.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={localStages.length <= 2}
                        title={localStages.length <= 2 ? 'Must have at least 2 stages' : 'Delete stage'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={handleAddNew}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
      >
        <Plus size={20} />
        Add Stage
      </button>

      {editingStage && (
        <StageEditorModal
          isOpen={true}
          onClose={() => { setEditingStage(null); setIsAddingNew(false); }}
          stage={editingStage}
          isNew={isAddingNew}
          existingIds={localStages.map(s => s.id)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

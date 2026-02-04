import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { StageId, STAGES } from '../../types/stage';

interface StageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => Promise<void>;
  fromStage: StageId;
  toStage: StageId;
  leadName: string;
}

export const StageChangeModal: React.FC<StageChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fromStage,
  toStage,
  leadName,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromStageData = STAGES.find(s => s.id === fromStage);
  const toStageData = STAGES.find(s => s.id === toStage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      alert('Por favor, agrega una nota explicando por qué cambiaste el stage del lead.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error submitting stage change:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Actualizar Stage del Lead"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">
            Estás moviendo <strong>{leadName}</strong> de:
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{fromStageData?.emoji}</span>
            <span className="font-medium text-gray-900">{fromStageData?.name}</span>
            <span className="text-gray-400">→</span>
            <span className="text-xl">{toStageData?.emoji}</span>
            <span className="font-medium text-gray-900">{toStageData?.name}</span>
          </div>
          <p className="text-xs text-gray-600">
            Por favor, agrega una nota explicando el motivo del cambio. Esto te ayudará a mantener 
            un registro claro del progreso del lead.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota del cambio (requerido) *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Lead solicitó más información sobre métricas. Compartimos dashboard y quedó muy interesado. Avanzamos a Pitch Shared."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta nota se agregará automáticamente a las notas del lead
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!notes.trim()}>
            Confirmar Cambio
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { StageId } from '../../types/stage';
import { useStages } from '../../contexts/StagesContext';

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
  const { getStageById } = useStages();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromStageData = getStageById(fromStage);
  const toStageData = getStageById(toStage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      alert('Please add a note explaining why you changed the lead\'s stage.');
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
      title="Update Lead Stage"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2">
            You are moving <strong>{leadName}</strong> from:
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{fromStageData?.emoji}</span>
            <span className="font-medium text-gray-900">{fromStageData?.name}</span>
            <span className="text-gray-400">→</span>
            <span className="text-xl">{toStageData?.emoji}</span>
            <span className="font-medium text-gray-900">{toStageData?.name}</span>
          </div>
          <p className="text-xs text-gray-600">
            Please add a note explaining the reason for the change. This will help you keep
            a clear record of the lead&apos;s progress.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Change note (required) *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="E.g.: Lead requested more information on metrics. We shared the dashboard and they were very interested. Moved to Pitch Shared."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This note will be added automatically to the lead&apos;s notes
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!notes.trim()}>
            Confirm Change
          </Button>
        </div>
      </form>
    </Modal>
  );
};

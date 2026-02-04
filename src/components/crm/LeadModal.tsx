import React, { useState, useEffect } from 'react';
import { Lead, LeadFormData } from '../../types/lead';
import { StageId, STAGES } from '../../types/stage';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import { isValidEmail, isValidUrl } from '../../utils/validators';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData & { stage?: StageId }) => Promise<void>;
  lead?: Lead | null;
  initialStage?: StageId;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lead,
  initialStage,
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    firm: '',
    notes: '',
    linkedinUrl: '',
    phoneNumber: '',
  });
  const [stage, setStage] = useState<StageId>(initialStage || 'target');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        firm: lead.firm,
        notes: lead.notes || '',
        linkedinUrl: lead.linkedinUrl || '',
        phoneNumber: lead.phoneNumber || '',
      });
      setStage(lead.stage);
    } else {
      setFormData({
        name: '',
        email: '',
        firm: '',
        notes: '',
        linkedinUrl: '',
        phoneNumber: '',
      });
      setStage(initialStage || 'target');
    }
    setErrors({});
  }, [lead, initialStage, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.firm.trim()) {
      newErrors.firm = 'Firm is required';
    }

    if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Invalid URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        stage: lead ? stage : undefined, // Only include stage when editing
      });
      onClose();
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageOptions = STAGES.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'Add New Lead'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        <Input
          label="Firm *"
          value={formData.firm}
          onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
          error={errors.firm}
          required
        />

        <Input
          label="LinkedIn URL"
          value={formData.linkedinUrl || ''}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          error={errors.linkedinUrl}
          placeholder="https://linkedin.com/in/..."
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phoneNumber || ''}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />

        {lead && (
          <Select
            label="Stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as StageId)}
            options={stageOptions}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add any notes about this lead..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {lead ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

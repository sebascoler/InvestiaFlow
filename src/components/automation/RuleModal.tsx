import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import { AutomationRule } from '../../types/automation';
import { StageId, STAGES } from '../../types/stage';
import { Document } from '../../types/document';

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  rule?: AutomationRule | null;
  documents: Document[];
}

export const RuleModal: React.FC<RuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rule,
  documents,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    triggerStage: 'target' as StageId,
    documentIds: [] as string[],
    delayDays: 0,
    emailSubject: '',
    emailBody: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        triggerStage: rule.triggerStage,
        documentIds: rule.documentIds,
        delayDays: rule.delayDays,
        emailSubject: rule.emailSubject,
        emailBody: rule.emailBody,
        isActive: rule.isActive,
      });
    } else {
      setFormData({
        name: '',
        triggerStage: 'target',
        documentIds: [],
        delayDays: 0,
        emailSubject: '',
        emailBody: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [rule, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (formData.documentIds.length === 0) {
      newErrors.documents = 'At least one document must be selected';
    }

    if (formData.emailBody && !formData.emailSubject) {
      newErrors.emailSubject = 'Email subject is required when email body is provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentToggle = (documentId: string) => {
    setFormData((prev) => ({
      ...prev,
      documentIds: prev.documentIds.includes(documentId)
        ? prev.documentIds.filter((id) => id !== documentId)
        : [...prev.documentIds, documentId],
    }));
  };

  const stageOptions = STAGES.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Rule Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g., Share Pitch Deck on Pitch Shared"
          required
        />

        <Select
          label="Trigger Stage *"
          value={formData.triggerStage}
          onChange={(e) => setFormData({ ...formData, triggerStage: e.target.value as StageId })}
          options={stageOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documents * (Select at least one)
          </label>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No documents available. Upload documents first.</p>
          ) : (
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {documents.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.documentIds.includes(doc.id)}
                    onChange={() => handleDocumentToggle(doc.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">{doc.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">({doc.category})</span>
                </label>
              ))}
            </div>
          )}
          {errors.documents && (
            <p className="mt-1 text-sm text-red-600">{errors.documents}</p>
          )}
        </div>

        <Input
          label="Delay (days after stage)"
          type="number"
          min="0"
          value={formData.delayDays}
          onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
        <p className="text-xs text-gray-500 -mt-2">
          {formData.delayDays === 0
            ? 'Documents will be shared immediately when lead reaches this stage'
            : `Documents will be shared ${formData.delayDays} day(s) after lead reaches this stage`}
        </p>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Email Notification (Optional)</h4>
          
          <Input
            label="Email Subject"
            value={formData.emailSubject}
            onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
            error={errors.emailSubject}
            placeholder="e.g., 📊 New Documents Available"
          />

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <textarea
              value={formData.emailBody}
              onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Hi {{name}},\n\nWe've shared documents with you...\n\nBest regards,\nInvestiaFlow Team"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use variables: {'{{name}}'}, {'{{firm}}'}, {'{{email}}'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label className="text-sm text-gray-700 cursor-pointer">
            Activate this rule immediately
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

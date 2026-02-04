import React, { useState } from 'react';
import { RulesManager } from '../components/automation/RulesManager';
import { RuleModal } from '../components/automation/RuleModal';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { useAutomation } from '../contexts/AutomationContext';
import { useDocuments } from '../contexts/DocumentsContext';
import { AutomationRule } from '../types/automation';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const AutomationPage: React.FC = () => {
  const { createRule, updateRule, deleteRule } = useAutomation();
  const { documents } = useDocuments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleSubmit = async (rule: Omit<AutomationRule, 'id' | 'userId' | 'createdAt'>) => {
    try {
      if (selectedRule) {
        await updateRule(selectedRule.id, rule);
        addToast('Rule updated successfully', 'success');
      } else {
        await createRule(rule);
        addToast('Rule created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedRule(null);
    } catch (error) {
      addToast('Failed to save rule', 'error');
      throw error;
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this automation rule?')) {
      try {
        await deleteRule(ruleId);
        addToast('Rule deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete rule', 'error');
      }
    }
  };

  return (
    <div>
      <RulesManager
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />

      <RuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRule(null);
        }}
        onSubmit={handleSubmit}
        rule={selectedRule}
        documents={documents}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AutomationPage;

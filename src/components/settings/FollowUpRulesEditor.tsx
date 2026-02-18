import React, { useState, useEffect } from 'react';
import { Plus, X, RotateCcw, Save } from 'lucide-react';
import { FollowUpRule, DEFAULT_FOLLOW_UP_RULES, ReminderPriority } from '../../types/reminder';
import { useTeam } from '../../contexts/TeamContext';
import { useStages } from '../../contexts/StagesContext';
import { Button } from '../shared/Button';
import { Select } from '../shared/Select';
import { Input } from '../shared/Input';
import { ToastContainer, ToastType } from '../shared/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const FollowUpRulesEditor: React.FC = () => {
  const { currentTeam } = useTeam();
  const { stages } = useStages();
  const [rules, setRules] = useState<FollowUpRule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const stageOptions: { value: string; label: string }[] = [
    { value: '*', label: 'All Stages' },
    ...stages.map((s) => ({ value: s.id, label: `${s.emoji} ${s.name}` })),
  ];

  useEffect(() => {
    const teamRules = currentTeam?.settings?.followUpRules;
    setRules(teamRules && teamRules.length > 0 ? [...teamRules] : [...DEFAULT_FOLLOW_UP_RULES]);
    setHasChanges(false);
  }, [currentTeam]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRuleChange = (index: number, field: keyof FollowUpRule, value: string | number) => {
    setRules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasChanges(true);
  };

  const handleAddRule = () => {
    const newRule: FollowUpRule = {
      id: `rule-${Date.now()}`,
      stageId: '*',
      daysSinceContact: 14,
      priority: 'medium',
      message: '',
    };
    setRules((prev) => [...prev, newRule]);
    setHasChanges(true);
  };

  const handleDeleteRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save rules to team settings via teamService when the update endpoint is implemented.
      // Example: await teamService.updateSettings(currentTeam.id, { followUpRules: rules });
      console.log('TODO: Save rules to team settings:', rules);
      addToast('Rules saved', 'success');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save follow-up rules:', error);
      addToast('Failed to save rules', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setRules([...DEFAULT_FOLLOW_UP_RULES]);
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Follow-up Rules</h3>
          <p className="text-sm text-gray-500">
            Configure when reminders appear based on stage and days since last contact.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleResetDefaults} disabled={isSaving}>
            <RotateCcw size={16} className="mr-1" />
            Reset to Defaults
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving} disabled={!hasChanges}>
            <Save size={16} className="mr-1" />
            Save Rules
          </Button>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg"
          >
            {/* Stage selector */}
            <div className="w-48 shrink-0">
              <Select
                value={rule.stageId}
                onChange={(e) => handleRuleChange(index, 'stageId', e.target.value)}
                options={stageOptions}
              />
            </div>

            {/* Days input */}
            <div className="w-24 shrink-0">
              <Input
                type="number"
                min={1}
                value={rule.daysSinceContact}
                onChange={(e) =>
                  handleRuleChange(index, 'daysSinceContact', Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                placeholder="Days"
              />
            </div>

            {/* Priority dropdown */}
            <div className="w-32 shrink-0">
              <Select
                value={rule.priority}
                onChange={(e) => handleRuleChange(index, 'priority', e.target.value as ReminderPriority)}
                options={PRIORITY_OPTIONS}
              />
            </div>

            {/* Message input */}
            <div className="flex-1">
              <Input
                type="text"
                value={rule.message}
                onChange={(e) => handleRuleChange(index, 'message', e.target.value)}
                placeholder="Reminder message..."
              />
            </div>

            {/* Delete button */}
            <button
              onClick={() => handleDeleteRule(index)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-1"
              title="Delete rule"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add rule button */}
      <button
        onClick={handleAddRule}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
      >
        <Plus size={20} />
        Add Rule
      </button>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

FollowUpRulesEditor.displayName = 'FollowUpRulesEditor';

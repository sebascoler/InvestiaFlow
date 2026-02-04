import React from 'react';
import { Plus } from 'lucide-react';
import { RuleCard } from './RuleCard';
import { Button } from '../shared/Button';
import { Loader } from '../shared/Loader';
import { useAutomation } from '../../contexts/AutomationContext';
import { useDocuments } from '../../contexts/DocumentsContext';
import { AutomationRule } from '../../types/automation';

interface RulesManagerProps {
  onEdit: (rule: AutomationRule) => void;
  onCreate: () => void;
  onDelete: (ruleId: string) => Promise<void>;
}

export const RulesManager: React.FC<RulesManagerProps> = ({
  onEdit,
  onCreate,
  onDelete,
}) => {
  const { rules, loading, toggleRule } = useAutomation();
  const { documents } = useDocuments();

  const handleToggle = async (ruleId: string) => {
    try {
      await toggleRule(ruleId);
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Automation Rules</h2>
          <p className="text-sm text-gray-600 mt-1">
            Automatically share documents when leads reach specific stages
          </p>
        </div>
        <Button variant="primary" onClick={onCreate}>
          <Plus size={18} className="mr-2" />
          Create Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">No automation rules yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Create your first rule to automatically share documents with leads
          </p>
          <Button variant="primary" onClick={onCreate}>
            <Plus size={18} className="mr-2" />
            Create Your First Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              documents={documents}
              onToggle={() => handleToggle(rule.id)}
              onEdit={() => onEdit(rule)}
              onDelete={() => onDelete(rule.id)}
            />
          ))}
        </div>
      )}

      {rules.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Rules are executed automatically when a lead moves to the trigger stage.
            Check the browser console to see automation logs.
          </p>
        </div>
      )}
    </div>
  );
};

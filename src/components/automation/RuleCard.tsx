import React from 'react';
import { ToggleLeft, ToggleRight, Edit, Trash2, FileText, Clock, Mail } from 'lucide-react';
import { AutomationRule } from '../../types/automation';
import { STAGES } from '../../types/stage';
import { formatDate } from '../../utils/formatters';

interface RuleCardProps {
  rule: AutomationRule;
  documents: Array<{ id: string; name: string }>;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  documents,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const triggerStage = STAGES.find(s => s.id === rule.triggerStage);
  const ruleDocuments = documents.filter(doc => rule.documentIds.includes(doc.id));

  return (
    <div className={`bg-white rounded-lg border-2 p-5 ${rule.isActive ? 'border-green-200' : 'border-gray-200 opacity-75'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {rule.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-lg">{triggerStage?.emoji}</span>
              <span>Triggers on: <strong>{triggerStage?.name}</strong></span>
            </div>
            {rule.delayDays > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Delay: {rule.delayDays} day(s)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            title={rule.isActive ? 'Deactivate' : 'Activate'}
            aria-label={rule.isActive ? 'Deactivate' : 'Activate'}
          >
            {rule.isActive ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
            title="Edit"
            aria-label="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FileText size={14} />
            <span className="font-medium">Documents ({ruleDocuments.length}):</span>
          </div>
          {ruleDocuments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ruleDocuments.map((doc) => (
                <span
                  key={doc.id}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {doc.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No documents selected</p>
          )}
        </div>

        {rule.emailBody && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Mail size={14} />
              <span className="font-medium">Email:</span>
            </div>
            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
              <strong>Subject:</strong> {rule.emailSubject}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Created {formatDate(rule.createdAt)}
        </div>
      </div>
    </div>
  );
};

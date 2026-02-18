import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { FollowUpReminder, PRIORITY_CONFIG } from '../../types/reminder';
import { useStages } from '../../contexts/StagesContext';

interface ReminderCardProps {
  reminder: FollowUpReminder;
  onLeadClick?: (leadId: string) => void;
}

const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
};

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onLeadClick }) => {
  const { getStageById } = useStages();
  const config = PRIORITY_CONFIG[reminder.priority];
  const stage = getStageById(reminder.leadStage);

  return (
    <div
      className={`
        border rounded-lg border-l-4 p-4
        ${PRIORITY_BORDER[reminder.priority] ?? 'border-l-gray-400'}
        ${config.bgColor}
        ${config.borderColor}
        transition-all duration-200 hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Priority badge */}
          <span
            className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${config.bgColor} ${config.color} ${config.borderColor} border
            `}
          >
            {config.label}
          </span>

          {/* Lead name and firm */}
          <div className="mt-2">
            <h4 className="font-semibold text-gray-900 truncate">{reminder.leadName}</h4>
            <p className="text-sm text-gray-600 truncate">{reminder.leadFirm}</p>
          </div>

          {/* Stage */}
          {stage && (
            <p className="text-sm text-gray-500 mt-1">
              {stage.emoji} {stage.name}
            </p>
          )}

          {/* Days since contact */}
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>{reminder.daysSinceContact} days since last contact</span>
          </div>

          {/* Rule message */}
          <p className="text-sm text-gray-700 mt-1">{reminder.message}</p>
        </div>

        {/* View lead link */}
        {onLeadClick && (
          <button
            onClick={() => onLeadClick(reminder.leadId)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 transition-colors whitespace-nowrap shrink-0 mt-1"
          >
            View Lead
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

ReminderCard.displayName = 'ReminderCard';

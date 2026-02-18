import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { useReminders } from '../../hooks/useReminders';
import { ReminderCard } from './ReminderCard';

interface RemindersListProps {
  maxItems?: number;
  onLeadClick?: (leadId: string) => void;
}

export const RemindersList: React.FC<RemindersListProps> = ({
  maxItems = 5,
  onLeadClick,
}) => {
  const { reminders, reminderCount } = useReminders();
  const visibleReminders = reminders.slice(0, maxItems);
  const hasMore = reminderCount > maxItems;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Follow-up Reminders</h3>
          {reminderCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              {reminderCount}
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {reminderCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle size={40} className="text-green-500 mb-3" />
          <p className="text-gray-600 font-medium">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No follow-ups needed.</p>
        </div>
      )}

      {/* Reminder cards */}
      {reminderCount > 0 && (
        <div className="space-y-3">
          {visibleReminders.map((reminder) => (
            <ReminderCard
              key={`${reminder.leadId}-${reminder.rule.id}`}
              reminder={reminder}
              onLeadClick={onLeadClick}
            />
          ))}
        </div>
      )}

      {/* View all link */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all {reminderCount} reminders
          </button>
        </div>
      )}
    </div>
  );
};

RemindersList.displayName = 'RemindersList';

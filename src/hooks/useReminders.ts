import { useMemo } from 'react';
import { useLeads } from '../contexts/LeadsContext';
import { useTeam } from '../contexts/TeamContext';
import { calculateReminders } from '../utils/reminderCalculator';
import { FollowUpReminder, DEFAULT_FOLLOW_UP_RULES } from '../types/reminder';

export function useReminders(): {
  reminders: FollowUpReminder[];
  reminderCount: number;
  urgentCount: number;
} {
  const { leads } = useLeads();
  const { currentTeam } = useTeam();

  const rules = currentTeam?.settings?.followUpRules ?? DEFAULT_FOLLOW_UP_RULES;

  const reminders = useMemo(() => calculateReminders(leads, rules), [leads, rules]);

  const urgentCount = useMemo(
    () => reminders.filter(r => r.priority === 'urgent' || r.priority === 'high').length,
    [reminders]
  );

  return {
    reminders,
    reminderCount: reminders.length,
    urgentCount,
  };
}

import { Lead } from '../types/lead';
import { FollowUpRule, FollowUpReminder, PRIORITY_CONFIG, DEFAULT_FOLLOW_UP_RULES } from '../types/reminder';

/**
 * Calculate follow-up reminders for leads based on rules.
 * For each lead:
 * 1. If no lastContactDate, use createdAt as the reference date
 * 2. Find the most specific matching rule (stage-specific rules beat wildcard '*')
 * 3. If days since contact >= rule.daysSinceContact, create a reminder
 * 4. Only return the highest-priority matching reminder per lead
 * Returns reminders sorted by priority (urgent first), then by days overdue (most overdue first)
 */
export function calculateReminders(
  leads: Lead[],
  rules?: FollowUpRule[]
): FollowUpReminder[] {
  const activeRules = rules && rules.length > 0 ? rules : DEFAULT_FOLLOW_UP_RULES;
  const now = new Date();
  const reminders: FollowUpReminder[] = [];

  for (const lead of leads) {
    const referenceDate = lead.lastContactDate || lead.createdAt;
    if (!referenceDate) continue;

    const daysSince = Math.floor((now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

    // Find all matching rules for this lead
    const matchingRules = activeRules.filter(rule => {
      if (daysSince < rule.daysSinceContact) return false;
      return rule.stageId === '*' || rule.stageId === lead.stage;
    });

    if (matchingRules.length === 0) continue;

    // Pick the most specific + highest priority rule
    // 1. Prefer stage-specific over wildcard
    // 2. Among same specificity, prefer higher priority (lower order number)
    const bestRule = matchingRules.sort((a, b) => {
      const aSpecific = a.stageId !== '*' ? 0 : 1;
      const bSpecific = b.stageId !== '*' ? 0 : 1;
      if (aSpecific !== bSpecific) return aSpecific - bSpecific;
      return PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
    })[0];

    reminders.push({
      leadId: lead.id,
      leadName: lead.name,
      leadEmail: lead.email,
      leadFirm: lead.firm,
      leadStage: lead.stage,
      daysSinceContact: daysSince,
      priority: bestRule.priority,
      message: bestRule.message,
      rule: bestRule,
    });
  }

  // Sort: priority (urgent first), then days overdue (most first)
  return reminders.sort((a, b) => {
    const priorityDiff = PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
    if (priorityDiff !== 0) return priorityDiff;
    return b.daysSinceContact - a.daysSinceContact;
  });
}

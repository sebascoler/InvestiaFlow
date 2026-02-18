import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateReminders } from './reminderCalculator';
import { Lead } from '../types/lead';
import { FollowUpRule } from '../types/reminder';

const NOW = new Date('2025-03-01T12:00:00Z');

const makeLead = (overrides: Partial<Lead>): Lead => ({
  id: 'lead-1',
  userId: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  firm: 'Acme VC',
  stage: 'target',
  stageEnteredAt: new Date('2025-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  lastContactDate: null,
  notes: '',
  ...overrides,
});

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

describe('calculateReminders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array for no leads', () => {
    const result = calculateReminders([]);
    expect(result).toEqual([]);
  });

  it('returns empty array for recently contacted leads', () => {
    const leads = [
      makeLead({ id: 'l1', lastContactDate: daysAgo(2) }),
      makeLead({ id: 'l2', lastContactDate: daysAgo(5) }),
    ];
    const result = calculateReminders(leads);
    expect(result).toEqual([]);
  });

  it('creates reminder for lead not contacted in 14+ days (default rule)', () => {
    const leads = [
      makeLead({ id: 'l1', lastContactDate: daysAgo(20) }),
    ];
    const result = calculateReminders(leads);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      leadId: 'l1',
      daysSinceContact: 20,
      priority: 'medium',
      message: 'Follow up needed',
    });
  });

  it('prefers stage-specific rule over wildcard', () => {
    const leads = [
      makeLead({
        id: 'l1',
        stage: 'due_diligence',
        lastContactDate: daysAgo(14),
      }),
    ];
    // Default rules include both wildcard (14d, medium) and due_diligence (7d, high)
    const result = calculateReminders(leads);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      leadId: 'l1',
      priority: 'high',
      message: 'Due diligence stalled',
    });
  });

  it('uses createdAt when lastContactDate is null', () => {
    const leads = [
      makeLead({
        id: 'l1',
        lastContactDate: null,
        createdAt: daysAgo(30),
      }),
    ];
    const result = calculateReminders(leads);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      leadId: 'l1',
      daysSinceContact: 30,
      priority: 'medium',
    });
  });

  it('sorts by priority (urgent first) then by days overdue', () => {
    const leads = [
      makeLead({
        id: 'l-medium-30',
        stage: 'target',
        lastContactDate: daysAgo(30),
      }),
      makeLead({
        id: 'l-urgent-10',
        stage: 'term_sheet',
        lastContactDate: daysAgo(10),
      }),
      makeLead({
        id: 'l-high-20',
        stage: 'due_diligence',
        lastContactDate: daysAgo(20),
      }),
      makeLead({
        id: 'l-medium-15',
        stage: 'target',
        lastContactDate: daysAgo(15),
      }),
    ];

    const result = calculateReminders(leads);
    expect(result).toHaveLength(4);
    // urgent first
    expect(result[0].leadId).toBe('l-urgent-10');
    expect(result[0].priority).toBe('urgent');
    // then high
    expect(result[1].leadId).toBe('l-high-20');
    expect(result[1].priority).toBe('high');
    // then medium sorted by days overdue descending
    expect(result[2].leadId).toBe('l-medium-30');
    expect(result[2].daysSinceContact).toBe(30);
    expect(result[3].leadId).toBe('l-medium-15');
    expect(result[3].daysSinceContact).toBe(15);
  });

  it('returns one reminder per lead (highest priority)', () => {
    // A lead in due_diligence at 14 days matches both the wildcard (14d, medium)
    // and the stage-specific rule (7d, high). Only the high-priority one should appear.
    const leads = [
      makeLead({
        id: 'l1',
        stage: 'due_diligence',
        lastContactDate: daysAgo(14),
      }),
    ];
    const result = calculateReminders(leads);
    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe('high');
  });

  it('works with custom rules overriding defaults', () => {
    const customRules: FollowUpRule[] = [
      { id: 'custom-1', stageId: '*', daysSinceContact: 3, priority: 'low', message: 'Gentle nudge' },
    ];
    const leads = [
      makeLead({ id: 'l1', lastContactDate: daysAgo(5) }),
    ];
    const result = calculateReminders(leads, customRules);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      leadId: 'l1',
      priority: 'low',
      message: 'Gentle nudge',
      daysSinceContact: 5,
    });
  });

  it('wildcard rule matches all stages', () => {
    const customRules: FollowUpRule[] = [
      { id: 'wild', stageId: '*', daysSinceContact: 10, priority: 'medium', message: 'Check in' },
    ];
    const leads = [
      makeLead({ id: 'l1', stage: 'target', lastContactDate: daysAgo(15) }),
      makeLead({ id: 'l2', stage: 'due_diligence', lastContactDate: daysAgo(12) }),
      makeLead({ id: 'l3', stage: 'term_sheet', lastContactDate: daysAgo(11) }),
      makeLead({ id: 'l4', stage: 'closed', lastContactDate: daysAgo(5) }), // under threshold
    ];
    const result = calculateReminders(leads, customRules);
    expect(result).toHaveLength(3);
    expect(result.every(r => r.message === 'Check in')).toBe(true);
    // l4 should NOT be in results (only 5 days < 10)
    expect(result.find(r => r.leadId === 'l4')).toBeUndefined();
  });
});

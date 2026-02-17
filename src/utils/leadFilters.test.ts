import { describe, it, expect } from 'vitest';
import { filterAndSortLeads } from './leadFilters';
import { Lead } from '../types/lead';
import { FilterOptions } from '../components/crm/SearchAndFilters';

const makeLead = (overrides: Partial<Lead>): Lead => ({
  id: 'lead-1',
  userId: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  firm: 'Acme VC',
  stage: 'target',
  stageEnteredAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastContactDate: null,
  notes: '',
  ...overrides,
});

const defaultFilters: FilterOptions = {
  searchQuery: '',
  stages: [],
  tags: [],
  dateRange: { start: null, end: null },
  sortBy: 'name',
  sortOrder: 'asc',
};

const leads: Lead[] = [
  makeLead({ id: '1', name: 'Alice Smith', firm: 'Alpha Capital', stage: 'target', tags: ['seed', 'ai'], createdAt: new Date('2024-01-01') }),
  makeLead({ id: '2', name: 'Bob Jones', firm: 'Beta Fund', stage: 'first_contact', tags: ['series-a'], createdAt: new Date('2024-02-01') }),
  makeLead({ id: '3', name: 'Charlie Brown', firm: 'Gamma Ventures', stage: 'committed', tags: ['seed'], createdAt: new Date('2024-03-01') }),
];

describe('filterAndSortLeads', () => {
  it('returns all leads with default filters', () => {
    const result = filterAndSortLeads(leads, defaultFilters);
    expect(result).toHaveLength(3);
  });

  it('filters by search query (name)', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, searchQuery: 'alice' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice Smith');
  });

  it('filters by search query (firm)', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, searchQuery: 'gamma' });
    expect(result).toHaveLength(1);
    expect(result[0].firm).toBe('Gamma Ventures');
  });

  it('filters by search query (tag)', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, searchQuery: 'series-a' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob Jones');
  });

  it('filters by stage', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, stages: ['target', 'committed'] });
    expect(result).toHaveLength(2);
    expect(result.map(l => l.name).sort()).toEqual(['Alice Smith', 'Charlie Brown']);
  });

  it('filters by tags (AND logic)', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, tags: ['seed'] });
    expect(result).toHaveLength(2); // Alice and Charlie
    const result2 = filterAndSortLeads(leads, { ...defaultFilters, tags: ['seed', 'ai'] });
    expect(result2).toHaveLength(1); // Only Alice has both
    expect(result2[0].name).toBe('Alice Smith');
  });

  it('sorts by name ascending', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, sortBy: 'name', sortOrder: 'asc' });
    expect(result.map(l => l.name)).toEqual(['Alice Smith', 'Bob Jones', 'Charlie Brown']);
  });

  it('sorts by name descending', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, sortBy: 'name', sortOrder: 'desc' });
    expect(result.map(l => l.name)).toEqual(['Charlie Brown', 'Bob Jones', 'Alice Smith']);
  });

  it('sorts by createdAt', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, sortBy: 'createdAt', sortOrder: 'asc' });
    expect(result.map(l => l.name)).toEqual(['Alice Smith', 'Bob Jones', 'Charlie Brown']);
  });

  it('sorts by stage order', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, sortBy: 'stage', sortOrder: 'asc' });
    expect(result.map(l => l.stage)).toEqual(['target', 'first_contact', 'committed']);
  });

  it('combines search + stage filter + sort', () => {
    const allLeads = [
      ...leads,
      makeLead({ id: '4', name: 'Alice Wang', stage: 'target', tags: [], createdAt: new Date('2024-04-01') }),
    ];
    const result = filterAndSortLeads(allLeads, {
      ...defaultFilters,
      searchQuery: 'alice',
      stages: ['target'],
      sortBy: 'name',
      sortOrder: 'desc',
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice Wang');
    expect(result[1].name).toBe('Alice Smith');
  });

  it('returns empty for no matches', () => {
    const result = filterAndSortLeads(leads, { ...defaultFilters, searchQuery: 'nonexistent' });
    expect(result).toHaveLength(0);
  });
});

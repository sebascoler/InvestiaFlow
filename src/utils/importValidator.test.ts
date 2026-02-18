import { describe, it, expect } from 'vitest';
import { validateRows, mapRowToLeadData } from './importValidator';
import { ImportColumnMapping } from '../types/import';
import { Stage } from '../types/stage';

const STAGES: Stage[] = [
  { id: 'target', name: 'Target', emoji: '', color: 'slate', order: 0 },
  { id: 'first_contact', name: 'First Contact', emoji: '', color: 'blue', order: 1 },
  { id: 'committed', name: 'Committed', emoji: '', color: 'green', order: 6 },
];

const DEFAULT_MAPPINGS: ImportColumnMapping[] = [
  { sourceColumn: 'Name', targetField: 'name', confidence: 1.0 },
  { sourceColumn: 'Email', targetField: 'email', confidence: 1.0 },
  { sourceColumn: 'Company', targetField: 'firm', confidence: 1.0 },
  { sourceColumn: 'Stage', targetField: 'stage', confidence: 1.0 },
  { sourceColumn: 'Notes', targetField: 'notes', confidence: 1.0 },
  { sourceColumn: 'Tags', targetField: 'tags', confidence: 1.0 },
];

describe('validateRows', () => {
  it('validates required name field', () => {
    const rows = [
      { Name: '', Email: 'john@example.com', Company: 'Acme', Stage: '', Notes: '', Tags: '' },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result).toHaveLength(1);
    expect(result[0].rowNumber).toBe(1);
    expect(result[0].errors).toContain('Name is required');
  });

  it('validates required name when not mapped', () => {
    const mappingsWithoutName: ImportColumnMapping[] = [
      { sourceColumn: 'Email', targetField: 'email', confidence: 1.0 },
    ];
    const rows = [{ Email: 'john@example.com' }];
    const result = validateRows(rows, mappingsWithoutName, [], STAGES);

    expect(result[0].errors).toContain('Name is required');
  });

  it('validates email format', () => {
    const rows = [
      { Name: 'John', Email: 'not-an-email', Company: 'Acme', Stage: '', Notes: '', Tags: '' },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[0].errors).toContain('Invalid email');
  });

  it('validates email when empty', () => {
    const rows = [
      { Name: 'John', Email: '', Company: 'Acme', Stage: '', Notes: '', Tags: '' },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[0].errors).toContain('Invalid email');
  });

  it('validates email when not mapped', () => {
    const mappingsWithoutEmail: ImportColumnMapping[] = [
      { sourceColumn: 'Name', targetField: 'name', confidence: 1.0 },
    ];
    const rows = [{ Name: 'John' }];
    const result = validateRows(rows, mappingsWithoutEmail, [], STAGES);

    expect(result[0].errors).toContain('Invalid email');
  });

  it('detects duplicate emails within file', () => {
    const rows = [
      { Name: 'John', Email: 'john@example.com', Company: 'Acme', Stage: '', Notes: '', Tags: '' },
      { Name: 'Jane', Email: 'john@example.com', Company: 'Beta', Stage: '', Notes: '', Tags: '' },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[0].warnings).toHaveLength(0);
    expect(result[1].warnings).toContain('Duplicate email in file');
  });

  it('detects duplicate emails case-insensitively', () => {
    const rows = [
      { Name: 'John', Email: 'John@Example.com', Company: 'Acme', Stage: '', Notes: '', Tags: '' },
      { Name: 'Jane', Email: 'john@example.com', Company: 'Beta', Stage: '', Notes: '', Tags: '' },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[1].warnings).toContain('Duplicate email in file');
  });

  it('detects existing lead emails', () => {
    const existingEmails = ['existing@example.com'];
    const rows = [
      {
        Name: 'John',
        Email: 'existing@example.com',
        Company: 'Acme',
        Stage: '',
        Notes: '',
        Tags: '',
      },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, existingEmails, STAGES);

    expect(result[0].warnings).toContain('Lead already exists');
  });

  it('detects existing lead emails case-insensitively', () => {
    const existingEmails = ['Existing@Example.com'];
    const rows = [
      {
        Name: 'John',
        Email: 'existing@example.com',
        Company: 'Acme',
        Stage: '',
        Notes: '',
        Tags: '',
      },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, existingEmails, STAGES);

    expect(result[0].warnings).toContain('Lead already exists');
  });

  it('validates stage values against stages array', () => {
    const rows = [
      {
        Name: 'John',
        Email: 'john@example.com',
        Company: 'Acme',
        Stage: 'Unknown Stage',
        Notes: '',
        Tags: '',
      },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[0].warnings).toContain('Unknown stage, will use default');
  });

  it('accepts valid stage by name (case-insensitive)', () => {
    const rows = [
      {
        Name: 'John',
        Email: 'john@example.com',
        Company: 'Acme',
        Stage: 'target',
        Notes: '',
        Tags: '',
      },
      {
        Name: 'Jane',
        Email: 'jane@example.com',
        Company: 'Beta',
        Stage: 'First Contact',
        Notes: '',
        Tags: '',
      },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[0].warnings).not.toContain('Unknown stage, will use default');
    expect(result[1].warnings).not.toContain('Unknown stage, will use default');
  });

  it('does not warn about stage when no stage mapping exists', () => {
    const mappingsWithoutStage: ImportColumnMapping[] = [
      { sourceColumn: 'Name', targetField: 'name', confidence: 1.0 },
      { sourceColumn: 'Email', targetField: 'email', confidence: 1.0 },
    ];
    const rows = [{ Name: 'John', Email: 'john@example.com' }];
    const result = validateRows(rows, mappingsWithoutStage, [], STAGES);

    expect(result[0].warnings).not.toContain('Unknown stage, will use default');
  });

  it('returns correct row numbers (1-indexed)', () => {
    const rows = [
      { Name: 'John', Email: 'john@example.com', Company: 'Acme', Stage: '', Notes: '', Tags: '' },
      { Name: 'Jane', Email: 'jane@example.com', Company: 'Beta', Stage: '', Notes: '', Tags: '' },
      { Name: 'Bob', Email: 'bob@example.com', Company: 'Corp', Stage: '', Notes: '', Tags: '' },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, [], STAGES);

    expect(result[0].rowNumber).toBe(1);
    expect(result[1].rowNumber).toBe(2);
    expect(result[2].rowNumber).toBe(3);
  });

  it('returns errors and warnings as separate arrays', () => {
    const existingEmails = ['john@example.com'];
    const rows = [
      {
        Name: '',
        Email: 'john@example.com',
        Company: 'Acme',
        Stage: 'bad-stage',
        Notes: '',
        Tags: '',
      },
    ];
    const result = validateRows(rows, DEFAULT_MAPPINGS, existingEmails, STAGES);

    // Name missing should be an error
    expect(result[0].errors).toContain('Name is required');
    // Existing email should be a warning
    expect(result[0].warnings).toContain('Lead already exists');
    // Bad stage should be a warning
    expect(result[0].warnings).toContain('Unknown stage, will use default');
  });
});

describe('mapRowToLeadData', () => {
  it('maps basic fields correctly', () => {
    const row = {
      Name: 'John Doe',
      Email: 'john@example.com',
      Company: 'Acme Corp',
      Stage: '',
      Notes: 'Some notes',
      Tags: '',
    };
    const result = mapRowToLeadData(row, DEFAULT_MAPPINGS, 'target', STAGES);

    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.firm).toBe('Acme Corp');
    expect(result.notes).toBe('Some notes');
  });

  it('resolves stage by id (case-insensitive)', () => {
    const row = {
      Name: 'John',
      Email: 'john@example.com',
      Company: 'Acme',
      Stage: 'First_Contact',
      Notes: '',
      Tags: '',
    };
    const result = mapRowToLeadData(row, DEFAULT_MAPPINGS, 'target', STAGES);

    expect(result.stage).toBe('first_contact');
  });

  it('resolves stage by name (case-insensitive)', () => {
    const row = {
      Name: 'John',
      Email: 'john@example.com',
      Company: 'Acme',
      Stage: 'committed',
      Notes: '',
      Tags: '',
    };
    const result = mapRowToLeadData(row, DEFAULT_MAPPINGS, 'target', STAGES);

    expect(result.stage).toBe('committed');
  });

  it('falls back to default stage for unrecognized values', () => {
    const row = {
      Name: 'John',
      Email: 'john@example.com',
      Company: 'Acme',
      Stage: 'nonexistent',
      Notes: '',
      Tags: '',
    };
    const result = mapRowToLeadData(row, DEFAULT_MAPPINGS, 'target', STAGES);

    expect(result.stage).toBe('target');
  });

  it('uses default stage when stage column is empty', () => {
    const row = {
      Name: 'John',
      Email: 'john@example.com',
      Company: 'Acme',
      Stage: '',
      Notes: '',
      Tags: '',
    };
    const result = mapRowToLeadData(row, DEFAULT_MAPPINGS, 'first_contact', STAGES);

    expect(result.stage).toBe('first_contact');
  });

  it('splits tags by comma', () => {
    const row = {
      Name: 'John',
      Email: 'john@example.com',
      Company: 'Acme',
      Stage: '',
      Notes: '',
      Tags: 'investor, angel, series-a',
    };
    const result = mapRowToLeadData(row, DEFAULT_MAPPINGS, 'target', STAGES);

    expect(result.tags).toEqual(['investor', 'angel', 'series-a']);
  });

  it('omits optional fields when not provided', () => {
    const mappingsMinimal: ImportColumnMapping[] = [
      { sourceColumn: 'Name', targetField: 'name', confidence: 1.0 },
      { sourceColumn: 'Email', targetField: 'email', confidence: 1.0 },
      { sourceColumn: 'Company', targetField: 'firm', confidence: 1.0 },
    ];
    const row = { Name: 'John', Email: 'john@example.com', Company: 'Acme' };
    const result = mapRowToLeadData(row, mappingsMinimal, 'target', STAGES);

    expect(result).not.toHaveProperty('notes');
    expect(result).not.toHaveProperty('linkedinUrl');
    expect(result).not.toHaveProperty('phoneNumber');
    expect(result).not.toHaveProperty('tags');
  });
});

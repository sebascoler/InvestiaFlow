import { describe, it, expect } from 'vitest';
import { autoMapColumns } from './importMapper';

describe('autoMapColumns', () => {
  it('maps exact header matches with confidence 1.0', () => {
    const headers = ['name', 'email', 'firm', 'notes', 'stage', 'tags', 'phone'];
    const result = autoMapColumns(headers);

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ sourceColumn: 'name', targetField: 'name', confidence: 1.0 });
    expect(result[1]).toEqual({ sourceColumn: 'email', targetField: 'email', confidence: 1.0 });
    expect(result[2]).toEqual({ sourceColumn: 'firm', targetField: 'firm', confidence: 1.0 });
    expect(result[3]).toEqual({ sourceColumn: 'notes', targetField: 'notes', confidence: 1.0 });
    expect(result[4]).toEqual({ sourceColumn: 'stage', targetField: 'stage', confidence: 1.0 });
    expect(result[5]).toEqual({ sourceColumn: 'tags', targetField: 'tags', confidence: 1.0 });
    expect(result[6]).toEqual({ sourceColumn: 'phone', targetField: 'phoneNumber', confidence: 1.0 });
  });

  it('maps case-insensitive matches', () => {
    const headers = ['Name', 'EMAIL', 'Firm', 'NOTES'];
    const result = autoMapColumns(headers);

    expect(result[0].targetField).toBe('name');
    expect(result[0].confidence).toBe(1.0);
    expect(result[1].targetField).toBe('email');
    expect(result[1].confidence).toBe(1.0);
    expect(result[2].targetField).toBe('firm');
    expect(result[2].confidence).toBe(1.0);
    expect(result[3].targetField).toBe('notes');
    expect(result[3].confidence).toBe(1.0);
  });

  it('maps alias matches (e.g., "company" to firm)', () => {
    const headers = ['company', 'e-mail', 'telephone', 'comments'];
    const result = autoMapColumns(headers);

    expect(result[0]).toEqual({ sourceColumn: 'company', targetField: 'firm', confidence: 1.0 });
    expect(result[1]).toEqual({ sourceColumn: 'e-mail', targetField: 'email', confidence: 1.0 });
    expect(result[2]).toEqual({
      sourceColumn: 'telephone',
      targetField: 'phoneNumber',
      confidence: 1.0,
    });
    expect(result[3]).toEqual({
      sourceColumn: 'comments',
      targetField: 'notes',
      confidence: 1.0,
    });
  });

  it('maps exact alias matches including multi-word aliases', () => {
    const headers = ['Investor Name', 'Email Address', 'Fund Name'];
    const result = autoMapColumns(headers);

    // "investor name" is an exact alias for name
    expect(result[0].targetField).toBe('name');
    expect(result[0].confidence).toBe(1.0);
    // "email address" is an exact alias for email
    expect(result[1].targetField).toBe('email');
    expect(result[1].confidence).toBe(1.0);
    // "fund name" is an exact alias for firm
    expect(result[2].targetField).toBe('firm');
    expect(result[2].confidence).toBe(1.0);
  });

  it('maps partial matches with confidence 0.8 when header contains an alias', () => {
    const headers = ['primary email (work)', 'my firm details', 'direct phone line'];
    const result = autoMapColumns(headers);

    expect(result[0].targetField).toBe('email');
    expect(result[0].confidence).toBe(0.8);
    expect(result[1].targetField).toBe('firm');
    expect(result[1].confidence).toBe(0.8);
    expect(result[2].targetField).toBe('phoneNumber');
    expect(result[2].confidence).toBe(0.8);
  });

  it('returns null targetField for unknown headers with confidence 0', () => {
    const headers = ['age', 'favorite color', 'random field'];
    const result = autoMapColumns(headers);

    expect(result[0]).toEqual({ sourceColumn: 'age', targetField: null, confidence: 0 });
    expect(result[1]).toEqual({ sourceColumn: 'favorite color', targetField: null, confidence: 0 });
    expect(result[2]).toEqual({ sourceColumn: 'random field', targetField: null, confidence: 0 });
  });

  it('handles Spanish-language aliases', () => {
    const headers = ['nombre', 'correo', 'empresa', 'notas', 'etapa', 'etiquetas'];
    const result = autoMapColumns(headers);

    expect(result[0].targetField).toBe('name');
    expect(result[1].targetField).toBe('email');
    expect(result[2].targetField).toBe('firm');
    expect(result[3].targetField).toBe('notes');
    expect(result[4].targetField).toBe('stage');
    expect(result[5].targetField).toBe('tags');
  });

  it('handles mixed known and unknown headers', () => {
    const headers = ['name', 'email', 'foo', 'bar', 'phone'];
    const result = autoMapColumns(headers);

    expect(result[0].targetField).toBe('name');
    expect(result[1].targetField).toBe('email');
    expect(result[2].targetField).toBeNull();
    expect(result[3].targetField).toBeNull();
    expect(result[4].targetField).toBe('phoneNumber');
  });

  it('returns appropriate confidence levels for each match type', () => {
    const headers = ['email', 'my firm details', 'unknown_column'];
    const result = autoMapColumns(headers);

    // Exact alias match
    expect(result[0].confidence).toBe(1.0);
    // Partial match (header contains alias "firm")
    expect(result[1].targetField).toBe('firm');
    expect(result[1].confidence).toBe(0.8);
    // No match
    expect(result[2].confidence).toBe(0);
  });
});

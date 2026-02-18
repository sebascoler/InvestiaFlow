import { ImportPreviewRow, ImportColumnMapping } from '../types/import';
import { Stage } from '../types/stage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Find the mapped value for a given target field within a row.
 */
function getMappedValue(
  row: Record<string, string>,
  mappings: ImportColumnMapping[],
  targetField: string
): string | undefined {
  const mapping = mappings.find((m) => m.targetField === targetField);
  if (!mapping) return undefined;
  return row[mapping.sourceColumn] ?? undefined;
}

/**
 * Validates all rows against the column mappings, checking for required fields,
 * email format, duplicate emails, existing leads, and stage validity.
 * Returns ImportPreviewRow[] with 1-indexed row numbers.
 */
export function validateRows(
  rows: Record<string, string>[],
  mappings: ImportColumnMapping[],
  existingEmails: string[],
  stages: Stage[]
): ImportPreviewRow[] {
  const existingEmailSet = new Set(existingEmails.map((e) => e.toLowerCase()));
  const seenEmails = new Set<string>();

  return rows.map((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate name: mapped and not empty
    const nameMapping = mappings.find((m) => m.targetField === 'name');
    if (nameMapping) {
      const nameValue = row[nameMapping.sourceColumn]?.trim();
      if (!nameValue) {
        errors.push('Name is required');
      }
    } else {
      errors.push('Name is required');
    }

    // Validate email: mapped and valid format
    const emailMapping = mappings.find((m) => m.targetField === 'email');
    if (emailMapping) {
      const emailValue = row[emailMapping.sourceColumn]?.trim();
      if (!emailValue) {
        errors.push('Invalid email');
      } else if (!EMAIL_REGEX.test(emailValue)) {
        errors.push('Invalid email');
      } else {
        const emailLower = emailValue.toLowerCase();

        // Check for duplicate within file
        if (seenEmails.has(emailLower)) {
          warnings.push('Duplicate email in file');
        }
        seenEmails.add(emailLower);

        // Check against existing leads
        if (existingEmailSet.has(emailLower)) {
          warnings.push('Lead already exists');
        }
      }
    } else {
      errors.push('Invalid email');
    }

    // Validate stage if mapped
    const stageMapping = mappings.find((m) => m.targetField === 'stage');
    if (stageMapping) {
      const stageValue = row[stageMapping.sourceColumn]?.trim();
      if (stageValue) {
        const matchesStage = stages.some(
          (s) =>
            s.id.toLowerCase() === stageValue.toLowerCase() ||
            s.name.toLowerCase() === stageValue.toLowerCase()
        );
        if (!matchesStage) {
          warnings.push('Unknown stage, will use default');
        }
      }
    }

    return {
      rowNumber: index + 1,
      data: row,
      errors,
      warnings,
    };
  });
}

/**
 * Maps a single row of imported data to lead fields based on column mappings.
 * Resolves stage by fuzzy matching against available stages (by id or name),
 * falling back to defaultStage. Splits tags by comma if provided as a string.
 */
export function mapRowToLeadData(
  row: Record<string, string>,
  mappings: ImportColumnMapping[],
  defaultStage: string,
  stages: Stage[]
): {
  name: string;
  email: string;
  firm: string;
  notes?: string;
  stage: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  tags?: string[];
} {
  const name = getMappedValue(row, mappings, 'name')?.trim() ?? '';
  const email = getMappedValue(row, mappings, 'email')?.trim() ?? '';
  const firm = getMappedValue(row, mappings, 'firm')?.trim() ?? '';
  const notes = getMappedValue(row, mappings, 'notes')?.trim() || undefined;
  const linkedinUrl = getMappedValue(row, mappings, 'linkedinUrl')?.trim() || undefined;
  const phoneNumber = getMappedValue(row, mappings, 'phoneNumber')?.trim() || undefined;

  // Resolve stage
  const rawStage = getMappedValue(row, mappings, 'stage')?.trim();
  let stage = defaultStage;
  if (rawStage) {
    const matchedStage = stages.find(
      (s) =>
        s.id.toLowerCase() === rawStage.toLowerCase() ||
        s.name.toLowerCase() === rawStage.toLowerCase()
    );
    if (matchedStage) {
      stage = matchedStage.id;
    }
  }

  // Resolve tags: split by comma if string
  const rawTags = getMappedValue(row, mappings, 'tags')?.trim();
  const tags = rawTags
    ? rawTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== '')
    : undefined;

  return {
    name,
    email,
    firm,
    ...(notes !== undefined && { notes }),
    stage,
    ...(linkedinUrl !== undefined && { linkedinUrl }),
    ...(phoneNumber !== undefined && { phoneNumber }),
    ...(tags !== undefined && { tags }),
  };
}

import { ImportColumnMapping } from '../types/import';

const FIELD_ALIASES: Record<string, string[]> = {
  name: ['name', 'full name', 'contact name', 'investor name', 'nombre', 'contact', 'investor'],
  email: ['email', 'e-mail', 'email address', 'correo', 'correo electr\u00f3nico', 'mail'],
  firm: ['firm', 'company', 'organization', 'fund', 'empresa', 'organizaci\u00f3n', 'fund name', 'org'],
  notes: ['notes', 'comments', 'description', 'notas', 'comentarios', 'note'],
  stage: ['stage', 'status', 'pipeline stage', 'etapa', 'pipeline', 'funnel stage'],
  tags: ['tags', 'labels', 'categories', 'etiquetas', 'tag', 'label'],
  linkedinUrl: ['linkedin', 'linkedin url', 'linkedin profile', 'linkedin link'],
  phoneNumber: [
    'phone',
    'telephone',
    'mobile',
    'telefono',
    'tel\u00e9fono',
    'phone number',
    'cell',
    'tel',
  ],
};

/**
 * Automatically maps CSV/XLSX headers to Lead fields using alias matching.
 * Returns confidence 1.0 for exact alias match, 0.8 for partial (contains) match,
 * and 0 with targetField = null for unrecognized headers.
 */
export function autoMapColumns(headers: string[]): ImportColumnMapping[] {
  return headers.map((header) => {
    const normalized = header.toLowerCase().trim();

    // Try exact match against aliases
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalized)) {
        return {
          sourceColumn: header,
          targetField: field,
          confidence: 1.0,
        };
      }
    }

    // Try partial match (header contains an alias as a substring)
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      for (const alias of aliases) {
        if (normalized.includes(alias)) {
          return {
            sourceColumn: header,
            targetField: field,
            confidence: 0.8,
          };
        }
      }
    }

    // No match found
    return {
      sourceColumn: header,
      targetField: null,
      confidence: 0,
    };
  });
}

/**
 * Returns the list of available target fields for column mapping UI.
 */
export function getAvailableTargetFields(): { value: string; label: string }[] {
  return [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'firm', label: 'Firm / Company' },
    { value: 'notes', label: 'Notes' },
    { value: 'stage', label: 'Stage' },
    { value: 'tags', label: 'Tags' },
    { value: 'linkedinUrl', label: 'LinkedIn URL' },
    { value: 'phoneNumber', label: 'Phone Number' },
  ];
}

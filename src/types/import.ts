export interface ImportColumnMapping {
  sourceColumn: string; // Header from CSV
  targetField: string | null; // Lead field name or null if skipped
  confidence: number; // 0-1, auto-detection confidence
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
}

export interface ImportConfig {
  mappings: ImportColumnMapping[];
  defaultStage: string;
  skipDuplicateEmails: boolean;
  tagImportedLeads: boolean;
  importTag: string;
}

export interface ImportResult {
  totalRows: number;
  created: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

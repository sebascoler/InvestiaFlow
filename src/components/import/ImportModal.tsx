import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../shared/Button';
import { FileUploadStep } from './FileUploadStep';
import { ColumnMappingStep } from './ColumnMappingStep';
import { PreviewStep } from './PreviewStep';
import { ImportResultStep } from './ImportResultStep';
import {
  ImportColumnMapping,
  ImportConfig,
  ImportResult,
  ImportPreviewRow,
  ImportError,
} from '../../types/import';
import { useStages } from '../../contexts/StagesContext';
import { useLeads } from '../../contexts/LeadsContext';
import { useAuth } from '../../contexts/AuthContext';
import { parseCSV } from '../../utils/csvParser';
import { parseXLSX } from '../../utils/xlsxParser';
import { autoMapColumns } from '../../utils/importMapper';
import { validateRows, mapRowToLeadData } from '../../utils/importValidator';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: ImportResult) => void;
}

const STEP_LABELS = ['Upload', 'Map Columns', 'Preview', 'Result'];

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { stages } = useStages();
  const { leads, createLead } = useLeads();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // Step 1: File data
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Step 2: Mappings + config
  const [mappings, setMappings] = useState<ImportColumnMapping[]>([]);
  const [config, setConfig] = useState<ImportConfig>({
    mappings: [],
    defaultStage: '',
    skipDuplicateEmails: true,
    tagImportedLeads: true,
    importTag: 'imported',
  });

  // Step 3: Preview
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);

  // Step 4: Result
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Set default stage when stages load
  useEffect(() => {
    if (stages.length > 0 && !config.defaultStage) {
      const defaultStage =
        stages.find((s) => s.order === 0) || stages[0];
      setConfig((prev) => ({ ...prev, defaultStage: defaultStage.id }));
    }
  }, [stages, config.defaultStage]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isImporting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isImporting, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setHeaders([]);
      setRows([]);
      setFileError(null);
      setMappings([]);
      setPreviewRows([]);
      setImportResult(null);
      setIsImporting(false);
      setConfig((prev) => ({
        ...prev,
        mappings: [],
        skipDuplicateEmails: true,
        tagImportedLeads: true,
        importTag: 'imported',
      }));
    }
  }, [isOpen]);

  // Step 1: Handle file selection
  const handleFileSelected = useCallback(
    async (file: File) => {
      setFileError(null);

      try {
        const extension = file.name.split('.').pop()?.toLowerCase();
        let parsed: { headers: string[]; rows: Record<string, string>[] };

        if (extension === 'csv') {
          const text = await file.text();
          parsed = parseCSV(text);
        } else if (extension === 'xlsx' || extension === 'xls') {
          parsed = await parseXLSX(file);
        } else {
          setFileError('Unsupported file format.');
          return;
        }

        if (parsed.headers.length === 0) {
          setFileError('No headers found in the file. Please check the file format.');
          return;
        }

        if (parsed.rows.length === 0) {
          setFileError('No data rows found in the file.');
          return;
        }

        setHeaders(parsed.headers);
        setRows(parsed.rows);

        // Auto-map columns
        const autoMappings = autoMapColumns(parsed.headers);
        setMappings(autoMappings);
        setConfig((prev) => ({ ...prev, mappings: autoMappings }));

        // Move to step 2
        setCurrentStep(1);
      } catch (err) {
        console.error('[ImportModal] Error parsing file:', err);
        setFileError(
          err instanceof Error
            ? `Error parsing file: ${err.message}`
            : 'Failed to parse file. Please check the format.'
        );
      }
    },
    []
  );

  // Step 2 -> 3: Validate and preview
  const handleGoToPreview = useCallback(() => {
    const existingEmails = leads.map((l) => l.email);
    const validated = validateRows(rows, mappings, existingEmails, stages);
    setPreviewRows(validated);
    setConfig((prev) => ({ ...prev, mappings }));
    setCurrentStep(2);
  }, [rows, mappings, leads, stages]);

  // Step 3 -> 4: Execute import
  const handleExecuteImport = useCallback(async () => {
    if (!user) return;

    setIsImporting(true);
    const result: ImportResult = {
      totalRows: rows.length,
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const previewRow of previewRows) {
      // Skip rows with errors
      if (previewRow.errors.length > 0) {
        result.skipped += 1;
        continue;
      }

      // Skip duplicate emails if configured
      if (
        config.skipDuplicateEmails &&
        previewRow.warnings.includes('Lead already exists')
      ) {
        result.skipped += 1;
        continue;
      }

      // Skip duplicate-in-file warnings are not blocking; they proceed

      try {
        const leadData = mapRowToLeadData(
          previewRow.data,
          mappings,
          config.defaultStage,
          stages
        );

        // Add import tag if configured
        const tags = leadData.tags ? [...leadData.tags] : [];
        if (config.tagImportedLeads && config.importTag) {
          tags.push(config.importTag);
        }

        await createLead({
          name: leadData.name,
          email: leadData.email,
          firm: leadData.firm,
          notes: leadData.notes,
          linkedinUrl: leadData.linkedinUrl,
          phoneNumber: leadData.phoneNumber,
          tags: tags.length > 0 ? tags : undefined,
        });

        result.created += 1;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        const importError: ImportError = {
          row: previewRow.rowNumber,
          field: 'general',
          message: errorMessage,
          value: previewRow.data[
            mappings.find((m) => m.targetField === 'email')?.sourceColumn ?? ''
          ] ?? '',
        };
        result.errors.push(importError);
      }
    }

    setImportResult(result);
    setIsImporting(false);
    setCurrentStep(3);
    onComplete(result);
  }, [
    user,
    rows,
    previewRows,
    mappings,
    config,
    stages,
    createLead,
    onComplete,
  ]);

  // Navigation
  const handleBack = useCallback(() => {
    if (currentStep > 0 && currentStep < 3) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      handleGoToPreview();
    } else if (currentStep === 2) {
      handleExecuteImport();
    }
  }, [currentStep, handleGoToPreview, handleExecuteImport]);

  const canGoNext = useCallback(() => {
    if (currentStep === 0) return false; // Must select file first
    if (currentStep === 1) {
      // Must have at least name and email mapped
      const hasMappedName = mappings.some((m) => m.targetField === 'name');
      const hasMappedEmail = mappings.some((m) => m.targetField === 'email');
      return hasMappedName && hasMappedEmail;
    }
    if (currentStep === 2) {
      // Must have at least one row without errors
      return previewRows.some((r) => r.errors.length === 0);
    }
    return false;
  }, [currentStep, mappings, previewRows]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isImporting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import Leads"
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Import Leads
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isImporting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close import modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-center">
            {STEP_LABELS.map((label, index) => (
              <React.Fragment key={label}>
                {index > 0 && (
                  <div
                    className={`h-0.5 w-12 mx-1 transition-colors ${
                      index <= currentStep
                        ? 'bg-primary-500'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      transition-colors
                      ${
                        index < currentStep
                          ? 'bg-primary-600 text-white'
                          : index === currentStep
                            ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                            : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      index === currentStep
                        ? 'text-primary-700 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 0 && (
            <FileUploadStep onFileSelected={handleFileSelected} />
          )}

          {currentStep === 1 && (
            <ColumnMappingStep
              headers={headers}
              sampleData={rows.slice(0, 3)}
              mappings={mappings}
              onMappingsChange={setMappings}
              config={config}
              onConfigChange={setConfig}
              stages={stages}
            />
          )}

          {currentStep === 2 && (
            <PreviewStep
              previewRows={previewRows}
              mappings={mappings}
              totalRows={rows.length}
            />
          )}

          {currentStep === 3 && importResult && (
            <ImportResultStep result={importResult} />
          )}

          {/* File error message for step 0 */}
          {currentStep === 0 && fileError && (
            <p className="text-center text-sm text-red-600 mt-2">
              {fileError}
            </p>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div>
            {currentStep > 0 && currentStep < 3 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isImporting}
              >
                <span className="flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </span>
              </Button>
            )}
          </div>
          <div>
            {currentStep === 3 ? (
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            ) : currentStep === 2 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canGoNext() || isImporting}
                isLoading={isImporting}
              >
                <span className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  Import {previewRows.filter((r) => r.errors.length === 0).length} Leads
                </span>
              </Button>
            ) : currentStep === 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                <span className="flex items-center gap-1">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

ImportModal.displayName = 'ImportModal';
export { ImportModal };

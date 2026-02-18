import React from 'react';
import { CheckCircle, ArrowRight, MinusCircle } from 'lucide-react';
import { Select } from '../shared/Select';
import { Input } from '../shared/Input';
import { ImportColumnMapping, ImportConfig } from '../../types/import';
import { Stage } from '../../types/stage';
import { getAvailableTargetFields } from '../../utils/importMapper';

interface ColumnMappingStepProps {
  headers: string[];
  sampleData: Record<string, string>[];
  mappings: ImportColumnMapping[];
  onMappingsChange: (mappings: ImportColumnMapping[]) => void;
  config: ImportConfig;
  onConfigChange: (config: ImportConfig) => void;
  stages: Stage[];
}

const targetFields = getAvailableTargetFields();

function getSampleValue(
  sampleData: Record<string, string>[],
  header: string
): string {
  for (const row of sampleData) {
    const val = row[header]?.trim();
    if (val) return val;
  }
  return '';
}

const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({
  headers,
  sampleData,
  mappings,
  onMappingsChange,
  config,
  onConfigChange,
  stages,
}) => {
  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    const updated = mappings.map((m) => {
      if (m.sourceColumn === sourceColumn) {
        return {
          ...m,
          targetField: targetField === '__skip__' ? null : targetField,
          confidence: targetField === '__skip__' ? 0 : 1.0,
        };
      }
      return m;
    });
    onMappingsChange(updated);
  };

  const stageOptions = stages.map((s) => ({
    value: s.id,
    label: `${s.emoji} ${s.name}`,
  }));

  const mappingOptions = [
    { value: '__skip__', label: '-- Skip this column --' },
    ...targetFields,
  ];

  return (
    <div className="space-y-6">
      {/* Column mapping table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Map your columns to lead fields
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-2 font-medium text-gray-600">
                  Source Column
                </th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">
                  Sample Data
                </th>
                <th className="px-2 py-2 w-8" aria-hidden="true" />
                <th className="text-left px-4 py-2 font-medium text-gray-600">
                  Target Field
                </th>
                <th className="px-2 py-2 w-8" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {headers.map((header) => {
                const mapping = mappings.find(
                  (m) => m.sourceColumn === header
                );
                const currentTarget = mapping?.targetField ?? '__skip__';
                const isAutoMapped =
                  mapping && mapping.targetField !== null && mapping.confidence >= 0.8;
                const sample = getSampleValue(sampleData, header);

                return (
                  <tr key={header} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {header}
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">
                      {sample || <span className="italic text-gray-400">empty</span>}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={currentTarget}
                        onChange={(e) =>
                          handleMappingChange(header, e.target.value)
                        }
                        options={mappingOptions}
                        className="text-sm"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      {isAutoMapped ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                      ) : currentTarget === '__skip__' ? (
                        <MinusCircle className="w-4 h-4 text-gray-300 mx-auto" />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import configuration */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Import Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default stage */}
          <div>
            <Select
              label="Default Stage"
              value={config.defaultStage}
              onChange={(e) =>
                onConfigChange({ ...config, defaultStage: e.target.value })
              }
              options={stageOptions}
            />
            <p className="mt-1 text-xs text-gray-500">
              Assigned to leads without a mapped stage value
            </p>
          </div>

          {/* Skip duplicate emails */}
          <div className="flex flex-col justify-center space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.skipDuplicateEmails}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    skipDuplicateEmails: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Skip duplicate emails
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.tagImportedLeads}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    tagImportedLeads: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Tag imported leads
              </span>
            </label>

            {config.tagImportedLeads && (
              <div className="pl-6">
                <Input
                  value={config.importTag}
                  onChange={(e) =>
                    onConfigChange({ ...config, importTag: e.target.value })
                  }
                  placeholder="imported"
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ColumnMappingStep.displayName = 'ColumnMappingStep';
export { ColumnMappingStep };

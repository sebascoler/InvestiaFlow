import React from 'react';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { ImportPreviewRow, ImportColumnMapping } from '../../types/import';

interface PreviewStepProps {
  previewRows: ImportPreviewRow[];
  mappings: ImportColumnMapping[];
  totalRows: number;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  previewRows,
  mappings,
  totalRows,
}) => {
  const activeMappings = mappings.filter((m) => m.targetField !== null);

  const readyCount = previewRows.filter(
    (r) => r.errors.length === 0
  ).length;
  const errorCount = previewRows.filter((r) => r.errors.length > 0).length;
  const warningCount = previewRows.filter(
    (r) => r.warnings.length > 0 && r.errors.length === 0
  ).length;

  // Scale counts to total rows based on preview ratio
  const previewCount = previewRows.length;
  const totalReady = totalRows > previewCount
    ? Math.round((readyCount / previewCount) * totalRows)
    : readyCount;
  const totalErrors = totalRows > previewCount
    ? Math.round((errorCount / previewCount) * totalRows)
    : errorCount;
  const totalWarnings = totalRows > previewCount
    ? Math.round((warningCount / previewCount) * totalRows)
    : warningCount;

  const displayRows = previewRows.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">
            {totalReady} row{totalReady !== 1 ? 's' : ''} ready to import
          </span>
        </div>
        {totalErrors > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              {totalErrors} with errors (will be skipped)
            </span>
          </div>
        )}
        {totalWarnings > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {totalWarnings} with warnings
            </span>
          </div>
        )}
      </div>

      {totalRows > 10 && (
        <p className="text-xs text-gray-500">
          Showing preview of first 10 rows out of {totalRows} total.
        </p>
      )}

      {/* Preview table */}
      <div className="border rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                Row
              </th>
              {activeMappings.map((m) => (
                <th
                  key={m.targetField}
                  className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap"
                >
                  {m.targetField}
                </th>
              ))}
              <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              const hasErrors = row.errors.length > 0;
              const hasWarnings = row.warnings.length > 0;

              let rowBg = '';
              if (hasErrors) rowBg = 'bg-red-50';
              else if (hasWarnings) rowBg = 'bg-yellow-50';

              return (
                <React.Fragment key={row.rowNumber}>
                  <tr className={`border-b last:border-b-0 ${rowBg}`}>
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs">
                      {row.rowNumber}
                    </td>
                    {activeMappings.map((m) => (
                      <td
                        key={m.targetField}
                        className="px-3 py-2 text-gray-900 truncate max-w-[180px]"
                        title={row.data[m.sourceColumn] || ''}
                      >
                        {row.data[m.sourceColumn] || (
                          <span className="text-gray-400 italic">empty</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {hasErrors ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          Error
                        </span>
                      ) : hasWarnings ? (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                  {/* Inline error/warning messages */}
                  {(hasErrors || hasWarnings) && (
                    <tr className={rowBg}>
                      <td />
                      <td
                        colSpan={activeMappings.length + 1}
                        className="px-3 pb-2 pt-0"
                      >
                        {row.errors.map((err, i) => (
                          <p
                            key={`err-${i}`}
                            className="text-xs text-red-600 flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3 flex-shrink-0" />
                            {err}
                          </p>
                        ))}
                        {row.warnings.map((warn, i) => (
                          <p
                            key={`warn-${i}`}
                            className="text-xs text-yellow-600 flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            {warn}
                          </p>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PreviewStep.displayName = 'PreviewStep';
export { PreviewStep };

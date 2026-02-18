import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { ImportResult } from '../../types/import';

interface ImportResultStepProps {
  result: ImportResult;
}

const ImportResultStep: React.FC<ImportResultStepProps> = ({ result }) => {
  const [showErrors, setShowErrors] = useState(false);

  const hasCreated = result.created > 0;
  const hasErrors = result.errors.length > 0;

  return (
    <div className="flex flex-col items-center py-6">
      {/* Main icon */}
      {hasCreated ? (
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasCreated ? 'Import Complete' : 'No Leads Imported'}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Processed {result.totalRows} row{result.totalRows !== 1 ? 's' : ''} from your file
      </p>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {result.created}
          </div>
          <div className="text-xs text-gray-500 mt-1">Created</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">
            {result.skipped}
          </div>
          <div className="text-xs text-gray-500 mt-1">Skipped</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">
            {result.errors.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Errors</div>
        </div>
      </div>

      {/* Error list */}
      {hasErrors && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="w-full flex items-center justify-between px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {result.errors.length} error{result.errors.length !== 1 ? 's' : ''} during import
            </span>
            {showErrors ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showErrors && (
            <div className="mt-2 border border-red-200 rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-red-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-red-700">
                      Row
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-red-700">
                      Field
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-red-700">
                      Message
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-red-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err, index) => (
                    <tr
                      key={index}
                      className="border-t border-red-100 hover:bg-red-50"
                    >
                      <td className="px-3 py-1.5 text-gray-700 font-mono">
                        {err.row}
                      </td>
                      <td className="px-3 py-1.5 text-gray-700">
                        {err.field}
                      </td>
                      <td className="px-3 py-1.5 text-red-700">
                        {err.message}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500 truncate max-w-[120px]">
                        {err.value || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ImportResultStep.displayName = 'ImportResultStep';
export { ImportResultStep };

import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const ACCEPTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const MAX_FILE_SIZE_MB = 10;

interface FileUploadStepProps {
  onFileSelected: (file: File) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidFileType(file: File): boolean {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (ACCEPTED_EXTENSIONS.includes(extension)) return true;
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  return false;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!isValidFileType(file)) {
        setError('Invalid file type. Please upload a .csv, .xlsx, or .xls file.');
        setSelectedFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          w-full max-w-lg border-2 border-dashed rounded-xl p-12
          flex flex-col items-center justify-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload file area. Click or drag and drop a CSV or Excel file."
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {selectedFile ? (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <File className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
            <p className="text-xs text-green-600 mt-2">File ready. Click to choose a different file.</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: .csv, .xlsx, .xls (max {MAX_FILE_SIZE_MB} MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

FileUploadStep.displayName = 'FileUploadStep';
export { FileUploadStep };

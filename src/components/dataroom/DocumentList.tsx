import React, { useState, useMemo } from 'react';
import { Search, Upload, Filter } from 'lucide-react';
import { Document, DocumentCategory } from '../../types/document';
import { DocumentCard } from './DocumentCard';
import { Button } from '../shared/Button';
import { PermissionGate } from '../shared/PermissionGate';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import { Loader } from '../shared/Loader';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onUpload: () => void;
  onConfigurePermissions: (document: Document) => void;
  onDelete: (documentId: string) => Promise<void>;
}

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'pitch', label: 'Pitch' },
  { value: 'financials', label: 'Financials' },
  { value: 'legal', label: 'Legal' },
  { value: 'metrics', label: 'Metrics' },
  { value: 'other', label: 'Other' },
];

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onUpload,
  onConfigurePermissions,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | 'all')}
            options={categoryOptions}
          />
        </div>
        <PermissionGate action="create" resource="documents">
          <Button variant="primary" onClick={onUpload}>
            <Upload size={18} className="mr-2" />
            Upload Document
          </Button>
        </PermissionGate>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">
            {documents.length === 0 ? 'No documents yet' : 'No documents match your filters'}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {documents.length === 0
              ? 'Upload your first document to get started'
              : 'Try adjusting your search or filter'}
          </p>
          {documents.length === 0 && (
            <PermissionGate action="create" resource="documents">
              <Button variant="primary" onClick={onUpload}>
                <Upload size={18} className="mr-2" />
                Upload Document
              </Button>
            </PermissionGate>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onConfigurePermissions={() => onConfigurePermissions(document)}
              onDelete={() => onDelete(document.id)}
            />
          ))}
        </div>
      )}

      {filteredDocuments.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      )}
    </div>
  );
};

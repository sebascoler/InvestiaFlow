import React, { useEffect, useState } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { SharedDocument } from '../../types/document';
import { Document } from '../../types/document';
import { Lead } from '../../types/lead';
import { formatDate } from '../../utils/formatters';
import { useDocuments } from '../../contexts/DocumentsContext';
import { Loader } from '../shared/Loader';

interface SharedDocumentsListProps {
  lead: Lead;
}

export const SharedDocumentsList: React.FC<SharedDocumentsListProps> = ({ lead }) => {
  const { getSharedDocuments, documents, markDocumentAsViewed, markDocumentAsDownloaded } = useDocuments();
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedDocuments();
  }, [lead.id]);

  const loadSharedDocuments = async () => {
    try {
      setLoading(true);
      const shared = await getSharedDocuments(lead.id);
      setSharedDocs(shared);
    } catch (error) {
      console.error('Error loading shared documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentName = (documentId: string): string => {
    const doc = documents.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  const handleView = async (shared: SharedDocument) => {
    await markDocumentAsViewed(lead.id, shared.documentId);
    await loadSharedDocuments();
  };

  const handleDownload = async (shared: SharedDocument) => {
    await markDocumentAsDownloaded(lead.id, shared.documentId);
    await loadSharedDocuments();
    // TODO: En Fase 2, aquí se descargaría el archivo real desde Firebase Storage
    console.log('Downloading:', getDocumentName(shared.documentId));
  };

  if (loading) {
    return <Loader size="sm" className="py-4" />;
  }

  if (sharedDocs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        <FileText className="mx-auto mb-2 text-gray-400" size={24} />
        <p>No hay documentos compartidos con este lead</p>
        <p className="text-xs text-gray-400 mt-1">
          Los documentos se compartirán automáticamente cuando el lead alcance stages configurados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-3">Documentos Compartidos ({sharedDocs.length})</h3>
      {sharedDocs.map((shared) => {
        const docName = getDocumentName(shared.documentId);
        return (
          <div
            key={shared.id}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <FileText className="text-primary-600 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{docName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Compartido {formatDate(shared.sharedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs">
                <Eye
                  className={shared.viewedAt ? 'text-green-600' : 'text-gray-400'}
                  size={14}
                />
                <span className={shared.viewedAt ? 'text-green-700' : 'text-gray-500'}>
                  {shared.viewedAt ? `Visto ${formatDate(shared.viewedAt)}` : 'No visto'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Download
                  className={shared.downloadedAt ? 'text-blue-600' : 'text-gray-400'}
                  size={14}
                />
                <span className={shared.downloadedAt ? 'text-blue-700' : 'text-gray-500'}>
                  {shared.downloadedAt ? `Descargado ${formatDate(shared.downloadedAt)}` : 'No descargado'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              {!shared.viewedAt && (
                <button
                  onClick={() => handleView(shared)}
                  className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                >
                  Marcar como visto
                </button>
              )}
              <button
                onClick={() => handleDownload(shared)}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                {shared.downloadedAt ? 'Marcar como descargado de nuevo' : 'Marcar como descargado'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

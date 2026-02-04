import React, { useEffect, useState } from 'react';
import { Eye, Download, User } from 'lucide-react';
import { SharedDocument } from '../../types/document';
import { formatDate } from '../../utils/formatters';
import { useDocuments } from '../../contexts/DocumentsContext';
import { useLeads } from '../../contexts/LeadsContext';
import { Loader } from '../shared/Loader';

interface DocumentTrackingProps {
  documentId: string;
}

export const DocumentTracking: React.FC<DocumentTrackingProps> = ({ documentId }) => {
  const { getDocumentShares } = useDocuments();
  const { leads } = useLeads();
  const [shares, setShares] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShares();
  }, [documentId]);

  const loadShares = async () => {
    try {
      setLoading(true);
      const documentShares = await getDocumentShares(documentId);
      setShares(documentShares);
    } catch (error) {
      console.error('Error loading document shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeadName = (leadId: string): string => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.name || 'Unknown Lead';
  };

  if (loading) {
    return <Loader size="sm" className="py-4" />;
  }

  if (shares.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        <Eye className="mx-auto mb-2 text-gray-400" size={24} />
        <p>Este documento aún no ha sido compartido con ningún lead</p>
        <p className="text-xs text-gray-400 mt-1">
          Se compartirá automáticamente cuando los leads alcancen los stages configurados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Compartido con {shares.length} lead(s)</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="text-green-600" size={14} />
            <span>{shares.filter(s => s.viewedAt).length} visto(s)</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="text-blue-600" size={14} />
            <span>{shares.filter(s => s.downloadedAt).length} descargado(s)</span>
          </div>
        </div>
      </div>
      {shares.map((share) => {
        const leadName = getLeadName(share.leadId);
        return (
          <div
            key={share.id}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <User className="text-primary-600 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{leadName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Compartido {formatDate(share.sharedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs">
                <Eye
                  className={share.viewedAt ? 'text-green-600' : 'text-gray-400'}
                  size={14}
                />
                <span className={share.viewedAt ? 'text-green-700 font-medium' : 'text-gray-500'}>
                  {share.viewedAt ? `Visto ${formatDate(share.viewedAt)}` : 'No visto'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Download
                  className={share.downloadedAt ? 'text-blue-600' : 'text-gray-400'}
                  size={14}
                />
                <span className={share.downloadedAt ? 'text-blue-700 font-medium' : 'text-gray-500'}>
                  {share.downloadedAt ? `Descargado ${formatDate(share.downloadedAt)}` : 'No descargado'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loader } from './Loader';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType: string;
  onViewed?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
  onViewed,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'text' | 'unsupported'>('unsupported');

  useEffect(() => {
    if (isOpen && documentUrl) {
      setLoading(true);
      setError(null);
      
      // Determine preview type based on file type
      const lowerType = documentType.toLowerCase();
      if (lowerType.includes('pdf')) {
        setPreviewType('pdf');
      } else if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg') || lowerType.includes('jpeg') || lowerType.includes('gif') || lowerType.includes('webp')) {
        setPreviewType('image');
      } else if (lowerType.includes('text') || lowerType.includes('plain')) {
        setPreviewType('text');
      } else {
        setPreviewType('unsupported');
      }

      // Call onViewed callback when preview opens
      if (onViewed) {
        onViewed();
      }
    }
  }, [isOpen, documentUrl, documentType, onViewed]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (err: any) => {
    console.error('Error loading preview:', err);
    setError('No se pudo cargar la vista previa del documento');
    setLoading(false);
  };

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <AlertCircle size={48} className="mb-4 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Intenta descargar el archivo para verlo</p>
        </div>
      );
    }

    switch (previewType) {
      case 'pdf':
        return (
          <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <Loader size="lg" />
              </div>
            )}
            <iframe
              src={documentUrl}
              className="w-full h-full"
              title={documentName}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center min-h-[400px] max-h-[600px] overflow-auto relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <Loader size="lg" />
              </div>
            )}
            <img
              src={documentUrl}
              alt={documentName}
              className="max-w-full max-h-full object-contain"
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      case 'text':
        return (
          <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-auto bg-white p-4">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader size="lg" />
              </div>
            )}
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {loading ? 'Cargando...' : 'Contenido de texto no disponible en vista previa'}
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <FileText size={48} className="mb-4 text-gray-400" />
            <p className="text-lg font-medium">Vista previa no disponible</p>
            <p className="text-sm mt-2">Este tipo de archivo no se puede previsualizar</p>
            <p className="text-xs mt-1 text-gray-400">Tipos soportados: PDF, imágenes (PNG, JPG, GIF, WebP)</p>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={documentName}
      size="xl"
    >
      <div className="relative">
        {renderPreview()}
        
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            <X size={16} className="mr-2" />
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.open(documentUrl, '_blank');
            }}
          >
            Abrir en nueva pestaña
          </Button>
        </div>
      </div>
    </Modal>
  );
};

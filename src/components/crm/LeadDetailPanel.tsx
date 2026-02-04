import React from 'react';
import { X, Mail, Building, Calendar, FileText, Linkedin, Phone, Trash2, Edit, Tag } from 'lucide-react';
import { Lead } from '../../types/lead';
import { formatDate } from '../../utils/formatters';
import { Button } from '../shared/Button';
import { SharedDocumentsList } from './SharedDocumentsList';
import { LeadHistory } from './LeadHistory';

interface LeadDetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({
  lead,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!lead) return null;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      await onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close panel"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{lead.name}</h3>
          <p className="text-lg text-gray-600">{lead.firm}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a
                href={`mailto:${lead.email}`}
                className="text-gray-900 hover:text-primary-600"
              >
                {lead.email}
              </a>
            </div>
          </div>

          {lead.phoneNumber && (
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="text-gray-900 hover:text-primary-600"
                >
                  {lead.phoneNumber}
                </a>
              </div>
            </div>
          )}

          {lead.linkedinUrl && (
            <div className="flex items-start gap-3">
              <Linkedin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">LinkedIn</p>
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Profile
                </a>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Building className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Stage</p>
              <p className="text-gray-900 font-medium">{lead.stage}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Last Contact</p>
              <p className="text-gray-900">
                {formatDate(lead.lastContactDate)}
              </p>
            </div>
          </div>

          {lead.stageEnteredAt && (
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">En este stage desde</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(lead.stageEnteredAt)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-gray-900">
                {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          {lead.tags && lead.tags.length > 0 && (
            <div className="flex items-start gap-3">
              <Tag className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {lead.notes && (
            <div className="flex items-start gap-3">
              <FileText className="text-gray-400 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <SharedDocumentsList lead={lead} />
        </div>

        <div className="pt-6 border-t border-gray-200">
          <LeadHistory leadId={lead.id} />
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 space-y-3">
        <Button
          variant="primary"
          className="w-full"
          onClick={onEdit}
        >
          <Edit size={18} className="mr-2" />
          Edit Lead
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 size={18} className="mr-2" />
          Delete Lead
        </Button>
      </div>
    </div>
  );
};

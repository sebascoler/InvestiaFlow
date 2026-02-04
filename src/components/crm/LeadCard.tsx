import React, { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Mail, Calendar, FileText } from 'lucide-react';
import { Lead } from '../../types/lead';
import { formatDate } from '../../utils/formatters';
import { FOLLOW_UP_DAYS } from '../../utils/constants';

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = memo(({ lead, index, onClick }) => {
  const daysSinceContact = lead.lastContactDate
    ? Math.floor((new Date().getTime() - lead.lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const needsFollowUp = daysSinceContact !== null && daysSinceContact > FOLLOW_UP_DAYS;

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`
            bg-white rounded-lg border-2 p-4 cursor-pointer
            transition-all duration-200
            ${snapshot.isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'}
            ${needsFollowUp ? 'border-orange-400' : 'border-gray-200'}
            hover:shadow-lg hover:scale-105
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>👤</span>
                {lead.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{lead.firm}</p>
            </div>
            {needsFollowUp && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full whitespace-nowrap">
                ⚠️ Follow up needed
              </span>
            )}
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={14} />
              <span className="truncate">{lead.email}</span>
            </div>
            
        {lead.lastContactDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>Last: {formatDate(lead.lastContactDate)}</span>
          </div>
        )}

        {lead.stageEnteredAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <span>En este stage desde: {formatDate(lead.stageEnteredAt)}</span>
          </div>
        )}

            {lead.tags && lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {lead.notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                <FileText size={14} className="mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.stage === nextProps.lead.stage &&
    prevProps.lead.lastContactDate?.getTime() === nextProps.lead.lastContactDate?.getTime() &&
    JSON.stringify(prevProps.lead.tags) === JSON.stringify(nextProps.lead.tags) &&
    prevProps.index === nextProps.index
  );
});

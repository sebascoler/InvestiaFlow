import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Stage } from '../../types/stage';
import { Lead } from '../../types/lead';
import { LeadCard } from './LeadCard';

interface StageColumnProps {
  stage: Stage;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onAddLead: () => void;
}

const colorMap: Record<string, { bg: string; border: string }> = {
  slate: { bg: 'bg-slate-50', border: 'border-slate-300' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300' },
  green: { bg: 'bg-green-50', border: 'border-green-300' },
  red: { bg: 'bg-red-50', border: 'border-red-300' },
};

export const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  leads,
  onLeadClick,
  onAddLead,
}) => {
  const colors = colorMap[stage.color] || colorMap.slate;

  return (
    <div className={`flex-shrink-0 w-80 ${colors.bg} rounded-lg border-2 ${colors.border} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{stage.emoji}</span>
          <h2 className="font-semibold text-gray-900">{stage.name}</h2>
          <span className="text-sm text-gray-600 bg-white px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[200px] space-y-3 transition-colors
              ${snapshot.isDraggingOver ? 'bg-opacity-80' : ''}
            `}
          >
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onClick={() => onLeadClick(lead)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button
        onClick={onAddLead}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-white hover:border-gray-400 transition-colors"
      >
        <Plus size={18} />
        <span>Add Lead</span>
      </button>
    </div>
  );
};

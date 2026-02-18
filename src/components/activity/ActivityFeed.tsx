import React from 'react';
import { Activity } from 'lucide-react';
import { useInvestorActivity } from '../../hooks/useInvestorActivity';
import { ActivityItem } from './ActivityItem';
import { Loader } from '../shared/Loader';

interface ActivityFeedProps {
  maxItems?: number;
  leadId?: string;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  maxItems = 10,
  leadId,
  compact = false,
}) => {
  const { activities, loading } = useInvestorActivity(leadId);

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <Activity size={20} className="text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {leadId ? 'Recent Activity' : 'Investor Activity'}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="py-8">
            <Loader size="md" />
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Activity className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm">No investor activity yet</p>
          </div>
        ) : (
          <div>
            {displayedActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ActivityFeed.displayName = 'ActivityFeed';

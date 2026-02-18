import React from 'react';
import { InvestorActivity, ACTIVITY_CONFIG } from '../../types/investorActivity';

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface ActivityItemProps {
  activity: InvestorActivity;
  compact?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, compact = false }) => {
  const config = ACTIVITY_CONFIG[activity.type];

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      {/* Activity emoji */}
      <span className="text-lg mt-0.5 shrink-0" role="img" aria-label={config.label}>
        {config.emoji}
      </span>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{activity.leadName}</span>{' '}
          <span className={config.color}>{config.label.toLowerCase()}</span>
        </p>

        {activity.documentName && (
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {activity.documentName}
          </span>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{timeAgo(activity.createdAt)}</span>
        </div>

        {!compact && activity.leadEmail && (
          <p className="text-xs text-gray-400 mt-0.5">{activity.leadEmail}</p>
        )}
      </div>
    </div>
  );
};

ActivityItem.displayName = 'ActivityItem';

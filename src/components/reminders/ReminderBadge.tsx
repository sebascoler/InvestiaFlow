import React from 'react';

interface ReminderBadgeProps {
  count: number;
  urgentCount?: number;
}

export const ReminderBadge: React.FC<ReminderBadgeProps> = ({ count, urgentCount = 0 }) => {
  if (count === 0) return null;

  const isUrgent = urgentCount > 0;
  const bgColor = isUrgent ? 'bg-red-500' : 'bg-orange-500';

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        rounded-full text-xs font-bold text-white
        ${bgColor}
        ${isUrgent ? 'animate-pulse' : ''}
      `}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

ReminderBadge.displayName = 'ReminderBadge';

import React from 'react';
import { QAMessage } from '../../types/qa';

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

interface QAMessageBubbleProps {
  message: QAMessage;
}

export const QAMessageBubble: React.FC<QAMessageBubbleProps> = ({ message }) => {
  const isFounder = message.senderType === 'founder';
  const isUnread = !message.readAt && message.senderType === 'investor';

  return (
    <div className={`flex ${isFounder ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          relative max-w-[75%] rounded-lg px-4 py-3
          ${isFounder
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        {/* Unread indicator */}
        {isUnread && (
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
        )}

        {/* Sender name */}
        <p
          className={`text-xs font-medium mb-1 ${
            isFounder ? 'text-primary-200' : 'text-gray-500'
          }`}
        >
          {message.senderName}
        </p>

        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isFounder ? 'text-primary-200' : 'text-gray-400'
          }`}
        >
          {timeAgo(message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt))}
        </p>
      </div>
    </div>
  );
};

QAMessageBubble.displayName = 'QAMessageBubble';

import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, FileText, Clock, MessageSquare } from 'lucide-react';
import { QAThread, QAThreadStatus } from '../../types/qa';
import { qaService } from '../../services/qaService';
import { useTeam } from '../../contexts/TeamContext';
import { Loader } from '../shared/Loader';
import { QAThreadComponent } from './QAThread';

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

const statusConfig: Record<QAThreadStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-100 text-green-800' },
  answered: { label: 'Answered', className: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600' },
};

interface QAThreadListProps {
  leadId?: string;
  compact?: boolean;
}

export const QAThreadList: React.FC<QAThreadListProps> = ({ leadId, compact = false }) => {
  const { currentTeam } = useTeam();
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<QAThread | null>(null);

  const loadThreads = async () => {
    try {
      setLoading(true);
      let data: QAThread[];

      if (leadId) {
        data = await qaService.getThreadsForLead(leadId);
      } else if (currentTeam) {
        data = await qaService.getThreads(currentTeam.id);
      } else {
        data = [];
      }

      setThreads(data);
    } catch (error) {
      console.error('Error loading Q&A threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [leadId, currentTeam?.id]);

  const openCount = threads.filter((t) => t.status === 'open').length;

  const handleThreadSelect = (thread: QAThread) => {
    setSelectedThread(thread);
  };

  const handleBack = () => {
    setSelectedThread(null);
  };

  const handleStatusChange = () => {
    loadThreads();
  };

  // Show full thread view when a thread is selected
  if (selectedThread) {
    return (
      <div className={compact ? 'h-[500px]' : 'h-[600px]'}>
        <QAThreadComponent
          thread={selectedThread}
          onBack={handleBack}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={compact ? 18 : 20} className="text-primary-600" />
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
            Q&A Threads
          </h3>
          {openCount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {openCount} open
            </span>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size="md" />
        </div>
      ) : threads.length === 0 ? (
        /* Empty state */
        <div className="text-center py-8">
          <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No questions yet</p>
        </div>
      ) : (
        /* Thread list */
        <div className="space-y-1">
          {threads.map((thread) => {
            const status = statusConfig[thread.status];
            const updatedAt = thread.updatedAt instanceof Date
              ? thread.updatedAt
              : new Date(thread.updatedAt);

            return (
              <button
                key={thread.id}
                onClick={() => handleThreadSelect(thread)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.className}`}>
                        {status.label}
                      </span>
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {thread.subject}
                      </h4>
                    </div>

                    {!compact && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span>{thread.leadName}</span>
                        {thread.documentName && (
                          <>
                            <span className="text-gray-300">&middot;</span>
                            <span className="flex items-center gap-1">
                              <FileText size={12} />
                              {thread.documentName}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {thread.messageCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(updatedAt)}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-gray-500 transition-colors mt-1 shrink-0"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

QAThreadList.displayName = 'QAThreadList';

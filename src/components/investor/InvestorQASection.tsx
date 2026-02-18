import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ChevronRight, ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { QAThread, QAMessage, QAThreadStatus } from '../../types/qa';
import { qaService } from '../../services/qaService';
import { investorAuthService } from '../../services/investorAuthService';
import { Button } from '../shared/Button';
import { Loader } from '../shared/Loader';

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

export const InvestorQASection: React.FC = () => {
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<QAThread | null>(null);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const session = investorAuthService.getInvestorSession();

  const loadThreads = async () => {
    if (!session?.leadId) return;

    try {
      setLoading(true);
      const data = await qaService.getThreadsForLead(session.leadId);
      setThreads(data);
    } catch (error) {
      console.error('Error loading Q&A threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      setMessagesLoading(true);
      const data = await qaService.getMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [session?.leadId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleThreadSelect = (thread: QAThread) => {
    setSelectedThread(thread);
    loadMessages(thread.id);
  };

  const handleBack = () => {
    setSelectedThread(null);
    setMessages([]);
    setReplyContent('');
  };

  const handleSend = async () => {
    if (!replyContent.trim() || !selectedThread || !session) return;

    try {
      setSending(true);
      await qaService.sendMessage(
        selectedThread.id,
        replyContent.trim(),
        'investor',
        session.email,
        session.leadId
      );
      setReplyContent('');
      await loadMessages(selectedThread.id);
      await loadThreads();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Thread detail view
  if (selectedThread) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Thread header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Back to threads"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{selectedThread.subject}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[selectedThread.status].className}`}>
                {statusConfig[selectedThread.status].label}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size="md" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No messages yet</p>
          ) : (
            <>
              {messages.map((message) => {
                const isInvestor = message.senderType === 'investor';
                const createdAt = message.createdAt instanceof Date
                  ? message.createdAt
                  : new Date(message.createdAt);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isInvestor ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`
                        max-w-[75%] rounded-lg px-4 py-3
                        ${isInvestor
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      <p className={`text-xs font-medium mb-1 ${isInvestor ? 'text-primary-200' : 'text-gray-500'}`}>
                        {message.senderName}
                      </p>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`text-xs mt-2 ${isInvestor ? 'text-primary-200' : 'text-gray-400'}`}>
                        {timeAgo(createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Reply form */}
        {selectedThread.status !== 'closed' && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                disabled={sending}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!replyContent.trim() || sending}
                isLoading={sending}
                className="self-end flex items-center gap-1"
              >
                <Send size={14} />
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Thread list view
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Questions &amp; Answers</h3>
        </div>
        <Button variant="primary" size="sm" disabled>
          Ask a Question
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="md" />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-1">No questions yet</p>
            <p className="text-gray-400 text-xs">
              Use the button above to ask the founders a question.
            </p>
          </div>
        ) : (
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
    </div>
  );
};

InvestorQASection.displayName = 'InvestorQASection';

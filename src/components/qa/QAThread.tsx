import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';
import { QAThread as QAThreadType, QAMessage, QAThreadStatus } from '../../types/qa';
import { qaService } from '../../services/qaService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../shared/Button';
import { Loader } from '../shared/Loader';
import { QAMessageBubble } from './QAMessageBubble';

interface QAThreadProps {
  thread: QAThreadType;
  onBack: () => void;
  onStatusChange?: () => void;
}

const statusConfig: Record<QAThreadStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-100 text-green-800' },
  answered: { label: 'Answered', className: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600' },
};

export const QAThreadComponent: React.FC<QAThreadProps> = ({ thread, onBack, onStatusChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await qaService.getMessages(thread.id);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [thread.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!replyContent.trim() || !user) return;

    try {
      setSending(true);
      await qaService.sendMessage(
        thread.id,
        replyContent.trim(),
        'founder',
        user.name,
        user.id
      );
      setReplyContent('');
      await loadMessages();
      onStatusChange?.();
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

  const handleStatusChange = async (newStatus: QAThreadStatus) => {
    try {
      setUpdatingStatus(true);
      await qaService.updateThreadStatus(thread.id, newStatus);
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating thread status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const currentStatus = statusConfig[thread.status];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Back to threads"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{thread.subject}</h3>
            <p className="text-sm text-gray-500 truncate">
              {thread.leadName}
              {thread.documentName && (
                <span className="text-gray-400"> &middot; {thread.documentName}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${currentStatus.className}`}>
            {currentStatus.label}
          </span>

          {thread.status === 'open' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleStatusChange('answered')}
              disabled={updatingStatus}
              className="flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Mark Answered
            </Button>
          )}

          {thread.status !== 'closed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('closed')}
              disabled={updatingStatus}
              className="flex items-center gap-1"
            >
              <XCircle size={14} />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="md" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No messages yet</p>
        ) : (
          <>
            {messages.map((message) => (
              <QAMessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply form */}
      {thread.status !== 'closed' && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
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
};

QAThreadComponent.displayName = 'QAThreadComponent';

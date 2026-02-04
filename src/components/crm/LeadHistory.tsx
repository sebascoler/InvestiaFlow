import React, { useEffect, useState } from 'react';
import { Clock, User, ArrowRight, Tag, FileText, Plus } from 'lucide-react';
import { LeadActivity, Comment } from '../../types/leadHistory';
import { leadHistoryService } from '../../services/leadHistoryService';
import { formatDate } from '../../utils/formatters';
import { Loader } from '../shared/Loader';
import { Button } from '../shared/Button';
import { useAuth } from '../../contexts/AuthContext';

interface LeadHistoryProps {
  leadId: string;
}

export const LeadHistory: React.FC<LeadHistoryProps> = ({ leadId }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [leadId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [activitiesData, commentsData] = await Promise.all([
        leadHistoryService.getActivities(leadId),
        leadHistoryService.getComments(leadId),
      ]);
      setActivities(activitiesData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      await leadHistoryService.addComment(leadId, user.id, user.name, newComment.trim());
      setNewComment('');
      setShowCommentForm(false);
      await loadHistory();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getActivityIcon = (type: LeadActivity['type']) => {
    switch (type) {
      case 'created':
        return <Plus className="text-green-600" size={16} />;
      case 'stage_changed':
        return <ArrowRight className="text-blue-600" size={16} />;
      case 'tag_added':
      case 'tag_removed':
        return <Tag className="text-purple-600" size={16} />;
      case 'document_shared':
        return <FileText className="text-orange-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  if (loading) {
    return <Loader size="sm" className="py-4" />;
  }

  // Combinar actividades y comentarios ordenados por fecha
  const allItems = [
    ...activities.map(a => ({ type: 'activity' as const, data: a, date: a.createdAt })),
    ...comments.map(c => ({ type: 'comment' as const, data: c, date: c.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historial y Comentarios</h3>
        {!showCommentForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCommentForm(true)}
          >
            <Plus size={14} className="mr-1" />
            Comentar
          </Button>
        )}
      </div>

      {/* Formulario de comentario */}
      {showCommentForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddComment}
              isLoading={submitting}
              disabled={!newComment.trim()}
            >
              Enviar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {allItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Clock className="mx-auto mb-2 text-gray-400" size={32} />
          <p>No hay historial aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allItems.map((item) => {
            if (item.type === 'activity') {
              const activity = item.data as LeadActivity;
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            } else {
              const comment = item.data as Comment;
              return (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="text-primary-600" size={16} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

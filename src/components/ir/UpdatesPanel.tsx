import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Send, FileText, Copy, Download, Trash2, Clock, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { InvestorUpdate } from '../../types/update';
import { updateService } from '../../services/updateService';
import { leadService } from '../../services/leadService';
import { useTeam } from '../../contexts/TeamContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLeads } from '../../contexts/LeadsContext';
import { Button } from '../shared/Button';
import { Loader } from '../shared/Loader';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../utils/formatters';

// ── Update Editor ──────────────────────────────────────────────

interface UpdateEditorProps {
  update: InvestorUpdate;
  onSave: (data: Partial<InvestorUpdate>) => Promise<void>;
  onMarkAsSent: () => Promise<void>;
  onClose: () => void;
  onExportClipboard: () => void;
  onExportMarkdown: () => void;
  isSaving: boolean;
}

const SECTIONS = [
  { key: 'highlights', label: 'Highlights', placeholder: 'Key wins, milestones hit, exciting news...' },
  { key: 'metrics', label: 'Metrics', placeholder: 'Revenue, users, growth rate, runway...' },
  { key: 'progress', label: 'Progress', placeholder: 'What you shipped, partnerships, hires...' },
  { key: 'asks', label: 'Asks', placeholder: 'Intros needed, hiring roles, advice on...' },
  { key: 'focus', label: 'Focus Next Period', placeholder: 'Top priorities for the coming weeks/months...' },
] as const;

const UpdateEditor: React.FC<UpdateEditorProps> = ({
  update,
  onSave,
  onMarkAsSent,
  onClose,
  onExportClipboard,
  onExportMarkdown,
  isSaving,
}) => {
  const [title, setTitle] = useState(update.title);
  const [sections, setSections] = useState({
    highlights: update.highlights,
    metrics: update.metrics,
    progress: update.progress,
    asks: update.asks,
    focus: update.focus,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleSectionChange = (key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave({ title, ...sections });
    setHasChanges(false);
  };

  const handleMarkAsSent = async () => {
    if (hasChanges) {
      await onSave({ title, ...sections });
    }
    await onMarkAsSent();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to all updates
        </button>
        <div className="flex items-center gap-2">
          {update.status === 'draft' && (
            <>
              <Button
                variant="secondary"
                onClick={onExportClipboard}
                className="text-sm"
              >
                <Copy size={14} className="mr-1.5" />
                Copy
              </Button>
              <Button
                variant="secondary"
                onClick={onExportMarkdown}
                className="text-sm"
              >
                <Download size={14} className="mr-1.5" />
                .md
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasChanges}
                className="text-sm"
              >
                <Save size={14} className="mr-1.5" />
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={handleMarkAsSent}
                className="text-sm"
              >
                <Send size={14} className="mr-1.5" />
                Mark as Sent
              </Button>
            </>
          )}
          {update.status === 'marked_sent' && (
            <>
              <Button variant="secondary" onClick={onExportClipboard} className="text-sm">
                <Copy size={14} className="mr-1.5" />
                Copy
              </Button>
              <Button variant="secondary" onClick={onExportMarkdown} className="text-sm">
                <Download size={14} className="mr-1.5" />
                .md
              </Button>
              <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                <Send size={14} className="mr-1.5" />
                Sent {update.sentAt ? formatDate(update.sentAt) : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
          disabled={update.status === 'marked_sent'}
          className="w-full text-2xl font-bold text-gray-900 border-0 border-b-2 border-transparent focus:border-primary-500 focus:outline-none bg-transparent px-0 py-2 disabled:text-gray-900 disabled:opacity-100"
          placeholder="Update title..."
        />
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {SECTIONS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {label}
            </label>
            <textarea
              value={sections[key as keyof typeof sections]}
              onChange={(e) => handleSectionChange(key, e.target.value)}
              disabled={update.status === 'marked_sent'}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y disabled:bg-gray-50 disabled:text-gray-700"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main UpdatesPanel ──────────────────────────────────────────

export const UpdatesPanel: React.FC = () => {
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const { leads, updateLead } = useLeads();
  const [updates, setUpdates] = useState<InvestorUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUpdate, setActiveUpdate] = useState<InvestorUpdate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const teamId = currentTeam?.id;

  const loadUpdates = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const data = await updateService.getUpdates(teamId);
      setUpdates(data);
    } catch (error) {
      console.error('[UpdatesPanel] Failed to load updates:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handleCreateDraft = async () => {
    if (!teamId) return;
    setIsSaving(true);
    try {
      const newUpdate = await updateService.createUpdate(teamId);
      setUpdates(prev => [newUpdate, ...prev]);
      setActiveUpdate(newUpdate);
    } catch (error) {
      console.error('[UpdatesPanel] Failed to create draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUpdate = async (data: Partial<InvestorUpdate>) => {
    if (!activeUpdate) return;
    setIsSaving(true);
    try {
      const saved = await updateService.saveUpdate(activeUpdate.id, data);
      setActiveUpdate(saved);
      setUpdates(prev => prev.map(u => u.id === saved.id ? saved : u));
    } catch (error) {
      console.error('[UpdatesPanel] Failed to save update:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsSent = async () => {
    if (!activeUpdate) return;
    setIsSaving(true);
    try {
      const sent = await updateService.markAsSent(activeUpdate.id);

      // Update lastUpdateSentAt on all active committed investors
      const committedLeads = leads.filter(
        l => l.stage === 'committed' && (l.irStatus || 'active') === 'active'
      );
      const now = new Date();
      await Promise.all(
        committedLeads.map(l => updateLead(l.id, { lastUpdateSentAt: now }))
      );

      setActiveUpdate(sent);
      setUpdates(prev => prev.map(u => u.id === sent.id ? sent : u));
    } catch (error) {
      console.error('[UpdatesPanel] Failed to mark as sent:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this draft? This cannot be undone.')) return;
    try {
      await updateService.deleteUpdate(id);
      setUpdates(prev => prev.filter(u => u.id !== id));
      if (activeUpdate?.id === id) setActiveUpdate(null);
    } catch (error) {
      console.error('[UpdatesPanel] Failed to delete update:', error);
    }
  };

  const formatUpdateToText = (update: InvestorUpdate): string => {
    const lines = [`# ${update.title}`, ''];
    if (update.highlights) lines.push('## Highlights', update.highlights, '');
    if (update.metrics) lines.push('## Metrics', update.metrics, '');
    if (update.progress) lines.push('## Progress', update.progress, '');
    if (update.asks) lines.push('## Asks', update.asks, '');
    if (update.focus) lines.push('## Focus Next Period', update.focus, '');
    return lines.join('\n');
  };

  const handleExportClipboard = () => {
    if (!activeUpdate) return;
    const text = formatUpdateToText(activeUpdate);
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Copied to clipboard!');
    });
  };

  const handleExportMarkdown = () => {
    if (!activeUpdate) return;
    const text = formatUpdateToText(activeUpdate);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeUpdate.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  // ── Active update editor view ──
  if (activeUpdate) {
    return (
      <UpdateEditor
        key={activeUpdate.id}
        update={activeUpdate}
        onSave={handleSaveUpdate}
        onMarkAsSent={handleMarkAsSent}
        onClose={() => setActiveUpdate(null)}
        onExportClipboard={handleExportClipboard}
        onExportMarkdown={handleExportMarkdown}
        isSaving={isSaving}
      />
    );
  }

  // ── List view ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Investor Updates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and track investor updates for your committed investors.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateDraft} isLoading={isSaving}>
          <Plus size={16} className="mr-1.5" />
          New Update
        </Button>
      </div>

      {updates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No updates yet"
          description="Create your first investor update to keep your committed investors informed."
          action={{ label: 'Create Update', onClick: handleCreateDraft }}
        />
      ) : (
        <div className="space-y-3">
          {updates.map(update => (
            <div
              key={update.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveUpdate(update)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                    {update.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {formatDate(update.createdAt)}
                    </span>
                    {update.highlights && (
                      <span className="truncate max-w-xs text-gray-400">
                        {update.highlights.substring(0, 80)}...
                      </span>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-2 ml-4">
                  {update.status === 'draft' ? (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Draft
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Sent
                    </span>
                  )}
                  {update.status === 'draft' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(update.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Download, BarChart3, Calendar } from 'lucide-react';
import { MetricsSnapshot, MetricDefinition, DEFAULT_METRICS } from '../../types/metrics';
import { metricsSnapshotService } from '../../services/metricsSnapshotService';
import { updateService } from '../../services/updateService';
import { useTeam } from '../../contexts/TeamContext';
import { useLeads } from '../../contexts/LeadsContext';
import { useStages } from '../../contexts/StagesContext';
import { Button } from '../shared/Button';
import { Loader } from '../shared/Loader';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../utils/formatters';

// ── Helpers ──

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonth = (month: string): string => {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatMetricValue = (value: number | null, type: MetricDefinition['type']): string => {
  if (value == null) return '—';
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    case 'percentage':
      return `${value}%`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

// ── Metrics Input Form ──

interface MetricsFormProps {
  month: string;
  initialValues: Record<string, number | null>;
  customMetrics: MetricDefinition[];
  onSave: (metrics: Record<string, number | null>, customMetrics: MetricDefinition[]) => Promise<void>;
  isSaving: boolean;
}

const MetricsForm: React.FC<MetricsFormProps> = ({ month, initialValues, customMetrics: initialCustom, onSave, isSaving }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [customMetrics, setCustomMetrics] = useState<MetricDefinition[]>(initialCustom);
  const [newMetricLabel, setNewMetricLabel] = useState('');

  useEffect(() => {
    const v: Record<string, string> = {};
    [...DEFAULT_METRICS, ...initialCustom].forEach(m => {
      v[m.key] = initialValues[m.key] != null ? String(initialValues[m.key]) : '';
    });
    setValues(v);
  }, [initialValues, initialCustom]);

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleAddCustom = () => {
    if (!newMetricLabel.trim()) return;
    const key = `custom_${newMetricLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if ([...DEFAULT_METRICS, ...customMetrics].some(m => m.key === key)) return;
    setCustomMetrics(prev => [...prev, { key, label: newMetricLabel.trim(), type: 'number', isCustom: true }]);
    setNewMetricLabel('');
  };

  const handleRemoveCustom = (key: string) => {
    setCustomMetrics(prev => prev.filter(m => m.key !== key));
    setValues(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const metrics: Record<string, number | null> = {};
    [...DEFAULT_METRICS, ...customMetrics].forEach(m => {
      const raw = values[m.key];
      metrics[m.key] = raw !== undefined && raw !== '' ? parseFloat(raw) : null;
    });
    await onSave(metrics, customMetrics);
  };

  const allMetrics = [...DEFAULT_METRICS, ...customMetrics];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {formatMonth(month)}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMetrics.map(metric => (
          <div key={metric.key} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {metric.label}
              {metric.type === 'currency' && <span className="text-gray-400 ml-1">($)</span>}
              {metric.type === 'percentage' && <span className="text-gray-400 ml-1">(%)</span>}
            </label>
            <input
              type="number"
              step="any"
              value={values[metric.key] || ''}
              onChange={(e) => handleChange(metric.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="—"
            />
            {metric.isCustom && (
              <button
                type="button"
                onClick={() => handleRemoveCustom(metric.key)}
                className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500"
                title="Remove metric"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add custom metric */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Custom Metric</label>
          <input
            type="text"
            value={newMetricLabel}
            onChange={(e) => setNewMetricLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } }}
            placeholder="e.g. NPS Score"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleAddCustom} disabled={!newMetricLabel.trim()}>
          <Plus size={14} className="mr-1" />
          Add
        </Button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button type="submit" variant="primary" isLoading={isSaving}>
          <Save size={14} className="mr-1.5" />
          Save Snapshot
        </Button>
      </div>
    </form>
  );
};

// ── Board Pack Generator ──

interface BoardPackProps {
  snapshot: MetricsSnapshot | null;
  allMetrics: MetricDefinition[];
  companyName: string;
  leads: { stage: string }[];
  stages: { id: string; name: string; emoji: string }[];
  latestUpdate: { highlights: string; asks: string } | null;
}

const generateBoardPack = (props: BoardPackProps): string => {
  const { snapshot, allMetrics, companyName, leads, stages, latestUpdate } = props;
  const lines: string[] = [];
  const month = snapshot ? formatMonth(snapshot.month) : formatMonth(getCurrentMonth());

  lines.push(`# ${companyName} — Board Pack`);
  lines.push(`## ${month}`);
  lines.push('');

  // Metrics
  if (snapshot) {
    lines.push('## Key Metrics');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    allMetrics.forEach(m => {
      const val = snapshot.metrics[m.key];
      if (val != null) {
        lines.push(`| ${m.label} | ${formatMetricValue(val, m.type)} |`);
      }
    });
    lines.push('');
  }

  // Pipeline summary
  lines.push('## Pipeline Summary');
  lines.push('');
  lines.push('| Stage | Count |');
  lines.push('|-------|-------|');
  stages.forEach(stage => {
    const count = leads.filter(l => l.stage === stage.id).length;
    if (count > 0) {
      lines.push(`| ${stage.emoji} ${stage.name} | ${count} |`);
    }
  });
  lines.push('');

  // Latest update highlights
  if (latestUpdate?.highlights) {
    lines.push('## Highlights');
    lines.push('');
    lines.push(latestUpdate.highlights);
    lines.push('');
  }

  // Asks
  if (latestUpdate?.asks) {
    lines.push('## Current Asks');
    lines.push('');
    lines.push(latestUpdate.asks);
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Generated by ${companyName} via InvestiaFlow*`);

  return lines.join('\n');
};

// ── Main MetricsPanel ──

export const MetricsPanel: React.FC = () => {
  const { currentTeam } = useTeam();
  const { leads } = useLeads();
  const { stages } = useStages();
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const teamId = currentTeam?.id;
  const companyName = currentTeam?.branding?.companyName || currentTeam?.name || 'My Company';

  const loadSnapshots = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const data = await metricsSnapshotService.getSnapshots(teamId);
      setSnapshots(data);
    } catch (error) {
      console.error('[MetricsPanel] Failed to load snapshots:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const currentSnapshot = snapshots.find(s => s.month === selectedMonth) || null;

  const handleSave = async (metrics: Record<string, number | null>, customMetrics: MetricDefinition[]) => {
    if (!teamId) return;
    setIsSaving(true);
    try {
      const saved = await metricsSnapshotService.saveSnapshot(teamId, selectedMonth, metrics, customMetrics);
      setSnapshots(prev => {
        const exists = prev.findIndex(s => s.month === selectedMonth);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = saved;
          return updated;
        }
        return [saved, ...prev].sort((a, b) => b.month.localeCompare(a.month));
      });
    } catch (error) {
      console.error('[MetricsPanel] Failed to save snapshot:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBoardPack = async () => {
    if (!teamId) return;

    // Get latest sent update
    let latestUpdate = null;
    try {
      const updates = await updateService.getUpdates(teamId);
      const sent = updates.find(u => u.status === 'marked_sent');
      if (sent) latestUpdate = { highlights: sent.highlights, asks: sent.asks };
    } catch { /* no updates */ }

    const allMetrics = [...DEFAULT_METRICS, ...(currentSnapshot?.customMetrics || [])];
    const md = generateBoardPack({
      snapshot: currentSnapshot,
      allMetrics,
      companyName,
      leads,
      stages,
      latestUpdate,
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-pack-${selectedMonth}.md`;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Metrics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track monthly metrics and generate board packs.
          </p>
        </div>
        <Button variant="primary" onClick={handleExportBoardPack}>
          <Download size={16} className="mr-1.5" />
          Export Board Pack
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Metrics Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <MetricsForm
          month={selectedMonth}
          initialValues={currentSnapshot?.metrics || {}}
          customMetrics={currentSnapshot?.customMetrics || []}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

      {/* Snapshot History */}
      {snapshots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snapshot History</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                    {DEFAULT_METRICS.map(m => (
                      <th key={m.key} className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {m.label}
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {snapshots.map(snap => (
                    <tr
                      key={snap.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${snap.month === selectedMonth ? 'bg-primary-50' : ''}`}
                      onClick={() => setSelectedMonth(snap.month)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{formatMonth(snap.month)}</td>
                      {DEFAULT_METRICS.map(m => (
                        <td key={m.key} className="px-4 py-3 text-right text-sm text-gray-600">
                          {formatMetricValue(snap.metrics[m.key] ?? null, m.type)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(snap.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { HeartHandshake, Search, Edit, ChevronDown } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { Lead } from '../types/lead';
import { formatDate } from '../utils/formatters';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Modal } from '../components/shared/Modal';
import { EmptyState } from '../components/shared/EmptyState';
import { Loader } from '../components/shared/Loader';

interface EditIRFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSave: (updates: Partial<Lead>) => Promise<void>;
}

const EditIRFieldsModal: React.FC<EditIRFieldsModalProps> = ({ isOpen, onClose, lead, onSave }) => {
  const [investorType, setInvestorType] = useState<string>(lead.investorType || 'other');
  const [irStatus, setIrStatus] = useState<string>(lead.irStatus || 'active');
  const [irTags, setIrTags] = useState(lead.irTags?.join(', ') || '');
  const [commitmentAmount, setCommitmentAmount] = useState(
    lead.commitmentAmount != null ? String(lead.commitmentAmount) : ''
  );
  const [commitmentNotes, setCommitmentNotes] = useState(lead.commitmentNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates: Partial<Lead> = {
        investorType: investorType as Lead['investorType'],
        irStatus: irStatus as Lead['irStatus'],
        irTags: irTags.split(',').map(t => t.trim()).filter(Boolean),
        commitmentAmount: commitmentAmount ? parseFloat(commitmentAmount) : undefined,
        commitmentNotes: commitmentNotes || undefined,
      };
      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Failed to save IR fields:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit — ${lead.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investor Type</label>
          <select
            value={investorType}
            onChange={(e) => setInvestorType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="angel">Angel</option>
            <option value="vc">VC</option>
            <option value="family_office">Family Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={irStatus}
            onChange={(e) => setIrStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Input
          label="Commitment Amount"
          type="number"
          min="0"
          step="any"
          value={commitmentAmount}
          onChange={(e) => setCommitmentAmount(e.target.value)}
          placeholder="e.g. 50000"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            type="text"
            value={irTags}
            onChange={(e) => setIrTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="lead, follow-on, strategic (comma-separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commitment Notes</label>
          <textarea
            value={commitmentNotes}
            onChange={(e) => setCommitmentNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. SAFE note, will wire next month"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const INVESTOR_TYPE_LABELS: Record<string, string> = {
  angel: 'Angel',
  vc: 'VC',
  family_office: 'Family Office',
  other: 'Other',
};

const InvestorRelationsPage: React.FC = () => {
  const { leads, loading, updateLead } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Auto-populate: all leads in "committed" stage
  const committedInvestors = useMemo(() => {
    return leads
      .filter(lead => lead.stage === 'committed')
      .map(lead => ({
        ...lead,
        irStatus: lead.irStatus || 'active',
        investorType: lead.investorType || 'other',
      }));
  }, [leads]);

  // Apply filters
  const filteredInvestors = useMemo(() => {
    let result = committedInvestors;

    if (filterStatus !== 'all') {
      result = result.filter(inv => inv.irStatus === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv =>
        inv.name.toLowerCase().includes(q) ||
        inv.firm.toLowerCase().includes(q) ||
        inv.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [committedInvestors, filterStatus, searchQuery]);

  // Aggregated stats
  const totalCommitted = committedInvestors.length;
  const totalAmount = committedInvestors.reduce(
    (sum, inv) => sum + (inv.commitmentAmount || 0), 0
  );
  const activeCount = committedInvestors.filter(inv => inv.irStatus === 'active').length;

  const handleSaveIRFields = async (updates: Partial<Lead>) => {
    if (!editingLead) return;
    await updateLead(editingLead.id, updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HeartHandshake className="text-primary-600" size={28} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Investor Relations</h1>
        </div>
        <p className="text-gray-500">
          Manage committed investors and keep them engaged after your raise.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Committed Investors</p>
          <p className="text-3xl font-bold text-gray-900">{totalCommitted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Raised</p>
          <p className="text-3xl font-bold text-green-600">
            {totalAmount > 0
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(totalAmount)
              : '$0'
            }
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Active Investors</p>
          <p className="text-3xl font-bold text-primary-600">{activeCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search investors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Investors Table */}
      {filteredInvestors.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title={totalCommitted === 0 ? 'No committed investors yet' : 'No investors match your filters'}
          description={totalCommitted === 0
            ? 'Move investors to the "Committed" stage in your CRM pipeline and they\'ll appear here automatically.'
            : 'Try adjusting your search or filters.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Investor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Committed</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Update</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvestors.map((investor) => (
                  <tr key={investor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{investor.name}</p>
                        <p className="text-sm text-gray-500">{investor.firm}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {INVESTOR_TYPE_LABELS[investor.investorType || 'other']}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {investor.commitmentAmount != null ? (
                        <span className="font-semibold text-green-600">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(investor.commitmentAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {investor.commitmentDate ? formatDate(investor.commitmentDate) : formatDate(investor.stageEnteredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        investor.irStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {investor.irStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {investor.irTags && investor.irTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {investor.irTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {investor.lastUpdateSentAt ? formatDate(investor.lastUpdateSentAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingLead(investor)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit investor details"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLead && (
        <EditIRFieldsModal
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          lead={editingLead}
          onSave={handleSaveIRFields}
        />
      )}
    </div>
  );
};

export default InvestorRelationsPage;

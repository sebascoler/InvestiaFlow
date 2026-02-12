import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, Users, FileText, Eye, Download as DownloadIcon } from 'lucide-react';
import { useLeads } from '../contexts/LeadsContext';
import { useDocuments } from '../contexts/DocumentsContext';
import { calculatePipelineMetrics, calculateDocumentMetrics, PipelineMetrics, DocumentMetrics } from '../services/metricsService';
import { MetricCard } from '../components/dashboard/MetricCard';
import { BarChart } from '../components/dashboard/BarChart';
import { LineChart } from '../components/dashboard/LineChart';
import { Loader } from '../components/shared/Loader';
import { Button } from '../components/shared/Button';
import { exportLeadsToCSV, exportMetricsToCSV } from '../utils/csvExport';
import { Tour } from '../components/onboarding/Tour';
import { getTourSteps } from '../utils/onboardingSteps';
import { useOnboarding } from '../hooks/useOnboarding';

const DashboardPage: React.FC = () => {
  const { leads, loading: leadsLoading } = useLeads();
  const { documents, loading: documentsLoading, getDocumentShares } = useDocuments();
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [documentMetrics, setDocumentMetrics] = useState<DocumentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { shouldShowTutorial, progress } = useOnboarding();
  const [showTour, setShowTour] = useState(false);

  // Show tour if user just started onboarding and hasn't completed dashboard tour
  useEffect(() => {
    if (shouldShowTutorial('dashboard') && progress && !progress.completed) {
      // Verify elements exist before starting tour
      const verifyElements = () => {
        const sidebar = document.querySelector('[data-tour="sidebar"]');
        const metrics = document.querySelector('[data-tour="dashboard-metrics"]');
        return sidebar !== null && metrics !== null;
      };
      
      // Small delay to ensure page is rendered, then verify elements
      const timer = setTimeout(() => {
        if (verifyElements()) {
          setShowTour(true);
        } else {
          // Retry once more if elements aren't ready
          const retryTimer = setTimeout(() => {
            if (verifyElements()) {
              setShowTour(true);
            }
          }, 500);
          return () => clearTimeout(retryTimer);
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowTour(false);
    }
  }, [shouldShowTutorial, progress]);

  useEffect(() => {
    loadMetrics();
  }, [leads, documents]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Calcular métricas del pipeline
      const pipeline = calculatePipelineMetrics(leads);
      setPipelineMetrics(pipeline);
      
      // Calcular métricas de documentos
      // Necesitamos obtener todos los shares
      const getAllShares = async () => {
        // Obtener shares de todos los documentos
        const allShares: any[] = [];
        for (const doc of documents) {
          try {
            const shares = await getDocumentShares(doc.id);
            allShares.push(...shares);
          } catch (error) {
            console.error(`Error loading shares for document ${doc.id}:`, error);
          }
        }
        return allShares;
      };
      
      const docMetrics = await calculateDocumentMetrics(documents, getAllShares);
      setDocumentMetrics(docMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLeads = () => {
    exportLeadsToCSV(leads);
  };

  const handleExportMetrics = () => {
    if (pipelineMetrics && documentMetrics) {
      exportMetricsToCSV(pipelineMetrics, documentMetrics);
    }
  };

  if (leadsLoading || documentsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!pipelineMetrics || !documentMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load metrics</p>
      </div>
    );
  }

  return (
    <>
      {showTour && (
        <Tour
          steps={getTourSteps('dashboard')}
          tourId="dashboard"
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Pipeline metrics and analysis</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExportLeads} data-tour="dashboard-export">
              <Download size={16} className="mr-2" />
              Export Leads
            </Button>
            <Button variant="secondary" onClick={handleExportMetrics}>
              <Download size={16} className="mr-2" />
              Export Metrics
            </Button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="dashboard-metrics">
        <MetricCard
          title="Total Leads"
          value={pipelineMetrics.totalLeads}
          subtitle={`${pipelineMetrics.activeLeads} active`}
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${pipelineMetrics.conversionRate}%`}
          subtitle="Leads that reached Committed"
          icon={TrendingUp}
        />
        <MetricCard
          title="Average Time"
          value={`${pipelineMetrics.averageTimeInPipeline} days`}
          subtitle="In the full pipeline"
          icon={TrendingUp}
        />
        <MetricCard
          title="Documentos"
          value={documentMetrics.totalDocuments}
          subtitle={`${documentMetrics.totalShares} shared`}
          icon={FileText}
        />
      </div>

      {/* Gráficos de stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="dashboard-charts">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads by Stage</h2>
          <BarChart
            data={pipelineMetrics.stageMetrics.map(stage => ({
              label: stage.stageName,
              value: stage.count,
              color: getStageColor(stage.stageId),
            }))}
            height={250}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Average Time by Stage</h2>
          <BarChart
            data={pipelineMetrics.stageMetrics
              .filter(stage => stage.averageTimeInStage > 0)
              .map(stage => ({
                label: stage.stageName,
                value: stage.averageTimeInStage,
                color: '#f59e0b',
              }))}
            height={250}
          />
          <p className="text-xs text-gray-500 mt-2">In days</p>
        </div>
      </div>

      {/* Gráficos temporales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads by Month</h2>
          <LineChart
            data={pipelineMetrics.leadsByMonth.map(item => ({
              label: item.month,
              value: item.count,
            }))}
            height={200}
            showValues={true}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads by Week</h2>
          <LineChart
            data={pipelineMetrics.leadsByWeek.map(item => ({
              label: item.week,
              value: item.count,
            }))}
            height={200}
            showValues={true}
          />
        </div>
      </div>

      {/* Métricas de documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Viewed"
              value={`${documentMetrics.totalViews}`}
              subtitle={`${documentMetrics.viewRate}% of shares`}
              icon={Eye}
              className="border-0 shadow-none p-4"
            />
            <MetricCard
              title="Downloaded"
              value={`${documentMetrics.totalDownloads}`}
              subtitle={`${documentMetrics.downloadRate}% of shares`}
              icon={DownloadIcon}
              className="border-0 shadow-none p-4"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents by Category</h2>
          <BarChart
            data={documentMetrics.documentsByCategory.map(cat => ({
              label: cat.category,
              value: cat.count,
            }))}
            height={200}
          />
        </div>
      </div>
      </div>
    </>
  );
};

// Helper para obtener color del stage
const getStageColor = (stageId: string): string => {
  const colors: Record<string, string> = {
    target: 'bg-slate-500',
    first_contact: 'bg-blue-500',
    in_conversation: 'bg-cyan-500',
    pitch_shared: 'bg-purple-500',
    due_diligence: 'bg-amber-500',
    term_sheet: 'bg-orange-500',
    committed: 'bg-green-500',
    passed: 'bg-red-500',
  };
  return colors[stageId] || 'bg-gray-500';
};

export default DashboardPage;

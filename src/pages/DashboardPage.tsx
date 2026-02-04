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

const DashboardPage: React.FC = () => {
  const { leads, loading: leadsLoading } = useLeads();
  const { documents, loading: documentsLoading, getDocumentShares } = useDocuments();
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [documentMetrics, setDocumentMetrics] = useState<DocumentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

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
        <p className="text-gray-600">No se pudieron cargar las métricas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Métricas y análisis del pipeline</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportLeads}>
            <Download size={16} className="mr-2" />
            Exportar Leads
          </Button>
          <Button variant="secondary" onClick={handleExportMetrics}>
            <Download size={16} className="mr-2" />
            Exportar Métricas
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Leads"
          value={pipelineMetrics.totalLeads}
          subtitle={`${pipelineMetrics.activeLeads} activos`}
          icon={Users}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${pipelineMetrics.conversionRate}%`}
          subtitle="Leads que llegaron a Committed"
          icon={TrendingUp}
        />
        <MetricCard
          title="Tiempo Promedio"
          value={`${pipelineMetrics.averageTimeInPipeline} días`}
          subtitle="En el pipeline completo"
          icon={TrendingUp}
        />
        <MetricCard
          title="Documentos"
          value={documentMetrics.totalDocuments}
          subtitle={`${documentMetrics.totalShares} compartidos`}
          icon={FileText}
        />
      </div>

      {/* Gráficos de stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads por Stage</h2>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiempo Promedio por Stage</h2>
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
          <p className="text-xs text-gray-500 mt-2">En días</p>
        </div>
      </div>

      {/* Gráficos temporales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads por Mes</h2>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads por Semana</h2>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas de Documentos</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Vistos"
              value={`${documentMetrics.totalViews}`}
              subtitle={`${documentMetrics.viewRate}% de shares`}
              icon={Eye}
              className="border-0 shadow-none p-4"
            />
            <MetricCard
              title="Descargados"
              value={`${documentMetrics.totalDownloads}`}
              subtitle={`${documentMetrics.downloadRate}% de shares`}
              icon={DownloadIcon}
              className="border-0 shadow-none p-4"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Documentos por Categoría</h2>
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

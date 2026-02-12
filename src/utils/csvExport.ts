import { Lead } from '../types/lead';
import { PipelineMetrics, DocumentMetrics } from '../services/metricsService';

/**
 * Exporta leads a CSV
 */
export const exportLeadsToCSV = (leads: Lead[]): void => {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Firm',
    'Stage',
    'Date Created',
    'Last Updated',
    'Last Contact',
    'Notes',
  ];

  const rows = leads.map(lead => [
    lead.id,
    lead.name,
    lead.email,
    lead.firm,
    lead.stage,
    formatDate(lead.createdAt),
    formatDate(lead.updatedAt),
    lead.lastContactDate ? formatDate(lead.lastContactDate) : '',
    lead.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadCSV(csvContent, `leads-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Exporta métricas a CSV
 */
export const exportMetricsToCSV = (
  pipelineMetrics: PipelineMetrics,
  documentMetrics: DocumentMetrics
): void => {
  const csvContent = [
    'PIPELINE METRICS',
    '',
    'General Metrics',
    `Total Leads,${pipelineMetrics.totalLeads}`,
    `Active Leads,${pipelineMetrics.activeLeads}`,
    `Conversion Rate,${pipelineMetrics.conversionRate}%`,
    `Average Time in Pipeline,${pipelineMetrics.averageTimeInPipeline} days`,
    '',
    'Metrics by Stage',
    'Stage,Count,Percentage,Average Time (days)',
    ...pipelineMetrics.stageMetrics.map(stage =>
      `${stage.stageName},${stage.count},${stage.percentage.toFixed(2)}%,${stage.averageTimeInStage}`
    ),
    '',
    'DOCUMENT METRICS',
    '',
    `Total Documents,${documentMetrics.totalDocuments}`,
    `Total Shared,${documentMetrics.totalShares}`,
    `Total Viewed,${documentMetrics.totalViews}`,
    `Total Downloaded,${documentMetrics.totalDownloads}`,
    `View Rate,${documentMetrics.viewRate}%`,
    `Download Rate,${documentMetrics.downloadRate}%`,
    '',
    'Documents by Category',
    'Category,Count',
    ...documentMetrics.documentsByCategory.map(cat =>
      `${cat.category},${cat.count}`
    ),
  ].join('\n');

  downloadCSV(csvContent, `metrics-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Descarga un archivo CSV
 */
const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Formatea una fecha para CSV
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

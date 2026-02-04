import { Lead } from '../types/lead';
import { PipelineMetrics, DocumentMetrics } from '../services/metricsService';

/**
 * Exporta leads a CSV
 */
export const exportLeadsToCSV = (leads: Lead[]): void => {
  const headers = [
    'ID',
    'Nombre',
    'Email',
    'Firma',
    'Stage',
    'Fecha Creación',
    'Última Actualización',
    'Último Contacto',
    'Notas',
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
    'MÉTRICAS DEL PIPELINE',
    '',
    'Métricas Generales',
    `Total Leads,${pipelineMetrics.totalLeads}`,
    `Leads Activos,${pipelineMetrics.activeLeads}`,
    `Tasa de Conversión,${pipelineMetrics.conversionRate}%`,
    `Tiempo Promedio en Pipeline,${pipelineMetrics.averageTimeInPipeline} días`,
    '',
    'Métricas por Stage',
    'Stage,Count,Porcentaje,Tiempo Promedio (días)',
    ...pipelineMetrics.stageMetrics.map(stage =>
      `${stage.stageName},${stage.count},${stage.percentage.toFixed(2)}%,${stage.averageTimeInStage}`
    ),
    '',
    'MÉTRICAS DE DOCUMENTOS',
    '',
    `Total Documentos,${documentMetrics.totalDocuments}`,
    `Total Compartidos,${documentMetrics.totalShares}`,
    `Total Vistos,${documentMetrics.totalViews}`,
    `Total Descargados,${documentMetrics.totalDownloads}`,
    `Tasa de Visualización,${documentMetrics.viewRate}%`,
    `Tasa de Descarga,${documentMetrics.downloadRate}%`,
    '',
    'Documentos por Categoría',
    'Categoría,Cantidad',
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

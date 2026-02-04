import { Lead } from '../types/lead';
import { StageId, STAGES } from '../types/stage';
import { Document, SharedDocument } from '../types/document';

export interface StageMetrics {
  stageId: StageId;
  stageName: string;
  count: number;
  percentage: number;
  averageTimeInStage: number; // días
}

export interface PipelineMetrics {
  totalLeads: number;
  activeLeads: number; // Excluye 'passed' y 'committed'
  conversionRate: number; // % de leads que llegaron a 'committed'
  averageTimeInPipeline: number; // días promedio desde creación hasta committed/passed
  stageMetrics: StageMetrics[];
  leadsByMonth: { month: string; count: number }[];
  leadsByWeek: { week: string; count: number }[];
}

export interface DocumentMetrics {
  totalDocuments: number;
  totalShares: number;
  totalViews: number;
  totalDownloads: number;
  viewRate: number; // % de shares que fueron vistos
  downloadRate: number; // % de shares que fueron descargados
  documentsByCategory: { category: string; count: number }[];
}

/**
 * Calcula métricas del pipeline de leads
 */
export const calculatePipelineMetrics = (leads: Lead[]): PipelineMetrics => {
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => l.stage !== 'passed' && l.stage !== 'committed').length;
  
  // Leads que llegaron a committed
  const committedLeads = leads.filter(l => l.stage === 'committed');
  const conversionRate = totalLeads > 0 ? (committedLeads.length / totalLeads) * 100 : 0;
  
  // Tiempo promedio en pipeline (desde creación hasta committed/passed)
  const completedLeads = leads.filter(l => l.stage === 'committed' || l.stage === 'passed');
  const totalTimeInPipeline = completedLeads.reduce((sum, lead) => {
    const timeDiff = lead.updatedAt.getTime() - lead.createdAt.getTime();
    return sum + timeDiff;
  }, 0);
  const averageTimeInPipeline = completedLeads.length > 0 
    ? totalTimeInPipeline / completedLeads.length / (1000 * 60 * 60 * 24) // convertir a días
    : 0;
  
  // Métricas por stage
  const stageMetrics: StageMetrics[] = STAGES.map(stage => {
    const stageLeads = leads.filter(l => l.stage === stage.id);
    const count = stageLeads.length;
    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
    
    // Tiempo promedio en este stage
    const now = new Date();
    const totalTimeInStage = stageLeads.reduce((sum, lead) => {
      const timeDiff = now.getTime() - lead.stageEnteredAt.getTime();
      return sum + timeDiff;
    }, 0);
    const averageTimeInStage = count > 0 
      ? totalTimeInStage / count / (1000 * 60 * 60 * 24) // convertir a días
      : 0;
    
    return {
      stageId: stage.id,
      stageName: stage.name,
      count,
      percentage,
      averageTimeInStage: Math.round(averageTimeInStage * 10) / 10, // redondear a 1 decimal
    };
  });
  
  // Leads por mes (últimos 6 meses)
  const leadsByMonth = getLeadsByMonth(leads);
  
  // Leads por semana (últimas 8 semanas)
  const leadsByWeek = getLeadsByWeek(leads);
  
  return {
    totalLeads,
    activeLeads,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageTimeInPipeline: Math.round(averageTimeInPipeline * 10) / 10,
    stageMetrics,
    leadsByMonth,
    leadsByWeek,
  };
};

/**
 * Agrupa leads por mes
 */
const getLeadsByMonth = (leads: Lead[]): { month: string; count: number }[] => {
  const months: Record<string, number> = {};
  const now = new Date();
  
  // Inicializar últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }
  
  // Contar leads por mes de creación
  leads.forEach(lead => {
    const date = new Date(lead.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (months[key] !== undefined) {
      months[key]++;
    }
  });
  
  return Object.entries(months).map(([month, count]) => ({
    month: formatMonth(month),
    count,
  }));
};

/**
 * Agrupa leads por semana
 */
const getLeadsByWeek = (leads: Lead[]): { week: string; count: number }[] => {
  const weeks: Record<string, number> = {};
  const now = new Date();
  
  // Inicializar últimas 8 semanas
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    const weekStart = getWeekStart(date);
    const key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
    weeks[key] = 0;
  }
  
  // Contar leads por semana de creación
  leads.forEach(lead => {
    const weekStart = getWeekStart(new Date(lead.createdAt));
    const key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
    if (weeks[key] !== undefined) {
      weeks[key]++;
    }
  });
  
  return Object.entries(weeks).map(([week, count]) => ({
    week: formatWeek(week),
    count,
  }));
};

/**
 * Obtiene el inicio de la semana (lunes)
 */
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea día 1
  return new Date(d.setDate(diff));
};

/**
 * Obtiene el número de semana del año
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Formatea el mes para mostrar
 */
const formatMonth = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

/**
 * Formatea la semana para mostrar
 */
const formatWeek = (weekKey: string): string => {
  const [year, weekNum] = weekKey.split('-W');
  return `Sem ${weekNum}, ${year}`;
};

/**
 * Calcula métricas de documentos
 */
export const calculateDocumentMetrics = async (
  documents: Document[],
  getAllShares: () => Promise<SharedDocument[]>
): Promise<DocumentMetrics> => {
  const totalDocuments = documents.length;
  
  // Obtener todos los shares
  const allShares = await getAllShares();
  const totalShares = allShares.length;
  const totalViews = allShares.filter(s => s.viewedAt !== null).length;
  const totalDownloads = allShares.filter(s => s.downloadedAt !== null).length;
  
  const viewRate = totalShares > 0 ? (totalViews / totalShares) * 100 : 0;
  const downloadRate = totalShares > 0 ? (totalDownloads / totalShares) * 100 : 0;
  
  // Documentos por categoría
  const categoryCounts: Record<string, number> = {};
  documents.forEach(doc => {
    categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
  });
  
  const categoryNames: Record<string, string> = {
    pitch: 'Pitch',
    financials: 'Financieros',
    legal: 'Legales',
    metrics: 'Métricas',
    other: 'Otros',
  };
  
  const documentsByCategory = Object.entries(categoryCounts).map(([category, count]) => ({
    category: categoryNames[category] || category,
    count,
  }));
  
  return {
    totalDocuments,
    totalShares,
    totalViews,
    totalDownloads,
    viewRate: Math.round(viewRate * 10) / 10,
    downloadRate: Math.round(downloadRate * 10) / 10,
    documentsByCategory,
  };
};

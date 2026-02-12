import { Step } from 'react-joyride';

// Step configurations for different tours
export const dashboardSteps: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    content: 'Este es el menú principal. Desde aquí puedes navegar a todas las secciones de InvestiaFlow.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-metrics"]',
    content: 'Aquí puedes ver las métricas clave de tu pipeline de fundraising: leads totales, conversión y documentos compartidos.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-charts"]',
    content: 'Los gráficos te muestran la distribución de leads por stage y el progreso a lo largo del tiempo.',
    placement: 'top',
  },
  {
    target: '[data-tour="dashboard-export"]',
    content: 'Puedes exportar tus datos y métricas en formato CSV para análisis externos.',
    placement: 'left',
  },
];

export const crmSteps: Step[] = [
  {
    target: '[data-tour="crm-add-lead"]',
    content: 'Haz clic aquí para agregar un nuevo lead (inversor potencial) a tu pipeline.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="crm-kanban"]',
    content: 'Arrastra y suelta los leads entre las columnas para cambiar su stage. Cada stage representa una fase del proceso de fundraising.',
    placement: 'top',
  },
  {
    target: '[data-tour="crm-filters"]',
    content: 'Usa los filtros para buscar leads específicos por nombre, stage, tags o fecha.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="crm-kanban"]',
    content: 'Haz clic en cualquier lead para ver sus detalles completos, historial y documentos compartidos.',
    placement: 'top',
  },
];

export const dataroomSteps: Step[] = [
  {
    target: '[data-tour="dataroom-upload"]',
    content: 'Sube documentos importantes como pitch decks, términos de inversión, o información financiera.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dataroom-document-list"]',
    content: 'Aquí verás todos tus documentos organizados por categoría. Puedes ver, descargar o eliminar cada uno. Haz clic en el ícono de configuración (⚙️) para configurar permisos de compartir automático.',
    placement: 'top',
  },
];

export const teamSteps: Step[] = [
  {
    target: '[data-tour="team-invite"]',
    content: 'Invita miembros a tu equipo para colaborar en el proceso de fundraising.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="team-members"]',
    content: 'Gestiona los roles y permisos de cada miembro del equipo. Puedes asignar roles de Owner, Admin, Editor o Viewer.',
    placement: 'top',
  },
  {
    target: '[data-tour="team-branding"]',
    content: 'Personaliza el branding de tu equipo: sube tu logo y configura los colores de la aplicación.',
    placement: 'bottom',
  },
];

// Helper to get steps for a specific tour
export const getTourSteps = (tourId: string): Step[] => {
  switch (tourId) {
    case 'dashboard':
      return dashboardSteps;
    case 'crm':
      return crmSteps;
    case 'dataroom':
      return dataroomSteps;
    case 'team':
      return teamSteps;
    default:
      return [];
  }
};

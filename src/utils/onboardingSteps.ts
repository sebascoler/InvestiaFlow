import { Step } from 'react-joyride';

// Step configurations for different tours
export const dashboardSteps: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    content: 'This is the main menu. From here you can navigate to all sections of InvestiaFlow.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-metrics"]',
    content: 'Here you can see key fundraising pipeline metrics: total leads, conversion, and shared documents.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-charts"]',
    content: 'The charts show lead distribution by stage and progress over time.',
    placement: 'top',
  },
  {
    target: '[data-tour="dashboard-export"]',
    content: 'You can export your data and metrics to CSV for external analysis.',
    placement: 'left',
  },
];

export const crmSteps: Step[] = [
  {
    target: '[data-tour="crm-add-lead"]',
    content: 'Click here to add a new lead (potential investor) to your pipeline.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="crm-kanban"]',
    content: 'Drag and drop leads between columns to change their stage. Each stage represents a phase of the fundraising process.',
    placement: 'top',
  },
  {
    target: '[data-tour="crm-filters"]',
    content: 'Use filters to search for specific leads by name, stage, tags, or date.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="crm-kanban"]',
    content: 'Click on any lead to view full details, history, and shared documents.',
    placement: 'top',
  },
];

export const dataroomSteps: Step[] = [
  {
    target: '[data-tour="dataroom-upload"]',
    content: 'Upload important documents such as pitch decks, investment terms, or financial information.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dataroom-document-list"]',
    content: 'Here you\'ll see all your documents organized by category. You can view, download, or delete each one. Click the settings icon (⚙️) to configure automatic sharing permissions.',
    placement: 'top',
  },
];

export const teamSteps: Step[] = [
  {
    target: '[data-tour="team-invite"]',
    content: 'Invite team members to collaborate on the fundraising process.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="team-members"]',
    content: 'Manage roles and permissions for each team member. You can assign Owner, Admin, Editor, or Viewer roles.',
    placement: 'top',
  },
  {
    target: '[data-tour="team-branding"]',
    content: 'Customize your team branding: upload your logo and set application colors.',
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

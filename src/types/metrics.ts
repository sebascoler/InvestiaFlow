export interface MetricDefinition {
  key: string;
  label: string;
  type: 'currency' | 'number' | 'percentage';
  isCustom?: boolean;
}

export const DEFAULT_METRICS: MetricDefinition[] = [
  { key: 'revenue', label: 'Revenue', type: 'currency' },
  { key: 'burn', label: 'Monthly Burn', type: 'currency' },
  { key: 'runway', label: 'Runway (months)', type: 'number' },
  { key: 'users', label: 'Users / Customers', type: 'number' },
  { key: 'growthRate', label: 'Growth Rate', type: 'percentage' },
  { key: 'cash', label: 'Cash on Hand', type: 'currency' },
];

export interface MetricsSnapshot {
  id: string;
  teamId: string;
  month: string; // YYYY-MM format
  metrics: Record<string, number | null>; // key → value
  customMetrics?: MetricDefinition[]; // custom metric definitions for this snapshot
  createdAt: Date;
  updatedAt: Date;
}

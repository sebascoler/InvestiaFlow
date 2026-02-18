import { Lead } from '../types/lead';
import { Stage, DEFAULT_STAGES } from '../types/stage';
import { FilterOptions } from '../components/crm/SearchAndFilters';

/**
 * Filtra y ordena leads según los filtros aplicados
 */
export const filterAndSortLeads = (leads: Lead[], filters: FilterOptions, stages?: Stage[]): Lead[] => {
  let filtered = [...leads];

  // Aplicar búsqueda por texto
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(lead =>
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.firm.toLowerCase().includes(query) ||
      lead.notes?.toLowerCase().includes(query) ||
      lead.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Aplicar filtro por stages
  if (filters.stages.length > 0) {
    filtered = filtered.filter(lead => filters.stages.includes(lead.stage));
  }

  // Aplicar filtro por tags (debe tener TODOS los tags seleccionados)
  if (filters.tags.length > 0) {
    filtered = filtered.filter(lead => {
      if (!lead.tags || lead.tags.length === 0) return false;
      // El lead debe tener TODOS los tags seleccionados (AND, no OR)
      return filters.tags.every(tag => lead.tags!.includes(tag));
    });
  }

  // Aplicar ordenamiento
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
      case 'lastContactDate':
        const aDate = a.lastContactDate?.getTime() || 0;
        const bDate = b.lastContactDate?.getTime() || 0;
        comparison = aDate - bDate;
        // Si no tienen fecha, ponerlos al final
        if (!a.lastContactDate && b.lastContactDate) comparison = 1;
        if (a.lastContactDate && !b.lastContactDate) comparison = -1;
        break;
      case 'stage':
        // Ordenar por el orden del stage
        const resolvedStages = stages || DEFAULT_STAGES;
        const stageOrder = (stage: string) => {
          const index = resolvedStages.findIndex(s => s.id === stage);
          return index >= 0 ? index : 999;
        };
        comparison = stageOrder(a.stage) - stageOrder(b.stage);
        break;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};

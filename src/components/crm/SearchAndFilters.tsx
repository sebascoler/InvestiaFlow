import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { StageId, STAGES } from '../../types/stage';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

export interface FilterOptions {
  searchQuery: string;
  stages: StageId[];
  tags: string[]; // Tags seleccionados para filtrar
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'lastContactDate' | 'stage';
  sortOrder: 'asc' | 'desc';
}

interface SearchAndFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  availableTags?: string[]; // Tags disponibles de todos los leads
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableTags = [],
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value,
    });
  };

  const toggleStage = (stageId: StageId) => {
    const newStages = filters.stages.includes(stageId)
      ? filters.stages.filter(s => s !== stageId)
      : [...filters.stages, stageId];
    
    onFiltersChange({
      ...filters,
      stages: newStages,
    });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder,
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags,
    });
  };

  const hasActiveFilters = filters.stages.length > 0 || filters.searchQuery.length > 0 || filters.tags.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar por nombre, email, firma, tags..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary-100 text-primary-700' : ''}
          >
            <Filter size={18} className="mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                {filters.stages.length + filters.tags.length + (filters.searchQuery ? 1 : 0)}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} size="sm">
              <X size={18} className="mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        
        {/* Tags seleccionados visibles siempre */}
        {filters.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-2 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-xs text-blue-700 font-medium">Tags activos:</span>
            {filters.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
              >
                {tag}
                <X size={12} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
          {/* Stage Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((stage) => {
                const isSelected = filters.stages.includes(stage.id);
                return (
                  <button
                    key={stage.id}
                    onClick={() => toggleStage(stage.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {stage.emoji} {stage.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Tags
              {filters.tags.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({filters.tags.length} seleccionado{filters.tags.length > 1 ? 's' : ''})
                </span>
              )}
            </label>
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No hay tags disponibles. Agrega tags a tus leads para filtrarlos.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Tags seleccionados */}
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-500 font-medium">Seleccionados:</span>
                    {filters.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                      >
                        {tag}
                        <X size={14} />
                      </button>
                    ))}
                  </div>
                )}
                {/* Todos los tags disponibles */}
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = filters.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'name' as const, label: 'Nombre' },
                { value: 'createdAt' as const, label: 'Fecha creación' },
                { value: 'updatedAt' as const, label: 'Última actualización' },
                { value: 'lastContactDate' as const, label: 'Último contacto' },
                { value: 'stage' as const, label: 'Stage' },
              ].map((option) => {
                const isActive = filters.sortBy === option.value;
                const isAsc = isActive && filters.sortOrder === 'asc';
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1
                      ${isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {option.label}
                    {isActive && (
                      <span className="text-xs">
                        {isAsc ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

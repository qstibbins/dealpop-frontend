import { useState, useEffect, useCallback } from 'react';
import { SearchFilters } from '../services/searchService';

export function useSearch(initialFilters: SearchFilters) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(initialFilters);

  // Debounce search query to avoid excessive filtering on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    debouncedFilters,
    updateFilters,
    resetFilters,
  };
} 
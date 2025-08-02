import { useState, useEffect } from 'react';
import { SearchFilters as SearchFiltersType } from '../services/searchService';
import { ExtractedProduct } from '../services/chromeStorage';
import SearchSuggestions from './SearchSuggestions';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  products: ExtractedProduct[];
  className?: string;
}

export default function SearchFilters({ 
  filters, 
  onFiltersChange, 
  products, 
  className = '' 
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [vendors, setVendors] = useState<string[]>([]);

  useEffect(() => {
    // Get unique vendors from products
    const uniqueVendors = [...new Set(products.map(p => p.vendor).filter((vendor): vendor is string => !!vendor))].sort();
    setVendors(uniqueVendors);
  }, [products]);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      [key]: value
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Check if suggestion is a status
    if (['tracking', 'paused', 'completed'].includes(suggestion)) {
      onFiltersChange({ status: suggestion as 'tracking' | 'paused' | 'completed' });
    } else {
      // Treat as search query
      onFiltersChange({ query: suggestion });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      status: 'all',
      vendor: '',
      priceRange: { min: 0, max: Infinity },
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.query || 
    filters.status !== 'all' || 
    filters.vendor || 
    filters.priceRange.min > 0 || 
    filters.priceRange.max < Infinity;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products by name, vendor, brand..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search Suggestions */}
          <SearchSuggestions
            products={products}
            onSuggestionClick={handleSuggestionClick}
            className="mb-4"
          />

          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'tracking', 'paused', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Filter */}
          {vendors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <select
                value={filters.vendor}
                onChange={(e) => handleFilterChange('vendor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min === 0 ? '' : filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  min: e.target.value ? parseFloat(e.target.value) : 0
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  max: e.target.value ? parseFloat(e.target.value) : Infinity
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex items-center gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date Added</option>
                <option value="name">Product Name</option>
                <option value="price">Price</option>
                <option value="vendor">Vendor</option>
              </select>
              
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={filters.sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {filters.sortOrder === 'asc' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
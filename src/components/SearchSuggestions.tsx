import { useState, useEffect } from 'react';
import { ExtractedProduct } from '../services/chromeStorage';

interface SearchSuggestionsProps {
  products: ExtractedProduct[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export default function SearchSuggestions({ 
  products, 
  onSuggestionClick, 
  className = '' 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Generate suggestions from product data
    const vendorSuggestions = [...new Set(products.map(p => p.vendor).filter((vendor): vendor is string => !!vendor))].slice(0, 5);
    const statusSuggestions = ['tracking', 'completed', 'paused'];
    
    const allSuggestions = [
      ...vendorSuggestions,
      ...statusSuggestions
    ].slice(0, 8);

    setSuggestions(allSuggestions);
  }, [products]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="text-sm text-gray-600 mb-2">Popular searches:</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
} 
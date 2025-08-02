import { ExtractedProduct } from '../services/chromeStorage';
import ProductCard from './ProductCard';

interface SearchResultsProps {
  products: ExtractedProduct[];
  filteredProducts: ExtractedProduct[];
  loading: boolean;
  className?: string;
  onCreateAlert?: (product: any) => void;
  onViewProduct?: (url: string) => void;
  isSmartSortingActive?: boolean;
}

export default function SearchResults({ 
  products, 
  filteredProducts, 
  loading, 
  className = '',
  onCreateAlert,
  onViewProduct,
  isSmartSortingActive = false,
}: SearchResultsProps) {

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading your products...</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">
            Use the Chrome extension to extract products from shopping websites.
          </p>
          <div className="text-sm text-gray-400">
            Products you extract will appear here automatically.
          </div>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <div className="text-sm text-gray-400">
            Showing 0 of {products.length} products
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          
          {isSmartSortingActive && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              <span>🎯</span>
              <span>Smart Sort Active</span>
            </div>
          )}
        </div>
        
        {filteredProducts.length > 0 && (
          <div className="text-sm text-gray-500">
            {filteredProducts.length === 1 ? '1 product' : `${filteredProducts.length} products`} found
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id}>
            <ProductCard
              id={product.id}
              imageUrl={`${import.meta.env.BASE_URL}img/laptop.png`} // Default image
              title={product.product_name}
              price={product.price}
              vendor={product.vendor || 'Unknown'}
              targetPrice={product.targetPrice}
              expiresIn={product.expiresIn}
              status={product.status}
              url={product.url}
              extractedAt={product.extractedAt}
              onCreateAlert={onCreateAlert}
              onViewProduct={onViewProduct}
              hasAlert={product.hasAlert}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 
import { useState } from 'react';
import { useImage } from '../hooks/useImage';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from './ui/StatusBadge';

type ProductCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
  vendor: string;
  targetPrice?: string;
  expiresIn?: string;
  status?: 'tracking' | 'paused' | 'completed';
  url?: string;
  extractedAt?: string;
  onCreateAlert?: (product: any) => Promise<void>;
  onViewProduct?: (url: string) => Promise<void>;
};

export default function ProductCard({
  id,
  imageUrl,
  title,
  price,
  vendor,
  targetPrice,
  expiresIn,
  status = 'tracking',
  url,
  extractedAt,
  onCreateAlert,
  onViewProduct,
}: ProductCardProps) {
  const { imageState, currentImageUrl, retry } = useImage(imageUrl, title, {
    optimize: true,
    preload: false,
  });
  const { showToast } = useToast();
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [isViewingProduct, setIsViewingProduct] = useState(false);





  const handleCreateAlert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCreateAlert) return;
    
    setIsCreatingAlert(true);
    try {
      const product = {
        id,
        imageUrl,
        title,
        price,
        vendor,
        targetPrice,
        expiresIn,
        status,
        url,
        extractedAt,
      };
      await onCreateAlert(product);
      showToast('Alert created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create alert. Please try again.', 'error');
    } finally {
      setIsCreatingAlert(false);
    }
  };

  const handleViewProduct = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onViewProduct || !url) return;
    
    setIsViewingProduct(true);
    try {
      await onViewProduct(url);
      showToast('Opening product page...', 'info');
    } catch (error) {
      showToast('Failed to open product page. Please try again.', 'error');
    } finally {
      setIsViewingProduct(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4 w-full max-w-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={status} size="sm" />
          {expiresIn && (
            <span className="text-xs text-gray-500 font-medium">
              Tracker ends in {expiresIn}
            </span>
          )}
        </div>
        
        {/* Image Container with Loading and Error States */}
        <div className="h-32 w-full mb-3 relative bg-gray-100 rounded-lg overflow-hidden">
          {imageState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {imageState === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Image unavailable</p>
                <button 
                  onClick={retry}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          <img 
            src={currentImageUrl} 
            alt={title} 
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        </div>
        
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h3>
        
        <p className="text-gray-600 text-sm mb-2">{vendor}</p>
        
        {/* Current Price and Target Price Display */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">Current Price</p>
            <div className="flex items-center space-x-2">
              <p className="font-bold text-gray-900">${price}</p>
              {targetPrice && parseFloat(price.replace(/[^0-9.]/g, '')) <= parseFloat(targetPrice.replace(/[^0-9.]/g, '')) && (
                <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded-full">
                  DEAL
                </span>
              )}
            </div>
          </div>
          {targetPrice && (
            <div>
              <p className="text-xs text-gray-500">Target Price</p>
              <p className="font-semibold text-blue-600">${targetPrice}</p>
            </div>
          )}
        </div>

        {/* Create Alert and View Product Buttons */}
        <div className="flex flex-col space-y-2 relative z-20">
          {onCreateAlert && (
            <button
              onClick={handleCreateAlert}
              disabled={isCreatingAlert}
              className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreatingAlert ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Alert'
              )}
            </button>
          )}
          {onViewProduct && url && (
            <button
              onClick={handleViewProduct}
              disabled={isViewingProduct}
              className="w-full px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isViewingProduct ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opening...
                </>
              ) : (
                'View Product'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
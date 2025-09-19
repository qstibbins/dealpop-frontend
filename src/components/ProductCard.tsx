import { useImage } from '../hooks/useImage';
import StatusBadge from './ui/StatusBadge';
import { formatPrice } from '../utils/priceFormatting';

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
  onCreateAlert?: (product: any) => void;
  onViewProduct?: (url: string) => void;
  hasAlert?: boolean;
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
  hasAlert = false,
}: ProductCardProps) {
  const { imageState, currentImageUrl, retry } = useImage(imageUrl, title, {
    optimize: true,
    preload: false,
  });





  const handleCreateAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCreateAlert) return;
    
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ProductCard passing to modal:', {
        productId: id,
        productTitle: title,
        price: price,
        targetPrice: targetPrice
      });
    }
    
    onCreateAlert(product);
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onViewProduct || !url) return;
    onViewProduct(url);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4 w-full max-w-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 text-xs font-bold text-white bg-pink-500 rounded-full">
            DealPop
          </span>
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
        <div className="mb-3">
          <div className="mb-2">
            <p className="text-xs text-gray-500">Current Price {formatPrice(price)}</p>
          </div>
          {targetPrice && (
            <div>
              <p className="text-xs text-gray-500">Target Price {formatPrice(targetPrice)}</p>
            </div>
          )}
        </div>

        {/* Create/Edit Alert and View Product Buttons */}
        <div className="flex space-x-2 relative z-20">
          {onCreateAlert && (
            <button
              onClick={handleCreateAlert}
              className="flex-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Edit Alert
            </button>
          )}
          {onViewProduct && url && (
            <button
              onClick={handleViewProduct}
              className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Go to Site
            </button>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="mt-2">
          <StatusBadge status={status} size="sm" />
        </div>
      </div>
    </>
  );
}
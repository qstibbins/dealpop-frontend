import { useState } from 'react';
import { useImage } from '../hooks/useImage';
import ConfirmDialog from './ui/ConfirmDialog';

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
  onEdit?: (product: any) => void;
  onDelete?: (id: string) => void;
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
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { imageState, currentImageUrl, retry } = useImage(imageUrl, title, {
    optimize: true,
    preload: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tracking':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onEdit) return;
    
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
    onEdit(product);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4 w-full max-w-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {extractedAt && (
            <span className="text-xs text-gray-500">
              {formatDate(extractedAt)}
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
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-bold text-green-600">${price}</p>
          {targetPrice && (
            <p className="text-sm text-gray-500">
              Target: ${targetPrice}
            </p>
          )}
        </div>
        
        {expiresIn && (
          <p className="text-xs text-gray-400 mb-2">
            Tracker ends in {expiresIn}
          </p>
        )}
        
        {url && (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline block truncate mb-3"
          >
            View Original
          </a>
        )}

        {/* Edit and Delete Buttons */}
        <div className="flex space-x-2 relative z-20">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="flex-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
import React from 'react';
import { useImage } from '../hooks/useImage';
import { ImageService } from '../services/imageService';

const ImageTest: React.FC = () => {
  const testCases = [
    {
      name: 'Valid Image URL',
      imageUrl: 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Test+Image',
      productName: 'Test Product'
    },
    {
      name: 'Empty Image URL',
      imageUrl: '',
      productName: 'Laptop Computer'
    },
    {
      name: 'Invalid Image URL',
      imageUrl: 'invalid-url',
      productName: 'Wireless Headphones'
    },
    {
      name: 'Relative Path',
      imageUrl: '/img/laptop.png',
      productName: 'Desktop PC'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Image Handling Test</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testCases.map((testCase, index) => (
          <ImageTestCard key={index} {...testCase} />
        ))}
      </div>
    </div>
  );
};

interface ImageTestCardProps {
  name: string;
  imageUrl: string;
  productName: string;
}

const ImageTestCard: React.FC<ImageTestCardProps> = ({ name, imageUrl, productName }) => {
  const { imageState, currentImageUrl, retry } = useImage(imageUrl, productName);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-2">Product: {productName}</p>
      <p className="text-xs text-gray-500 mb-2">URL: {imageUrl || '(empty)'}</p>
      
      <div className="h-32 w-full relative bg-gray-100 rounded-lg overflow-hidden mb-2">
        {imageState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {imageState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Error</p>
              <button 
                onClick={retry}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <img 
          src={currentImageUrl} 
          alt={productName} 
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      
      <div className="text-xs">
        <p>State: <span className={`font-medium ${
          imageState === 'loaded' ? 'text-green-600' : 
          imageState === 'loading' ? 'text-blue-600' : 'text-red-600'
        }`}>{imageState}</span></p>
        <p className="truncate">Current URL: {currentImageUrl}</p>
      </div>
    </div>
  );
};

export default ImageTest; 
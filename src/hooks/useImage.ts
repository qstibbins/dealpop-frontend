import { useState, useEffect } from 'react';
import { ImageService } from '../services/imageService';

interface UseImageOptions {
  fallbackImage?: string;
  optimize?: boolean;
  preload?: boolean;
}

interface UseImageReturn {
  imageState: 'loading' | 'loaded' | 'error';
  currentImageUrl: string;
  error: string | null;
  retry: () => void;
}

export function useImage(
  imageUrl: string, 
  productName: string, 
  options: UseImageOptions = {}
): UseImageReturn {
  const { fallbackImage, optimize = true, preload = false } = options;
  
  console.log(`useImage called for "${productName}" with URL: "${imageUrl}"`);
  
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentImageUrl, setCurrentImageUrl] = useState(() => {
    // Use the imageUrl directly or fallback
    const finalUrl = imageUrl || ImageService.getFallbackImage(productName);
    console.log(`Initial URL for "${productName}": "${finalUrl}"`);
    return finalUrl;
  });
  const [error, setError] = useState<string | null>(null);

  const loadImage = async (url: string) => {
    console.log(`loadImage called for "${productName}" with URL: "${url}"`);
    setImageState('loading');
    setError(null);

    try {
      // If URL is empty or invalid, use fallback immediately
      if (!url || url.trim() === '') {
        console.log(`Empty URL for "${productName}", using fallback`);
        const fallback = fallbackImage || ImageService.getFallbackImage(productName);
        setCurrentImageUrl(fallback);
        loadImage(fallback);
        return;
      }

      // Create a new image element
      const img = new Image();
      img.onload = () => {
        console.log(`Image loaded successfully for "${productName}": "${url}"`);
        setImageState('loaded');
        setError(null);
      };
      img.onerror = () => {
        console.warn(`Failed to load image for "${productName}": "${url}"`);
        const fallback = fallbackImage || ImageService.getFallbackImage(productName);
        if (url !== fallback) {
          console.log(`Trying fallback for "${productName}": "${fallback}"`);
          setCurrentImageUrl(fallback);
          loadImage(fallback);
        } else {
          console.error(`Fallback also failed for "${productName}": "${fallback}"`);
          setImageState('error');
          setError('Failed to load image');
        }
      };
      console.log(`Setting img.src for "${productName}": "${url}"`);
      img.src = url;
    } catch (err) {
      console.error(`Error loading image for "${productName}": "${url}"`, err);
      const fallback = fallbackImage || ImageService.getFallbackImage(productName);
      if (url !== fallback) {
        setCurrentImageUrl(fallback);
        loadImage(fallback);
      } else {
        setImageState('error');
        setError(err instanceof Error ? err.message : 'Failed to load image');
      }
    }
  };

  const retry = () => {
    loadImage(currentImageUrl);
  };

  // Load image when component mounts or URL changes
  useEffect(() => {
    loadImage(currentImageUrl);
  }, [currentImageUrl]);

  return {
    imageState,
    currentImageUrl,
    error,
    retry,
  };
} 
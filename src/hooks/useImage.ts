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
  
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentImageUrl, setCurrentImageUrl] = useState(() => {
    if (optimize) {
      return ImageService.getProductCardImage(imageUrl, productName);
    }
    return imageUrl || ImageService.getFallbackImage(productName);
  });
  const [error, setError] = useState<string | null>(null);

  const getOptimizedUrl = (url: string) => {
    if (!url) return ImageService.getFallbackImage(productName);
    if (optimize) {
      return ImageService.getProductCardImage(url, productName);
    }
    return url;
  };

  const loadImage = async (url: string) => {
    setImageState('loading');
    setError(null);

    try {
      if (preload) {
        await ImageService.preloadImage(url);
      }
      
      // Simulate image loading for better UX
      const img = new Image();
      img.onload = () => {
        setImageState('loaded');
        setError(null);
      };
      img.onerror = () => {
        const fallback = fallbackImage || ImageService.getFallbackImage(productName);
        if (url !== fallback) {
          setCurrentImageUrl(fallback);
          loadImage(fallback);
        } else {
          setImageState('error');
          setError('Failed to load image');
        }
      };
      img.src = url;
    } catch (err) {
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

  useEffect(() => {
    const optimizedUrl = getOptimizedUrl(imageUrl);
    if (optimizedUrl !== currentImageUrl) {
      setCurrentImageUrl(optimizedUrl);
      loadImage(optimizedUrl);
    }
  }, [imageUrl, productName, optimize]);

  return {
    imageState,
    currentImageUrl,
    error,
    retry,
  };
} 
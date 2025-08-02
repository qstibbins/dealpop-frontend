import { useState, useEffect, useCallback } from 'react';
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
    // Use the imageUrl directly or fallback
    const finalUrl = imageUrl || ImageService.getFallbackImage(productName);
    return finalUrl;
  });
  const [error, setError] = useState<string | null>(null);

  const loadImage = useCallback(async (url: string) => {
    setImageState('loading');
    setError(null);

    try {
      // If URL is empty or invalid, use fallback immediately
      if (!url || url.trim() === '') {
        const fallback = fallbackImage || ImageService.getFallbackImage(productName);
        setCurrentImageUrl(fallback);
        return;
      }

      // Create a new image element
      const img = new Image();
      img.onload = () => {
        setImageState('loaded');
        setError(null);
      };
      img.onerror = () => {
        console.warn(`Failed to load image for "${productName}": "${url}"`);
        const fallback = fallbackImage || ImageService.getFallbackImage(productName);
        if (url !== fallback) {
          setCurrentImageUrl(fallback);
        } else {
          setImageState('error');
          setError('Failed to load image');
        }
      };
      img.src = url;
    } catch (err) {
      console.error(`Error loading image for "${productName}": "${url}"`, err);
      const fallback = fallbackImage || ImageService.getFallbackImage(productName);
      if (url !== fallback) {
        setCurrentImageUrl(fallback);
      } else {
        setImageState('error');
        setError(err instanceof Error ? err.message : 'Failed to load image');
      }
    }
  }, [productName, fallbackImage]);

  const retry = useCallback(() => {
    loadImage(currentImageUrl);
  }, [loadImage, currentImageUrl]);

  // Load image when component mounts or imageUrl changes
  useEffect(() => {
    const finalUrl = imageUrl || ImageService.getFallbackImage(productName);
    setCurrentImageUrl(finalUrl);
    loadImage(finalUrl);
  }, [imageUrl, productName, loadImage]);

  return {
    imageState,
    currentImageUrl,
    error,
    retry,
  };
} 
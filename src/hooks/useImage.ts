import { useState, useEffect, useCallback } from 'react';

interface UseImageReturn {
  imageState: 'loading' | 'loaded' | 'error';
  currentImageUrl: string;
  error: string | null;
  retry: () => void;
}

export function useImage(
  imageUrl: string, 
  productName: string
): UseImageReturn {
  
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentImageUrl, setCurrentImageUrl] = useState(() => {
    // Use the imageUrl directly if it exists
    return imageUrl || '';
  });
  const [error, setError] = useState<string | null>(null);

  const loadImage = useCallback(async (url: string) => {
    setImageState('loading');
    setError(null);

    console.log(`🔍 useImage: Loading image for "${productName}": "${url}"`);

    try {
      // If URL is empty or invalid, use fallback immediately
      if (!url || url.trim() === '') {
        console.log(`🔍 useImage: Empty URL, using fallback for "${productName}"`);
        const fallback = 'img/icon.png';
        setCurrentImageUrl(fallback);
        return;
      }

      // Create a new image element
      const img = new Image();
      img.onload = () => {
        console.log(`🔍 useImage: Successfully loaded image for "${productName}": "${url}"`);
        setImageState('loaded');
        setError(null);
      };
      img.onerror = () => {
        console.warn(`🔍 useImage: Failed to load image for "${productName}": "${url}"`);
        const fallback = 'img/icon.png';
        console.log(`🔍 useImage: Using fallback for "${productName}": "${fallback}"`);
        if (url !== fallback) {
          setCurrentImageUrl(fallback);
        } else {
          setImageState('error');
          setError('Failed to load image');
        }
      };
      img.src = url;
    } catch (err) {
      console.error(`🔍 useImage: Error loading image for "${productName}": "${url}"`, err);
      const fallback = 'img/icon.png';
      if (url !== fallback) {
        setCurrentImageUrl(fallback);
      } else {
        setImageState('error');
        setError(err instanceof Error ? err.message : 'Failed to load image');
      }
    }
  }, [productName]);

  const retry = useCallback(() => {
    loadImage(currentImageUrl);
  }, [loadImage, currentImageUrl]);

  // Load image when component mounts or imageUrl changes
  useEffect(() => {
    const finalUrl = imageUrl || '';
    setCurrentImageUrl(finalUrl);
    if (finalUrl) {
      loadImage(finalUrl);
    } else {
      // Only use fallback if no imageUrl provided
      const fallback = 'img/icon.png';
      setCurrentImageUrl(fallback);
    }
  }, [imageUrl, productName, loadImage]);

  return {
    imageState,
    currentImageUrl,
    error,
    retry,
  };
} 
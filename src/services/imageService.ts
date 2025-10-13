export interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class ImageService {

  /**
   * Optimize image URL for better performance
   */
  static optimizeImageUrl(imageUrl: string, config: ImageConfig = {}): string {
    if (!imageUrl || imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    // For relative paths, return as-is (no optimization needed for local images)
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    try {
      const url = new URL(imageUrl);
      
      // Add optimization parameters if supported by the image service
      if (config.width) {
        url.searchParams.set('w', config.width.toString());
      }
      if (config.height) {
        url.searchParams.set('h', config.height.toString());
      }
      if (config.quality) {
        url.searchParams.set('q', config.quality.toString());
      }
      if (config.format) {
        url.searchParams.set('fm', config.format);
      }
      
      return url.toString();
    } catch {
      // If URL parsing fails, return original URL
      return imageUrl;
    }
  }

  /**
   * Preload image for better UX
   */
  static preloadImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  }

  /**
   * Check if image URL is valid
   */
  static isValidImageUrl(imageUrl: string): boolean {
    if (!imageUrl) return false;
    
    // Handle relative paths (starting with /)
    if (imageUrl.startsWith('/')) {
      return true;
    }
    
    // Handle data URLs
    if (imageUrl.startsWith('data:')) {
      return true;
    }
    
    // Handle absolute URLs
    try {
      const url = new URL(imageUrl);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Get optimized image URL for product cards
   */
  static getProductCardImage(imageUrl: string): string {
    if (!this.isValidImageUrl(imageUrl)) {
      return 'img/icon.png';
    }

    const optimizedUrl = this.optimizeImageUrl(imageUrl, {
      width: 320,
      height: 320,
      quality: 80,
      format: 'webp'
    });
    
    return optimizedUrl;
  }

} 
export interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class ImageService {
  private static readonly FALLBACK_IMAGES = {
    laptop: 'img/laptop.png',
    headphones: 'img/headphones.png',
    sofa: 'img/sofa.png',
    watch: 'img/watch.png',
    skincare: 'img/skincare.png',
    powerbank: 'img/powerbank.png',
    mixer: 'img/mixer.png',
  };

  /**
   * Get fallback image based on product name
   */
  static getFallbackImage(productName: string): string {
    const title = productName.toLowerCase();
    const baseUrl = import.meta.env.BASE_URL;
    
    if (title.includes('laptop') || title.includes('computer') || title.includes('pc')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.laptop}`;
    } else if (title.includes('headphone') || title.includes('audio') || title.includes('speaker')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.headphones}`;
    } else if (title.includes('sofa') || title.includes('chair') || title.includes('furniture')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.sofa}`;
    } else if (title.includes('watch') || title.includes('smartwatch')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.watch}`;
    } else if (title.includes('skincare') || title.includes('beauty') || title.includes('cosmetic')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.skincare}`;
    } else if (title.includes('power') || title.includes('battery') || title.includes('charger')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.powerbank}`;
    } else if (title.includes('mixer') || title.includes('blender') || title.includes('kitchen')) {
      return `${baseUrl}${this.FALLBACK_IMAGES.mixer}`;
    } else {
      // Default fallback
      return `${baseUrl}${this.FALLBACK_IMAGES.laptop}`;
    }
  }

  /**
   * Optimize image URL for better performance
   */
  static optimizeImageUrl(imageUrl: string, config: ImageConfig = {}): string {
    if (!imageUrl || imageUrl.startsWith('data:')) {
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
    
    try {
      const url = new URL(imageUrl);
      return ['http:', 'https:', 'data:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Get optimized image URL for product cards
   */
  static getProductCardImage(imageUrl: string, productName: string): string {
    if (!this.isValidImageUrl(imageUrl)) {
      return this.getFallbackImage(productName);
    }

    return this.optimizeImageUrl(imageUrl, {
      width: 320,
      height: 320,
      quality: 80,
      format: 'webp'
    });
  }

  /**
   * Get optimized image URL for product detail pages
   */
  static getProductDetailImage(imageUrl: string, productName: string): string {
    if (!this.isValidImageUrl(imageUrl)) {
      return this.getFallbackImage(productName);
    }

    return this.optimizeImageUrl(imageUrl, {
      width: 600,
      height: 600,
      quality: 90,
      format: 'webp'
    });
  }
} 
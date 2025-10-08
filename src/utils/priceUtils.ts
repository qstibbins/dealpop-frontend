export interface PriceData {
  currentPrice: number;
  targetPrice?: number;
  previousPrice?: number;
  originalPrice?: number;
}

export interface PriceComparison {
  savings: number;
  savingsPercentage: number;
  priceChange: number;
  priceChangePercentage: number;
  isDeal: boolean;
  isPriceDropping: boolean;
  isPriceRising: boolean;
}

export interface PriceTrend {
  direction: 'up' | 'down' | 'stable';
  change: number;
  percentage: number;
  period: string;
}

/**
 * Extract numeric price from string or number (removes currency symbols, commas, etc.)
 */
export function extractPrice(priceString: string | number): number {
  if (typeof priceString === 'number') {
    return priceString;
  }
  if (typeof priceString !== 'string') {
    return 0;
  }
  const numericPrice = priceString.replace(/[^0-9.]/g, '');
  return parseFloat(numericPrice) || 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate price comparison data
 */
export function calculatePriceComparison(data: PriceData): PriceComparison {
  const current = data.currentPrice;
  const target = data.targetPrice || 0;
  const previous = data.previousPrice || current;
  // const original = data.originalPrice || current;

  const savings = target > 0 ? target - current : 0;
  const savingsPercentage = target > 0 ? ((target - current) / target) * 100 : 0;
  const priceChange = current - previous;
  const priceChangePercentage = previous > 0 ? (priceChange / previous) * 100 : 0;

  return {
    savings: Math.max(0, savings),
    savingsPercentage: Math.max(0, savingsPercentage),
    priceChange,
    priceChangePercentage,
    isDeal: target > 0 && current <= target,
    isPriceDropping: priceChange < 0,
    isPriceRising: priceChange > 0,
  };
}

/**
 * Get price trend information
 */
export function getPriceTrend(
  currentPrice: number,
  previousPrice: number,
  period: string = 'recent'
): PriceTrend {
  const change = currentPrice - previousPrice;
  const percentage = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

  let direction: 'up' | 'down' | 'stable';
  if (Math.abs(percentage) < 0.1) {
    direction = 'stable';
  } else if (change > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  return {
    direction,
    change: Math.abs(change),
    percentage: Math.abs(percentage),
    period,
  };
}

/**
 * Get trend icon based on direction
 */
export function getTrendIcon(direction: 'up' | 'down' | 'stable'): string {
  switch (direction) {
    case 'up':
      return '↗️';
    case 'down':
      return '↘️';
    case 'stable':
      return '→';
    default:
      return '→';
  }
}

/**
 * Get color class based on price change
 */
export function getPriceChangeColor(change: number): string {
  if (change < 0) return 'text-green-600'; // Price dropped (good)
  if (change > 0) return 'text-red-600';   // Price increased (bad)
  return 'text-gray-600';                  // No change
}

/**
 * Get savings color class
 */
export function getSavingsColor(savings: number): string {
  if (savings > 0) return 'text-green-600';
  return 'text-gray-600';
}

/**
 * Format savings message
 */
export function formatSavingsMessage(savings: number, percentage: number): string {
  if (savings <= 0) return 'No savings';
  
  const savingsText = formatPrice(savings);
  const percentageText = percentage.toFixed(1);
  
  return `Save ${savingsText} (${percentageText}%)`;
}

/**
 * Format price change message
 */
export function formatPriceChangeMessage(change: number, percentage: number): string {
  const changeText = formatPrice(Math.abs(change));
  const percentageText = percentage.toFixed(1);
  
  if (change < 0) {
    return `↓ ${changeText} (${percentageText}%)`;
  } else if (change > 0) {
    return `↑ ${changeText} (${percentageText}%)`;
  }
  
  return 'No change';
} 
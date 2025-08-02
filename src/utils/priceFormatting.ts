/**
 * Utility functions for consistent price formatting across the application
 */

/**
 * Formats a price value to always show exactly 2 decimal places
 * @param price - The price value (can be number or string)
 * @returns Formatted price string with dollar sign and 2 decimal places
 */
export const formatPrice = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]/g, '')) : price;
  
  if (isNaN(numericPrice)) {
    return '$0.00';
  }
  
  return `$${numericPrice.toFixed(2)}`;
};

/**
 * Formats a price value without the dollar sign, ensuring 2 decimal places
 * @param price - The price value (can be number or string)
 * @returns Formatted price string with 2 decimal places (no dollar sign)
 */
export const formatPriceValue = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]/g, '')) : price;
  
  if (isNaN(numericPrice)) {
    return '0.00';
  }
  
  return numericPrice.toFixed(2);
};

/**
 * Formats a percentage value to 1 decimal place
 * @param percentage - The percentage value
 * @returns Formatted percentage string with 1 decimal place
 */
export const formatPercentage = (percentage: number): string => {
  return percentage.toFixed(1);
}; 
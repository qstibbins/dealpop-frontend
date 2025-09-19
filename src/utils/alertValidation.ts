/**
 * Alert validation utilities
 * This can be used on both frontend and backend for consistent validation
 */

export interface AlertValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AlertValidationResult {
  isValid: boolean;
  errors: AlertValidationError[];
}

/**
 * Validates target price against current price
 */
export function validateTargetPrice(targetPrice: number, currentPrice: number): AlertValidationResult {
  const errors: AlertValidationError[] = [];

  if (isNaN(targetPrice) || targetPrice <= 0) {
    errors.push({
      field: 'targetPrice',
      message: 'Target price must be a valid positive number',
      code: 'INVALID_TARGET_PRICE'
    });
  }

  if (targetPrice >= currentPrice) {
    errors.push({
      field: 'targetPrice',
      message: 'Target price must be less than the current price',
      code: 'TARGET_PRICE_TOO_HIGH'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a complete alert object
 */
export function validateAlert(alertData: {
  targetPrice: number;
  currentPrice: number;
  productName?: string;
  productUrl?: string;
}): AlertValidationResult {
  const errors: AlertValidationError[] = [];

  // Validate target price
  const targetPriceValidation = validateTargetPrice(alertData.targetPrice, alertData.currentPrice);
  errors.push(...targetPriceValidation.errors);

  // Validate product name
  if (!alertData.productName || alertData.productName.trim().length === 0) {
    errors.push({
      field: 'productName',
      message: 'Product name is required',
      code: 'MISSING_PRODUCT_NAME'
    });
  }

  // Validate product URL
  if (!alertData.productUrl || alertData.productUrl.trim().length === 0) {
    errors.push({
      field: 'productUrl',
      message: 'Product URL is required',
      code: 'MISSING_PRODUCT_URL'
    });
  } else {
    try {
      new URL(alertData.productUrl);
    } catch {
      errors.push({
        field: 'productUrl',
        message: 'Product URL must be a valid URL',
        code: 'INVALID_PRODUCT_URL'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats validation errors for API responses
 */
export function formatValidationErrors(errors: AlertValidationError[]): {
  error: {
    message: string;
    code: string;
    details: AlertValidationError[];
  };
} {
  return {
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    }
  };
} 
import {
  PriceData,
  extractPrice,
  formatPrice,
  calculatePriceComparison,
  getPriceTrend,
  getTrendIcon,
  getPriceChangeColor,
  getSavingsColor,
  formatSavingsMessage,
  formatPriceChangeMessage,
} from '../utils/priceUtils';

interface PriceDisplayProps {
  currentPrice: string;
  targetPrice?: string;
  previousPrice?: string;
  originalPrice?: string;
  showTrend?: boolean;
  showSavings?: boolean;
  compact?: boolean;
}

export default function PriceDisplay({
  currentPrice,
  targetPrice,
  previousPrice,
  originalPrice,
  showTrend = true,
  showSavings = true,
  compact = false,
}: PriceDisplayProps) {
  const priceData: PriceData = {
    currentPrice: extractPrice(currentPrice),
    targetPrice: targetPrice ? extractPrice(targetPrice) : undefined,
    previousPrice: previousPrice ? extractPrice(previousPrice) : undefined,
    originalPrice: originalPrice ? extractPrice(originalPrice) : undefined,
  };

  const comparison = calculatePriceComparison(priceData);
  const trend = previousPrice ? getPriceTrend(priceData.currentPrice, priceData.previousPrice!) : null;

  if (compact) {
    return (
      <div className="space-y-1">
        {/* Current Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(priceData.currentPrice)}
          </span>
          {comparison.isDeal && (
            <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded-full">
              DEAL
            </span>
          )}
        </div>

        {/* Target Price */}
        {targetPrice && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Target: {formatPrice(priceData.targetPrice!)}</span>
            {showSavings && comparison.savings > 0 && (
              <span className={getSavingsColor(comparison.savings)}>
                Save {formatPrice(comparison.savings)}
              </span>
            )}
          </div>
        )}

        {/* Price Trend */}
        {showTrend && trend && Math.abs(trend.percentage) > 0.1 && (
          <div className="flex items-center text-xs">
            <span className="mr-1">{getTrendIcon(trend.direction)}</span>
            <span className={getPriceChangeColor(comparison.priceChange)}>
              {formatPriceChangeMessage(comparison.priceChange, comparison.priceChangePercentage)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current Price Section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Price</p>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(priceData.currentPrice)}
            </span>
            {comparison.isDeal && (
              <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded-full">
                DEAL
              </span>
            )}
          </div>
        </div>

        {/* Price Trend Indicator */}
        {showTrend && trend && (
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1">
              <span className="text-lg">{getTrendIcon(trend.direction)}</span>
              <span className={`text-sm font-medium ${getPriceChangeColor(comparison.priceChange)}`}>
                {formatPriceChangeMessage(comparison.priceChange, comparison.priceChangePercentage)}
              </span>
            </div>
            <p className="text-xs text-gray-500">vs previous</p>
          </div>
        )}
      </div>

      {/* Target Price and Savings */}
      {targetPrice && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Target Price</p>
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(priceData.targetPrice!)}
            </span>
          </div>
          
          {showSavings && (
            <div className="space-y-1">
              {comparison.savings > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Potential Savings</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatSavingsMessage(comparison.savings, comparison.savingsPercentage)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price Difference</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatPrice(Math.abs(comparison.savings))} above target
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Price History (if available) */}
      {originalPrice && extractPrice(originalPrice) !== priceData.currentPrice && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Original Price</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm line-through text-gray-500">
                {formatPrice(priceData.originalPrice!)}
              </span>
              <span className="text-sm font-medium text-green-600">
                -{formatPrice(priceData.originalPrice! - priceData.currentPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Price Change Visualization */}
      {showTrend && trend && Math.abs(trend.percentage) > 0.1 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Price Trend</p>
            <span className={`text-sm font-bold ${getPriceChangeColor(comparison.priceChange)}`}>
              {getTrendIcon(trend.direction)} {trend.percentage.toFixed(1)}%
            </span>
          </div>
          
          {/* Simple trend bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                comparison.isPriceDropping ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min(Math.abs(trend.percentage) * 2, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 

import Modal from './ui/Modal';
import PriceDisplay from './PriceDisplay';
import PriceTrendChart from './PriceTrendChart';
import {
  extractPrice,
  formatPrice,
  calculatePriceComparison,
  getPriceTrend,
  getTrendIcon,
  getPriceChangeColor,
  getSavingsColor,
} from '../utils/priceUtils';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    currentPrice: string;
    targetPrice?: string;
    previousPrice?: string;
    originalPrice?: string;
    vendor: string;
    url?: string;
  } | null;
}

export default function PriceComparisonModal({
  isOpen,
  onClose,
  product,
}: PriceComparisonModalProps) {
  if (!product) return null;

  const priceData = {
    currentPrice: extractPrice(product.currentPrice),
    targetPrice: product.targetPrice ? extractPrice(product.targetPrice) : undefined,
    previousPrice: product.previousPrice ? extractPrice(product.previousPrice) : undefined,
    originalPrice: product.originalPrice ? extractPrice(product.originalPrice) : undefined,
  };

  const comparison = calculatePriceComparison(priceData);
  const trend = product.previousPrice ? getPriceTrend(priceData.currentPrice, priceData.previousPrice!) : null;

  // Generate price history for chart
  const generatePriceHistory = () => {
    const history = [];
    
    if (product.originalPrice && priceData.originalPrice !== priceData.currentPrice) {
      history.push({
        price: priceData.originalPrice!,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        label: 'Original',
      });
    }
    
    if (product.previousPrice && priceData.previousPrice !== priceData.currentPrice) {
      history.push({
        price: priceData.previousPrice!,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        label: 'Previous',
      });
    }
    
    history.push({
      price: priceData.currentPrice,
      date: new Date().toISOString(),
      label: 'Current',
    });
    
    return history;
  };

  const handleViewProduct = () => {
    if (product.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Price Analysis">
      <div className="space-y-6">
        {/* Product Header */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
          <p className="text-sm text-gray-600">{product.vendor}</p>
        </div>

        {/* Enhanced Price Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <PriceDisplay
            currentPrice={product.currentPrice}
            targetPrice={product.targetPrice}
            previousPrice={product.previousPrice}
            originalPrice={product.originalPrice}
            showTrend={true}
            showSavings={true}
            compact={false}
          />
        </div>

        {/* Price Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Price Card */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Current Price</h4>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(priceData.currentPrice)}
            </div>
            {comparison.isDeal && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Target Reached!
                </span>
              </div>
            )}
          </div>

          {/* Savings Card */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Potential Savings</h4>
            <div className={`text-2xl font-bold ${getSavingsColor(comparison.savings)}`}>
              {formatPrice(comparison.savings)}
            </div>
            {comparison.savings > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {comparison.savingsPercentage.toFixed(1)}% off target
              </div>
            )}
          </div>

          {/* Price Change Card */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Change</h4>
            {trend ? (
              <>
                <div className={`text-2xl font-bold ${getPriceChangeColor(comparison.priceChange)}`}>
                  {getTrendIcon(trend.direction)} {formatPrice(Math.abs(comparison.priceChange))}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {comparison.priceChangePercentage.toFixed(1)}% {comparison.isPriceDropping ? 'decrease' : 'increase'}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">No data</div>
            )}
          </div>
        </div>

        {/* Price Trend Chart */}
        {(product.originalPrice || product.previousPrice) && (
          <PriceTrendChart
            priceHistory={generatePriceHistory()}
            currentPrice={priceData.currentPrice}
            targetPrice={priceData.targetPrice}
          />
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Recommendations</h4>
          <div className="space-y-2">
            {comparison.isDeal ? (
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-sm text-blue-800">
                  Great deal! Current price is at or below your target price.
                </span>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 mt-0.5">⚠</span>
                <span className="text-sm text-blue-800">
                  Price is above target. Consider waiting for a better deal.
                </span>
              </div>
            )}
            
            {trend && comparison.isPriceDropping && (
              <div className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">↓</span>
                <span className="text-sm text-blue-800">
                  Price is trending down. Good time to monitor closely.
                </span>
              </div>
            )}
            
            {trend && comparison.isPriceRising && (
              <div className="flex items-start space-x-2">
                <span className="text-red-600 mt-0.5">↑</span>
                <span className="text-sm text-blue-800">
                  Price is trending up. Consider setting a price alert.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={handleViewProduct}
            disabled={!product.url}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            View Product
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
} 

import { formatPrice, extractPrice, calculatePriceComparison } from '../utils/priceUtils';

interface Product {
  id: string;
  title: string;
  price: string;
  targetPrice?: string;
  previousPrice?: string;
  originalPrice?: string;
  status: 'tracking' | 'paused' | 'completed';
}

interface PriceSummaryProps {
  products: Product[];
  className?: string;
}

export default function PriceSummary({ products, className = '' }: PriceSummaryProps) {
  const calculateStats = () => {
    let totalSavings = 0;
    let totalPotentialSavings = 0;
    let dealsCount = 0;
    let priceDropsCount = 0;
    let priceIncreasesCount = 0;
    let totalProducts = products.length;
    let trackingProducts = products.filter(p => p.status === 'tracking').length;

    products.forEach(product => {
      const priceData = {
        currentPrice: extractPrice(product.price),
        targetPrice: product.targetPrice ? extractPrice(product.targetPrice) : undefined,
        previousPrice: product.previousPrice ? extractPrice(product.previousPrice) : undefined,
        originalPrice: product.originalPrice ? extractPrice(product.originalPrice) : undefined,
      };

      const comparison = calculatePriceComparison(priceData);

      // Calculate savings from original price
      if (product.originalPrice && priceData.originalPrice !== priceData.currentPrice) {
        totalSavings += priceData.originalPrice! - priceData.currentPrice;
      }

      // Calculate potential savings from target price
      if (product.targetPrice && comparison.savings > 0) {
        totalPotentialSavings += comparison.savings;
        dealsCount++;
      }

      // Count price changes
      if (comparison.isPriceDropping) {
        priceDropsCount++;
      } else if (comparison.isPriceRising) {
        priceIncreasesCount++;
      }
    });

    return {
      totalSavings,
      totalPotentialSavings,
      dealsCount,
      priceDropsCount,
      priceIncreasesCount,
      totalProducts,
      trackingProducts,
    };
  };

  const stats = calculateStats();

  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Total Saved</p>
              <p className="text-2xl font-bold text-green-900">{formatPrice(stats.totalSavings)}</p>
            </div>
          </div>
        </div>

        {/* Potential Savings */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Potential Savings</p>
              <p className="text-2xl font-bold text-blue-900">{formatPrice(stats.totalPotentialSavings)}</p>
            </div>
          </div>
        </div>

        {/* Deals Count */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Active Deals</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.dealsCount}</p>
            </div>
          </div>
        </div>

        {/* Tracking Products */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Tracking</p>
              <p className="text-2xl font-bold text-purple-900">{stats.trackingProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Trends Summary */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Trends</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Price Drops</span>
            <span className="text-sm font-semibold text-green-600">{stats.priceDropsCount}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Price Increases</span>
            <span className="text-sm font-semibold text-red-600">{stats.priceIncreasesCount}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Stable Prices</span>
            <span className="text-sm font-semibold text-gray-600">
              {stats.totalProducts - stats.priceDropsCount - stats.priceIncreasesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Savings Progress */}
      {stats.totalPotentialSavings > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Savings Progress</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Achieved</span>
              <span className="font-medium text-green-600">{formatPrice(stats.totalSavings)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((stats.totalSavings / (stats.totalSavings + stats.totalPotentialSavings)) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Potential</span>
              <span className="font-medium text-blue-600">{formatPrice(stats.totalPotentialSavings)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
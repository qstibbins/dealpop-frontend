import { formatPrice } from '../utils/priceUtils';

interface PricePoint {
  price: number;
  date: string;
  label: string;
}

interface PriceTrendChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
  targetPrice?: number;
  className?: string;
}

export default function PriceTrendChart({
  priceHistory,
  currentPrice,
  targetPrice,
  className = '',
}: PriceTrendChartProps) {
  if (priceHistory.length < 2) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>Insufficient price history data</p>
      </div>
    );
  }

  // Sort price history by date
  const sortedHistory = [...priceHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate chart dimensions
  const prices = sortedHistory.map(p => p.price);
  const minPrice = Math.min(...prices, currentPrice, targetPrice || currentPrice);
  const maxPrice = Math.max(...prices, currentPrice, targetPrice || currentPrice);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // 10% padding

  // Chart dimensions
  const chartHeight = 200;
  const chartWidth = 100;
  const effectiveMinPrice = minPrice - padding;
  const effectiveMaxPrice = maxPrice + padding;
  const effectivePriceRange = effectiveMaxPrice - effectiveMinPrice;

  // Convert price to Y coordinate
  const priceToY = (price: number) => {
    return chartHeight - ((price - effectiveMinPrice) / effectivePriceRange) * chartHeight;
  };

  // Generate SVG path for price line
  const generatePricePath = () => {
    const points = sortedHistory.map((point, index) => {
      const x = (index / (sortedHistory.length - 1)) * chartWidth;
      const y = priceToY(point.price);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate target price line
  const targetLine = targetPrice ? (
    <line
      x1="0"
      y1={priceToY(targetPrice)}
      x2={chartWidth}
      y2={priceToY(targetPrice)}
      stroke="#3B82F6"
      strokeWidth="2"
      strokeDasharray="5,5"
      opacity="0.7"
    />
  ) : null;

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Price Trend</h4>
      
      <div className="relative">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Price line */}
          <path
            d={generatePricePath()}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Target price line */}
          {targetLine}

          {/* Price points */}
          {sortedHistory.map((point, index) => {
            const x = (index / (sortedHistory.length - 1)) * chartWidth;
            const y = priceToY(point.price);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#10B981"
                stroke="white"
                strokeWidth="1"
              />
            );
          })}

          {/* Current price indicator */}
          <circle
            cx={chartWidth}
            cy={priceToY(currentPrice)}
            r="4"
            fill="#EF4444"
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        {/* Price labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatPrice(effectiveMinPrice)}</span>
          <span>{formatPrice(effectiveMaxPrice)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Price History</span>
        </div>
        {targetPrice && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-500 border-dashed"></div>
            <span className="text-gray-600">Target Price</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Current Price</span>
        </div>
      </div>

      {/* Price change summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Lowest:</span>
            <span className="ml-2 font-medium">{formatPrice(minPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Highest:</span>
            <span className="ml-2 font-medium">{formatPrice(maxPrice)}</span>
          </div>
        </div>
        
        {targetPrice && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500">Target:</span>
            <span className="ml-2 font-medium text-blue-600">{formatPrice(targetPrice)}</span>
            <span className={`ml-2 ${currentPrice <= targetPrice ? 'text-green-600' : 'text-red-600'}`}>
              ({currentPrice <= targetPrice ? 'Target reached' : 'Above target'})
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 
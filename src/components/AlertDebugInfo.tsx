
import { useState } from 'react';

interface AlertDebugInfoProps {
  products: any[];
  alerts: any[];
  isVisible?: boolean;
}

export default function AlertDebugInfo({ products, alerts, isVisible = false }: AlertDebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed state - just a small toggle button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-black bg-opacity-90 text-white p-2 rounded-lg text-xs font-bold hover:bg-opacity-100 transition-all"
          title="Show Debug Info"
        >
          🔍 Debug
        </button>
      )}

      {/* Expanded state - full debug info */}
      {isExpanded && (
        <div className="bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">🔍 Alert Debug Info</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:text-gray-300 text-lg leading-none"
              title="Hide Debug Info"
            >
              ×
            </button>
          </div>
          
          <div className="mb-2">
            <strong>Products ({products.length}):</strong>
            {products.slice(0, 3).map(product => (
              <div key={product.id} className="ml-2">
                • {product.title} (ID: {product.id}, Type: {typeof product.id})
              </div>
            ))}
            {products.length > 3 && <div className="ml-2">... and {products.length - 3} more</div>}
          </div>
          
          <div className="mb-2">
            <strong>Alerts ({alerts.length}):</strong>
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="ml-2">
                • {alert.productName} (ProductID: {alert.productId}, Status: {alert.status})
              </div>
            ))}
            {alerts.length > 3 && <div className="ml-2">... and {alerts.length - 3} more</div>}
          </div>
          
          <div>
            <strong>Active Alerts:</strong> {alerts.filter(a => a.status === 'active').length}
          </div>
        </div>
      )}
    </div>
  );
} 
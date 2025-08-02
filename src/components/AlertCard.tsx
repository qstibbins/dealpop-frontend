import { useState } from 'react';
import { Alert } from '../types/alerts';
import { useAlerts } from '../contexts/AlertContext';
import ConfirmDialog from './ui/ConfirmDialog';
import StatusBadge from './ui/StatusBadge';

interface AlertCardProps {
  alert: Alert;
  onEdit?: (alert: Alert) => void;
}

export default function AlertCard({ alert, onEdit }: AlertCardProps) {
  const { deleteAlert, dismissAlert } = useAlerts();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return '📉';
      case 'price_increase':
        return '📈';
      case 'stock_alert':
        return '📦';
      case 'expiry_alert':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleDismiss = async () => {
    try {
      await dismissAlert(alert.id);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAlert(alert.id);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const priceDifference = alert.currentPrice - alert.targetPrice;
  const priceDifferencePercentage = (priceDifference / alert.currentPrice) * 100;

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getAlertTypeIcon(alert.alertType)}</span>
            <StatusBadge status={alert.status} size="sm" />
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(alert.createdAt)}
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={alert.productImage} 
            alt={alert.productName} 
            className="h-16 w-16 object-contain rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2">{alert.productName}</h3>
            <a 
              href={alert.productUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              View Product
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">Current Price</p>
            <p className="font-semibold text-green-600">{formatPrice(alert.currentPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target Price</p>
            <p className="font-semibold text-blue-600">{formatPrice(alert.targetPrice)}</p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500">Price Drop Needed</p>
          <p className="font-semibold text-red-600">
            {formatPrice(Math.abs(priceDifference))} ({priceDifferencePercentage.toFixed(1)}%)
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Last checked: {formatDate(alert.lastCheckedAt)}</span>
          {alert.expiresAt && (
            <span>Expires: {formatDate(alert.expiresAt)}</span>
          )}
        </div>

        <div className="flex space-x-2">
          {alert.status === 'triggered' && (
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Dismiss
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(alert)}
              className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Alert"
        message={`Are you sure you want to delete the alert for "${alert.productName}"? This action cannot be undone.`}
        confirmText="Delete Alert"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
} 
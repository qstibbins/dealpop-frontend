import React, { useState, useEffect } from 'react';
import { Alert } from '../types/alerts';
import { useAlerts } from '../contexts/AlertContext';
import Modal from './ui/Modal';
import { validateTargetPrice } from '../utils/alertValidation';
import { formatPrice } from '../utils/priceFormatting';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData?: {
    id: string;
    name: string;
    url: string;
    image: string;
    currentPrice: number;
    targetPrice?: string; // Add targetPrice from database
  };
  existingAlert?: Alert;
}

export default function CreateAlertModal({ isOpen, onClose, productData, existingAlert }: CreateAlertModalProps) {
  const { createAlert, updateAlert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetPrice: productData?.currentPrice ? (productData.currentPrice * 0.9).toFixed(2) : '',
    alertType: 'price_drop' as Alert['alertType'],
    trackingPeriod: '30' as string,
    status: 'active' as Alert['status'],
  });

  // Validation function using the utility
  const validateTargetPriceInput = (targetPrice: string, currentPrice: number) => {
    const target = parseFloat(targetPrice);
    const validation = validateTargetPrice(target, currentPrice);
    return validation.isValid ? null : validation.errors[0]?.message || 'Invalid target price';
  };

  // Initialize form with existing alert data if editing
  useEffect(() => {
    if (existingAlert && productData) {
      setFormData({
        targetPrice: productData.targetPrice || existingAlert.targetPrice.toString(),
        alertType: existingAlert.alertType,
        trackingPeriod: '30', // Default to 30 days for existing alerts
        status: existingAlert.status,
      });
      // Clear validation error when editing existing alert
      setValidationError(null);
    }
  }, [existingAlert, productData]);

  // Update form data when productData changes (for new alerts)
  useEffect(() => {
    if (productData && !existingAlert) {
      // Use target price from database if available, otherwise calculate default
      const targetPriceFromDatabase = productData.targetPrice;
      const calculatedTargetPrice = productData.currentPrice ? (productData.currentPrice * 0.9).toFixed(2) : '';
      const finalTargetPrice = targetPriceFromDatabase || calculatedTargetPrice;
      
      if (import.meta.env.DEV) {
        console.log('🔍 CreateAlertModal price calculation:', {
          productName: productData.name,
          currentPrice: productData.currentPrice,
          targetPriceFromDatabase: targetPriceFromDatabase,
          calculatedTargetPrice: calculatedTargetPrice,
          finalTargetPrice: finalTargetPrice
        });
      }
      setFormData({
        targetPrice: finalTargetPrice,
        alertType: 'price_drop' as Alert['alertType'],
        trackingPeriod: '30',
        status: 'active' as Alert['status'],
      });
      // Clear validation error when product data changes
      setValidationError(null);
    }
  }, [productData, existingAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productData) return;

    // Validate target price before submission
    const currentPrice = productData.currentPrice;
    
    const error = validateTargetPriceInput(formData.targetPrice, currentPrice);
    if (error) {
      setValidationError(error);
      return;
    }

    setLoading(true);
    try {
      if (existingAlert) {
        // Update existing tracked product
        await updateAlert(existingAlert.productId.toString(), {
          targetPrice: parseFloat(formData.targetPrice),
          alertType: formData.alertType,
          status: formData.status,
        });
      } else {
        // Create new alert
        await createAlert({
          productId: productData.id,
          productName: productData.name,
          productUrl: productData.url,
          productImage: productData.image,
          currentPrice: productData.currentPrice,
          targetPrice: parseFloat(formData.targetPrice),
          alertType: formData.alertType,
          status: 'active',
          notificationPreferences: {
            email: true,
            push: true,
            sms: false
          },
          thresholds: {
            priceDropPercentage: 10,
            absolutePriceDrop: 10,
          },
          expiresAt: new Date(Date.now() + parseInt(formData.trackingPeriod) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save alert:', error);
      // Handle API validation errors
      if (error instanceof Error && error.message.includes('Target price')) {
        setValidationError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingAlert ? "Update Price Alert" : "Create Price Alert"}
      size="md"
    >
      {productData && (
        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded">
          <img 
            src={productData.image} 
            alt={productData.name} 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h3 className="font-semibold text-sm">{productData.name}</h3>
            <p className="text-sm text-gray-600">{formatPrice(productData.currentPrice)}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Price
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.targetPrice}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormData(prev => ({ ...prev, targetPrice: newValue }));
              if (productData) {
                setValidationError(validateTargetPriceInput(newValue, productData.currentPrice));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationError ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {validationError && (
            <p className="text-red-500 text-sm mt-1">{validationError}</p>
          )}
        </div>

        {/* Tracking Period Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tracking Period
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="trackingPeriod"
                value="30"
                checked={formData.trackingPeriod === '30'}
                onChange={(e) => setFormData(prev => ({ ...prev, trackingPeriod: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm">30 days</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="trackingPeriod"
                value="60"
                checked={formData.trackingPeriod === '60'}
                onChange={(e) => setFormData(prev => ({ ...prev, trackingPeriod: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm">60 days</span>
            </label>
          </div>
        </div>

        {/* Alert Actions - Only show when editing existing alert */}
        {existingAlert && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Actions
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="alertAction"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Alert['status'] }))}
                  className="mr-3"
                />
                <span className="text-sm">Keep tracking (Active)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="alertAction"
                  value="dismissed"
                  checked={formData.status === 'dismissed'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Alert['status'] }))}
                  className="mr-3"
                />
                <span className="text-sm">Stop tracking (Dismiss)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose whether to continue tracking this product or stop the alert
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          {existingAlert && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Are you sure you want to remove this alert? This action cannot be undone.')) {
                  setLoading(true);
                  try {
                    await updateAlert(existingAlert.productId.toString(), { status: 'dismissed' });
                    onClose();
                  } catch (error) {
                    console.error('Failed to remove alert:', error);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
              className="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              Remove Alert
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (existingAlert ? 'Update Alert' : 'Create Alert')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 
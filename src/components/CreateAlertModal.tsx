import React, { useState } from 'react';
import { Alert } from '../types/alerts';
import { useAlerts } from '../contexts/AlertContext';
import { useToast } from '../contexts/ToastContext';
import Modal from './ui/Modal';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData?: {
    id: string;
    name: string;
    url: string;
    image: string;
    currentPrice: number;
  };
}

export default function CreateAlertModal({ isOpen, onClose, productData }: CreateAlertModalProps) {
  const { createAlert, alertPreferences } = useAlerts();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetPrice: productData?.currentPrice ? (productData.currentPrice * 0.9).toFixed(2) : '',
    priceDropPercentage: alertPreferences?.defaultPriceDropPercentage || 10,
    absolutePriceDrop: alertPreferences?.defaultAbsolutePriceDrop || 10,
    alertType: 'price_drop' as Alert['alertType'],
    emailNotifications: alertPreferences?.emailNotifications ?? true,
    pushNotifications: alertPreferences?.pushNotifications ?? true,
    smsNotifications: alertPreferences?.smsNotifications ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productData) return;

    setLoading(true);
    try {
      await createAlert({
        userId: '', // Will be set by the service
        productId: productData.id,
        productName: productData.name,
        productUrl: productData.url,
        productImage: productData.image,
        currentPrice: productData.currentPrice,
        targetPrice: parseFloat(formData.targetPrice),
        alertType: formData.alertType,
        status: 'active',
        notificationPreferences: {
          email: formData.emailNotifications,
          push: formData.pushNotifications,
          sms: formData.smsNotifications,
        },
        thresholds: {
          priceDropPercentage: formData.priceDropPercentage,
          absolutePriceDrop: formData.absolutePriceDrop,
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });
      showToast('Price alert created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to create alert:', error);
      showToast('Failed to create alert. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Price Alert"
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
            <p className="text-sm text-gray-600">${productData.currentPrice}</p>
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
            onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Drop Percentage
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.priceDropPercentage}
            onChange={(e) => setFormData(prev => ({ ...prev, priceDropPercentage: parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Absolute Price Drop ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.absolutePriceDrop}
            onChange={(e) => setFormData(prev => ({ ...prev, absolutePriceDrop: parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Preferences
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="mr-2"
              />
              Email Notifications
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="mr-2"
              />
              Push Notifications
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.smsNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                className="mr-2"
              />
              SMS Notifications
            </label>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Alert...
              </>
            ) : (
              'Create Alert'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 
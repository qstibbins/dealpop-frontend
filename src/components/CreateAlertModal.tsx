import React, { useState, useEffect } from 'react';
import { Alert } from '../types/alerts';
import { useAlerts } from '../contexts/AlertContext';
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
    targetPrice?: string;
  };
  existingAlert?: Alert;
}

export default function CreateAlertModal({ isOpen, onClose, productData, existingAlert }: CreateAlertModalProps) {
  const { createAlert, updateAlert, alertPreferences } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetPrice: productData?.currentPrice ? (productData.currentPrice * 0.9).toFixed(2) : '',
    alertType: 'price_drop' as Alert['alertType'],
    emailNotifications: alertPreferences?.emailNotifications ?? true,
    pushNotifications: alertPreferences?.pushNotifications ?? true,
    smsNotifications: alertPreferences?.smsNotifications ?? false,
  });

  // Initialize form with existing alert data if editing
  useEffect(() => {
    if (existingAlert) {
      setFormData({
        targetPrice: existingAlert.targetPrice.toString(),
        alertType: existingAlert.alertType,
        emailNotifications: existingAlert.notificationPreferences.email,
        pushNotifications: existingAlert.notificationPreferences.push,
        smsNotifications: existingAlert.notificationPreferences.sms,
      });
    }
  }, [existingAlert]);

  // Update form data when productData changes (for new alerts)
  useEffect(() => {
    if (productData && !existingAlert) {
      // Use product's existing target price if available, otherwise calculate 90% of current price
      const existingTargetPrice = (productData as any).targetPrice;
      const calculatedTargetPrice = existingTargetPrice || (productData.currentPrice ? (productData.currentPrice * 0.9).toFixed(2) : '');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 CreateAlertModal price calculation:', {
          productName: productData.name,
          currentPrice: productData.currentPrice,
          existingTargetPrice: existingTargetPrice,
          calculatedTargetPrice: calculatedTargetPrice
        });
      }
      
      setFormData({
        targetPrice: calculatedTargetPrice,
        alertType: 'price_drop' as Alert['alertType'],
        emailNotifications: alertPreferences?.emailNotifications ?? true,
        pushNotifications: alertPreferences?.pushNotifications ?? true,
        smsNotifications: alertPreferences?.smsNotifications ?? false,
      });
    }
  }, [productData, existingAlert, alertPreferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productData) return;

    setLoading(true);
    try {
      if (existingAlert) {
        // Update existing alert
        await updateAlert(existingAlert.id, {
          targetPrice: parseFloat(formData.targetPrice),
          alertType: formData.alertType,
          notificationPreferences: {
            email: formData.emailNotifications,
            push: formData.pushNotifications,
            sms: formData.smsNotifications,
          },
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
            email: formData.emailNotifications,
            push: formData.pushNotifications,
            sms: formData.smsNotifications,
          },
          thresholds: {
            priceDropPercentage: 10,
            absolutePriceDrop: 10,
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingAlert ? "Edit Price Alert" : "Create Price Alert"}
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
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
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
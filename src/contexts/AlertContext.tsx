import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Alert, AlertPreferences, AlertHistory } from '../types/alerts';
import { apiAdapter } from '../services/apiAdapter';
import { useAuth } from './AuthContext';

interface AlertContextType {
  alerts: Alert[];
  activeAlerts: Alert[];
  alertPreferences: AlertPreferences | null;
  loading: boolean;
  error: string | null;
  
  // Alert actions
  createAlert: (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt' | 'userId'>) => Promise<Alert>;
  updateAlert: (alertId: string, updates: Partial<Alert>) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  
  // Preferences actions
  updatePreferences: (preferences: Partial<AlertPreferences>) => Promise<void>;
  
  // History actions
  getAlertHistory: (alertId: string) => Promise<AlertHistory[]>;
  
  // Utility functions
  getAlertStats: () => {
    total: number;
    active: number;
    triggered: number;
    dismissed: number;
  };
  
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load alerts and preferences function (moved outside useEffect to be accessible)
  const loadData = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setAlertPreferences(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [alertsResponse, preferencesResponse] = await Promise.all([
        apiAdapter.getAlerts(),
        apiAdapter.getUserPreferences(),
      ]);

      // Handle backend response format (actual backend spec)
      // GET /api/alerts returns direct array
      const alertsData = alertsResponse;
      // GET /api/users/preferences returns {preferences: {...}}
      const preferencesData = (preferencesResponse as any).preferences || preferencesResponse;

      // Transform backend alert format to frontend format
      const transformedAlerts = Array.isArray(alertsData) ? alertsData.map((alert: any) => ({
        id: alert.id,
        userId: alert.user_id,
        productId: alert.product_id,
        productName: alert.product_name,
        productUrl: alert.product_url,
        productImage: alert.product_image_url,
        currentPrice: alert.current_price,
        targetPrice: alert.target_price,
        alertType: alert.alert_type,
        status: alert.status,
        notificationPreferences: alert.notification_preferences || {
          email: true,
          push: true,
          sms: false
        },
        thresholds: alert.thresholds || {
          priceDropPercentage: 10,
          absolutePriceDrop: 10
        },
        expiresAt: alert.expires_at,
        triggeredAt: alert.triggered_at,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at,
        lastCheckedAt: alert.last_checked_at
      })) : [];

      setAlerts(transformedAlerts);
      setAlertPreferences(preferencesData);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load alerts and preferences when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  const createAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt' | 'userId'>) => {
    try {
      // Include the user ID in the alert data
      const alertDataWithUserId = {
        ...alertData,
        userId: user?.uid || '', // Use Firebase user UID
      };
      
      const response = await apiAdapter.createAlert(alertDataWithUserId);
      
      // POST /api/alerts returns {success: true, id: 456} - not full alert object
      // We need to create the alert object from the original data + returned ID
      const alertId = (response as any).id;
      
      const newAlert = {
        id: alertId,
        userId: alertDataWithUserId.userId,
        productId: alertDataWithUserId.productId,
        productName: alertDataWithUserId.productName,
        productUrl: alertDataWithUserId.productUrl,
        productImage: alertDataWithUserId.productImage,
        currentPrice: alertDataWithUserId.currentPrice,
        targetPrice: alertDataWithUserId.targetPrice,
        alertType: alertDataWithUserId.alertType,
        status: 'active' as const, // New alerts start as active
        notificationPreferences: alertDataWithUserId.notificationPreferences || {
          email: true,
          push: true,
          sms: false
        },
        thresholds: alertDataWithUserId.thresholds || {
          priceDropPercentage: 10,
          absolutePriceDrop: 10
        },
        expiresAt: alertDataWithUserId.expiresAt,
        triggeredAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString()
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAlert = async (alertId: string, updates: Partial<Alert>) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Updating alert:', alertId, 'with updates:', updates);
      }
      
      const response = await apiAdapter.updateAlert(alertId, updates);
      
      if (import.meta.env.DEV) {
        console.log('✅ Alert updated successfully:', response);
      }
      
      // Since we updated the product (not the alert directly), 
      // we need to reload the alerts to get the updated data
      await loadData();
      
      // Trigger product refresh in Dashboard via custom event
      console.log('🔄 Triggering product refresh after alert update');
      window.dispatchEvent(new CustomEvent('refreshProducts'));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await apiAdapter.deleteAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const dismissAlert = async (alertId: string) => {
    await updateAlert(alertId, { status: 'dismissed' });
  };

  const updatePreferences = async (preferences: Partial<AlertPreferences>) => {
    try {
      const response = await apiAdapter.updateUserPreferences(preferences);
      const updatedPrefs = (response as any).preferences || response;
      setAlertPreferences(prev => prev ? { ...prev, ...updatedPrefs } : updatedPrefs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAlertHistory = async (alertId: string) => {
    try {
      const response = await apiAdapter.getAlertHistory(alertId);
      return (response as any).history || response || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load alert history';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAlertStats = () => {
    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      triggered: alerts.filter(a => a.status === 'triggered').length,
      dismissed: alerts.filter(a => a.status === 'dismissed').length,
    };
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  const value = {
    alerts,
    activeAlerts,
    alertPreferences,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    dismissAlert,
    updatePreferences,
    getAlertHistory,
    getAlertStats,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}; 
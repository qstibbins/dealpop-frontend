import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // Load alerts and preferences when user changes
  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setAlertPreferences(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const [alertsResponse, preferencesResponse] = await Promise.all([
          apiAdapter.getAlerts(),
          apiAdapter.getUserPreferences(),
        ]);

        // Handle different response formats
        const alertsData = (alertsResponse as any).alerts || alertsResponse;
        const preferencesData = (preferencesResponse as any).preferences || preferencesResponse;

        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setAlertPreferences(preferencesData);
      } catch (err) {
        console.error('Failed to load alerts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const createAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt' | 'userId'>) => {
    try {
      // Include the user ID in the alert data
      const alertDataWithUserId = {
        ...alertData,
        userId: user?.uid || '', // Use Firebase user UID
      };
      
      const response = await apiAdapter.createAlert(alertDataWithUserId);
      const newAlert = (response as any).alert || response;
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Updating alert:', alertId, 'with updates:', updates);
      }
      
      const response = await apiAdapter.updateAlert(alertId, updates);
      const updatedAlert = (response as any).alert || response;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Alert updated successfully:', updatedAlert);
      }
      
      setAlerts(prev => {
        const newAlerts = prev.map(alert => 
          alert.id === alertId ? { ...alert, ...updatedAlert } : alert
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Alerts state updated:', {
            alertId,
            oldAlerts: prev,
            newAlerts: newAlerts
          });
        }
        
        // Force a re-render by creating a new array
        return [...newAlerts];
      });
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
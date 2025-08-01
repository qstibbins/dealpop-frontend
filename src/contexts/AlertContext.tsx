import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, AlertPreferences, AlertHistory } from '../types/alerts';
import { AlertService } from '../services/alertService';
import { MockAlertServiceAdapter } from '../services/mockAlertServiceAdapter';
import { MockAlertService } from '../services/mockAlertService';
import { useAuth } from './AuthContext';

interface AlertContextType {
  alerts: Alert[];
  activeAlerts: Alert[];
  alertPreferences: AlertPreferences | null;
  loading: boolean;
  error: string | null;
  
  // Alert actions
  createAlert: (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt'>) => Promise<Alert>;
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
  const [useMockService, setUseMockService] = useState(false);

  // Determine which service to use
  useEffect(() => {
    // Check if we should use mock service (when Firebase is not available or for testing)
    const shouldUseMock = !window.chrome || !window.chrome.storage || process.env.NODE_ENV === 'development';
    setUseMockService(shouldUseMock);
    
    if (shouldUseMock) {
      console.log('🔔 Using Mock Alert Service - Loading fake data for testing');
      // Initialize mock data
      MockAlertService.initializeMockData();
    } else {
      console.log('🔔 Using Firebase Alert Service');
    }
  }, []);

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
        const service = useMockService ? MockAlertServiceAdapter : AlertService;
        
        const [alertsData, preferencesData] = await Promise.all([
          service.getUserAlerts(),
          service.getAlertPreferences(),
        ]);

        setAlerts(alertsData);
        setAlertPreferences(preferencesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const service = useMockService ? MockAlertServiceAdapter : AlertService;
    const unsubscribe = service.subscribeToAlerts((updatedAlerts) => {
      setAlerts(updatedAlerts);
    });

    return unsubscribe;
  }, [user, useMockService]);

  const createAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt'>) => {
    try {
      const service = useMockService ? MockAlertServiceAdapter : AlertService;
      const newAlert = await service.createAlert(alertData);
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
      throw err;
    }
  };

  const updateAlert = async (alertId: string, updates: Partial<Alert>) => {
    try {
      const service = useMockService ? MockAlertServiceAdapter : AlertService;
      await service.updateAlert(alertId, updates);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, ...updates } : alert
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
      throw err;
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const service = useMockService ? MockAlertServiceAdapter : AlertService;
      await service.deleteAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
      throw err;
    }
  };

  const dismissAlert = async (alertId: string) => {
    await updateAlert(alertId, { status: 'dismissed' });
  };

  const updatePreferences = async (preferences: Partial<AlertPreferences>) => {
    try {
      const service = useMockService ? MockAlertServiceAdapter : AlertService;
      await service.updateAlertPreferences(preferences);
      setAlertPreferences(prev => prev ? { ...prev, ...preferences } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  const getAlertHistory = async (alertId: string) => {
    try {
      const service = useMockService ? MockAlertServiceAdapter : AlertService;
      return await service.getAlertHistory(alertId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alert history');
      throw err;
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
import { useState } from 'react';
import { useAlerts } from '../contexts/AlertContext';
import AlertCard from '../components/AlertCard';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import { Alert } from '../types/alerts';
import { MockAlertService } from '../services/mockAlertService';

export default function Alerts() {
  const { 
    alerts, 
    loading, 
    error, 
    getAlertStats
  } = useAlerts();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered' | 'dismissed'>('all');

  const stats = getAlertStats();

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const handleEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowCreateModal(true);
  };

  // const handleViewHistory = (alert: Alert) => {
  //   setSelectedAlert(alert);
  //   setShowHistoryModal(true);
  // };

  const handleResetMockData = () => {
    MockAlertService.clearMockData();
    MockAlertService.initializeMockData();
    window.location.reload();
  };

  const getFilterButtonClass = (filterValue: typeof filter) => {
    return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      filter === filterValue
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
  };

  if (loading) {
    return (
      <main className="p-6 flex-1 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading alerts...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 flex-1 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
          <p className="text-gray-600">Monitor product prices and get notified of changes</p>
        </div>
        <div className="flex space-x-2">
          {/* Reset Mock Data Button (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleResetMockData}
              className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
              title="Reset mock data for testing"
            >
              🔄 Reset Mock
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Create Alert
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg">🔔</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Alerts</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-lg">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Triggered</p>
              <p className="text-2xl font-bold text-red-900">{stats.triggered}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-lg">📋</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Dismissed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dismissed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={getFilterButtonClass('all')}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={getFilterButtonClass('active')}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setFilter('triggered')}
          className={getFilterButtonClass('triggered')}
        >
          Triggered ({stats.triggered})
        </button>
        <button
          onClick={() => setFilter('dismissed')}
          className={getFilterButtonClass('dismissed')}
        >
          Dismissed ({stats.dismissed})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No alerts yet' : `No ${filter} alerts`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "Create your first price alert to start monitoring products"
              : `You don't have any ${filter} alerts at the moment`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Alert
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onEdit={handleEditAlert}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAlertModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedAlert(null);
        }}
        productData={selectedAlert ? {
          id: selectedAlert.productId,
          name: selectedAlert.productName,
          url: selectedAlert.productUrl,
          image: selectedAlert.productImage,
          currentPrice: selectedAlert.currentPrice,
        } : undefined}
        existingAlert={selectedAlert}
      />

      {selectedAlert && (
        <AlertHistoryModal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedAlert(null);
          }}
          alertId={selectedAlert.id}
          alertName={selectedAlert.productName}
        />
      )}
    </main>
  );
}
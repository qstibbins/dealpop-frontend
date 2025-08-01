import React, { useState, useEffect } from 'react';
import { AlertHistory } from '../types/alerts';
import { useAlerts } from '../contexts/AlertContext';

interface AlertHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string;
  alertName: string;
}

export default function AlertHistoryModal({ isOpen, onClose, alertId, alertName }: AlertHistoryModalProps) {
  const { getAlertHistory } = useAlerts();
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && alertId) {
      loadHistory();
    }
  }, [isOpen, alertId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyData = await getAlertHistory(alertId);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load alert history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created':
        return '➕';
      case 'triggered':
        return '🔔';
      case 'dismissed':
        return '❌';
      case 'updated':
        return '✏️';
      case 'expired':
        return '⏰';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Alert History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-4 text-gray-700">{alertName}</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No history available for this alert.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <span className="text-lg">{getEventIcon(entry.eventType)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium capitalize">{entry.eventType}</p>
                    <span className="text-sm text-gray-500">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{entry.message}</p>
                  {entry.oldPrice && entry.newPrice && (
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-red-600">
                        ${entry.oldPrice.toFixed(2)} → ${entry.newPrice.toFixed(2)}
                      </span>
                      {entry.priceChangePercentage && (
                        <span className={`font-medium ${
                          entry.priceChangePercentage > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.priceChangePercentage > 0 ? '+' : ''}{entry.priceChangePercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
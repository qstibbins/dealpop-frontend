import { useAlerts } from '../contexts/AlertContext';
import Modal from './ui/Modal';
import { formatPrice } from '../utils/priceFormatting';
import { Alert } from '../types/alerts';

interface AlertsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertsListModal({ isOpen, onClose }: AlertsListModalProps) {
  const { alerts, loading } = useAlerts();

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const triggeredAlerts = alerts.filter(alert => alert.status === 'triggered');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>;
      case 'triggered':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Triggered</span>;
      case 'dismissed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Dismissed</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{status}</span>;
    }
  };

  const AlertItem = ({ alert }: { alert: Alert }) => {
    const isTriggered = alert.status === 'triggered';
    const borderClass = isTriggered 
      ? 'border-2 border-red-500 bg-red-50' 
      : 'border border-gray-200';
    const hoverClass = isTriggered 
      ? 'hover:bg-red-100' 
      : 'hover:bg-gray-50';
    
    return (
      <div className={`${borderClass} ${hoverClass} rounded-lg p-4 transition-colors`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={`font-medium mb-1 ${isTriggered ? 'text-red-900' : 'text-gray-900'}`}>
              {isTriggered && '🎯 '}{alert.productName}
            </h4>
            <div className="text-sm space-y-1">
              <div className={isTriggered ? 'text-red-700 font-medium' : 'text-gray-600'}>
                Current: {formatPrice(alert.currentPrice)} → Target: {formatPrice(alert.targetPrice)}
                {isTriggered && <span className="ml-2 text-green-600 font-bold">✅ TARGET REACHED!</span>}
              </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(alert.status)}
              {alert.triggeredAt && (
                <span className="text-xs text-gray-500">
                  Triggered {new Date(alert.triggeredAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        {alert.productImage && (
          <img 
            src={alert.productImage} 
            alt={alert.productName}
            className="w-12 h-12 object-cover rounded ml-4"
          />
        )}
      </div>
    </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Alerts">
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading alerts...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts yet</h3>
            <p className="text-gray-600">Create your first price alert to start monitoring products</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triggeredAlerts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">🔥 Triggered Alerts ({triggeredAlerts.length})</h3>
                <div className="space-y-2">
                  {triggeredAlerts.map(alert => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            )}
            
            {activeAlerts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-800 mb-2">✅ Active Alerts ({activeAlerts.length})</h3>
                <div className="space-y-2">
                  {activeAlerts.map(alert => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

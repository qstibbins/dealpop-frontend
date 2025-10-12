import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiAdapter } from '../services/apiAdapter';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] = useState<any>(null);

  // Load notification preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        const response = await apiAdapter.getUserPreferences();
        const prefs = (response as any).success ? (response as any).preferences : response;
        
        setPreferences(prefs);
        setEmailNotifications(prefs.email_notifications ?? true);
        setSmsEnabled(prefs.sms_notifications ?? false);
        setPhoneNumber(prefs.phone_number || '');
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, [user]);

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const updatedPreferences = {
        email_notifications: emailNotifications,
        sms_notifications: smsEnabled,
        phone_number: phoneNumber || null,
      };

      await apiAdapter.updateUserPreferences(updatedPreferences);
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOut();
    if (result.error) {
      setMessage('Error signing out: ' + result.error);
    }
    setLoading(false);
  };

  return (
    <main className="p-6 flex-1 bg-white">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* User Profile Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="flex items-center space-x-4 mb-4">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {user?.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500">
              Provider: {user?.providerData[0]?.providerId || 'Email/Password'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Email Notifications</label>
            <p className="text-xs text-gray-500">Receive price drop alerts via email</p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">SMS Alerts</label>
            <p className="text-xs text-gray-500">Receive price drop alerts via SMS</p>
          </div>
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={(e) => setSmsEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </div>

        {smsEnabled && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded ${
          message.includes('Error') 
            ? 'bg-red-100 text-red-700 border border-red-400' 
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message}
        </div>
      )}
    </main>
  );
}
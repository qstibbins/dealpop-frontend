import { useState, useEffect } from 'react';
import { abTestAnalytics } from './ABTestAnalytics';

export default function ABTestDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Load analytics data
    setAnalytics(abTestAnalytics.getAnalytics());
  }, []);

  const refreshAnalytics = () => {
    setAnalytics(abTestAnalytics.getAnalytics());
  };

  const clearAnalytics = () => {
    abTestAnalytics.clearAnalytics();
    setAnalytics(abTestAnalytics.getAnalytics());
  };

  if (!analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">A/B Test Analytics</h1>
          <div className="space-x-2">
            <button
              onClick={refreshAnalytics}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
            <button
              onClick={clearAnalytics}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Views */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Page Views</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Original:</span>
                <span className="font-bold">{analytics.views.original}</span>
              </div>
              <div className="flex justify-between">
                <span>Variant 2:</span>
                <span className="font-bold">{analytics.views.v2}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total:</span>
                <span className="font-bold">{analytics.views.original + analytics.views.v2}</span>
              </div>
            </div>
          </div>

          {/* Signups */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Signups</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Original:</span>
                <span className="font-bold">{analytics.signups.original}</span>
              </div>
              <div className="flex justify-between">
                <span>Variant 2:</span>
                <span className="font-bold">{analytics.signups.v2}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total:</span>
                <span className="font-bold">{analytics.signups.original + analytics.signups.v2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Conversion Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Original</h4>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.conversionRates.original}%
              </div>
              <div className="text-sm text-gray-500">
                {analytics.signups.original} signups / {analytics.views.original} views
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Variant 2</h4>
              <div className="text-2xl font-bold text-green-600">
                {analytics.conversionRates.v2}%
              </div>
              <div className="text-sm text-gray-500">
                {analytics.signups.v2} signups / {analytics.views.v2} views
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        {analytics.views.original > 0 && analytics.views.v2 > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
            <h3 className="text-lg font-semibold mb-2">Current Winner</h3>
            {parseFloat(analytics.conversionRates.original) > parseFloat(analytics.conversionRates.v2) ? (
              <div className="text-blue-700">
                <span className="font-bold">Original</span> is performing better with{' '}
                {analytics.conversionRates.original}% conversion rate
              </div>
            ) : parseFloat(analytics.conversionRates.v2) > parseFloat(analytics.conversionRates.original) ? (
              <div className="text-green-700">
                <span className="font-bold">Variant 2</span> is performing better with{' '}
                {analytics.conversionRates.v2}% conversion rate
              </div>
            ) : (
              <div className="text-gray-700">
                Both variants are performing equally with{' '}
                {analytics.conversionRates.original}% conversion rate
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Total events tracked: {analytics.totalEvents}
        </div>
      </div>
    </div>
  );
} 
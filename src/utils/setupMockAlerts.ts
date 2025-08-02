import { MockAlertService } from '../services/mockAlertService';

/**
 * Utility function to set up mock alerts in local storage
 * Call this function to initialize test data for the dynamic button functionality
 */
export function setupMockAlerts(): void {
  console.log('🔔 Setting up mock alerts in local storage...');
  
  // Initialize mock data
  MockAlertService.initializeMockData();
  
  // Force create dashboard alerts
  MockAlertService.forceCreateDashboardAlerts();
  
  // Get the alerts to verify they were created
  const alerts = MockAlertService.getAlerts();
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  
  console.log(`✅ Created ${alerts.length} total alerts`);
  console.log(`✅ ${activeAlerts.length} active alerts available for testing`);
  
  // Log the product IDs that have active alerts
  const productIdsWithAlerts = activeAlerts.map(alert => alert.productId);
  console.log('📋 Product IDs with active alerts:', productIdsWithAlerts);
  
  // Show which Dashboard dummy products have alerts
  const dashboardProductIds = ['1', '2', '3', '4'];
  dashboardProductIds.forEach(id => {
    const hasAlert = productIdsWithAlerts.includes(id);
    console.log(`   Product ${id}: ${hasAlert ? '✅ Has alert' : '❌ No alert'}`);
  });
  
  console.log('🎯 You can now test the dynamic button functionality!');
  console.log('   - Products with alerts will show "Edit Alert" button');
  console.log('   - Products without alerts will show "Create Alert" button');
}

/**
 * Clear all mock alerts from local storage
 */
export function clearMockAlerts(): void {
  console.log('🧹 Clearing mock alerts from local storage...');
  MockAlertService.clearMockData();
  console.log('✅ Mock alerts cleared');
}

/**
 * Get current alert status for Dashboard products
 */
export function getAlertStatus(): void {
  const alerts = MockAlertService.getAlerts();
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const productIdsWithAlerts = activeAlerts.map(alert => alert.productId);
  
  console.log('📊 Current Alert Status:');
  console.log(`   Total alerts: ${alerts.length}`);
  console.log(`   Active alerts: ${activeAlerts.length}`);
  console.log(`   Product IDs with active alerts: ${productIdsWithAlerts.join(', ')}`);
} 
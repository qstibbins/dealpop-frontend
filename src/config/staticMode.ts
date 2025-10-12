// Configuration for static mode (GitHub Pages deployment)
export const STATIC_MODE_CONFIG = {
  // SINGLE CONFIGURATION VALUE - Change this ONE thing to control everything
  ENABLE_STATIC_MODE: false,
  
  // Demo mode settings
  DEMO_MODE: {
    AUTO_LOGIN: true,
    DEMO_USER_EMAIL: 'demo@dealpop.com',
    DEMO_USER_PASSWORD: 'demo123',
  },
  
  // API settings for static mode
  API: {
    BASE_URL: '/api', // This will be ignored in static mode
    TIMEOUT: 3000,
    RETRY_ATTEMPTS: 1,
  },
  
  // Feature flags for static mode
  FEATURES: {
    ALERTS: true,
    SEARCH: true,
    FILTERS: true,
    ANALYTICS: false, // Disable analytics in static mode
    AUTH: false, // Disable real auth in static mode
  },
  
  // UI settings for static mode
  UI: {
    SHOW_DEMO_BANNER: true,
    DEMO_BANNER_TEXT: 'Demo Mode - This is a static preview with realistic mock data',
    SHOW_MOCK_DATA_INDICATOR: true,
  }
};

// Check if we're in static mode
export const isStaticMode = (): boolean => {
  return STATIC_MODE_CONFIG.ENABLE_STATIC_MODE;
};

// Check if we should force mock data - automatically follows static mode
export const shouldForceMockData = (): boolean => {
  return STATIC_MODE_CONFIG.ENABLE_STATIC_MODE;
};

// Check if Firebase auth should be disabled - automatically follows static mode
export const shouldDisableFirebaseAuth = (): boolean => {
  return STATIC_MODE_CONFIG.ENABLE_STATIC_MODE;
};

// Get demo mode settings
export const getDemoModeSettings = () => {
  return STATIC_MODE_CONFIG.DEMO_MODE;
};

// Get feature flags
export const getFeatureFlags = () => {
  return STATIC_MODE_CONFIG.FEATURES;
};

// Get UI settings
export const getUISettings = () => {
  return STATIC_MODE_CONFIG.UI;
};

import { apiService } from '../services/api';

interface ABTestEvent {
  variant: 'original' | 'v2';
  event: 'view' | 'signup' | 'google_signup' | 'login';
  timestamp: number;
  userId?: string;
}

class ABTestAnalytics {
  private events: ABTestEvent[] = [];

  constructor() {
    // Load stored events from localStorage on initialization
    this.loadStoredEvents();
  }

  private loadStoredEvents() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('abTestEvents') || '[]');
      this.events = storedEvents;
    } catch (error) {
      console.error('Failed to load stored AB test events:', error);
      this.events = [];
    }
  }

  // Track when a variant is shown
  async trackView(variant: 'original' | 'v2', userId?: string) {
    const event: ABTestEvent = {
      variant,
      event: 'view',
      timestamp: Date.now(),
      userId
    };
    await this.trackEvent(event);
  }

  // Track signup attempts
  async trackSignup(variant: 'original' | 'v2', userId?: string) {
    const event: ABTestEvent = {
      variant,
      event: 'signup',
      timestamp: Date.now(),
      userId
    };
    await this.trackEvent(event);
  }

  // Track Google signup attempts
  async trackGoogleSignup(variant: 'original' | 'v2', userId?: string) {
    const event: ABTestEvent = {
      variant,
      event: 'google_signup',
      timestamp: Date.now(),
      userId
    };
    await this.trackEvent(event);
  }

  // Track login attempts
  async trackLogin(variant: 'original' | 'v2', userId?: string) {
    const event: ABTestEvent = {
      variant,
      event: 'login',
      timestamp: Date.now(),
      userId
    };
    await this.trackEvent(event);
  }

  private async trackEvent(event: ABTestEvent) {
    this.events.push(event);
    
    // Store in localStorage for persistence
    const storedEvents = JSON.parse(localStorage.getItem('abTestEvents') || '[]');
    storedEvents.push(event);
    localStorage.setItem('abTestEvents', JSON.stringify(storedEvents));
    
    // Try to send to API, but don't fail if not authenticated
    try {
      await apiService.recordABTestEvent(event);
      console.log('AB Test Event sent to API:', event);
    } catch (error) {
      // Don't log errors for authentication issues on login page
      if (error instanceof Error && error.message.includes('User not authenticated')) {
        // Silently store locally - will be sent when user logs in
        console.log('AB Test Event stored locally (will sync when authenticated):', event);
      } else {
        console.error('Failed to send AB test event to API:', error);
      }
    }
  }

  // Get analytics data from API
  async getAnalytics() {
    try {
      const response = await apiService.getABTestAnalytics();
      return (response as any).analytics || response;
    } catch (error) {
      console.error('Failed to get AB test analytics from API:', error);
      // Fallback to local analytics
      return this.getLocalAnalytics();
    }
  }

  // Get local analytics data (fallback)
  getLocalAnalytics() {
    const views = this.events.filter(e => e.event === 'view');
    const signups = this.events.filter(e => e.event === 'signup');

    const originalViews = views.filter(e => e.variant === 'original').length;
    const v2Views = views.filter(e => e.variant === 'v2').length;
    const originalSignups = signups.filter(e => e.variant === 'original').length;
    const v2Signups = signups.filter(e => e.variant === 'v2').length;

    return {
      views: { original: originalViews, v2: v2Views },
      signups: { original: originalSignups, v2: v2Signups },
      conversionRates: {
        original: originalViews > 0 ? (originalSignups / originalViews * 100).toFixed(2) : '0',
        v2: v2Views > 0 ? (v2Signups / v2Views * 100).toFixed(2) : '0'
      },
      totalEvents: this.events.length
    };
  }

  // Clear analytics data
  clearAnalytics() {
    this.events = [];
    localStorage.removeItem('abTestEvents');
  }

  // Sync stored events to API when user logs in
  async syncStoredEvents() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('abTestEvents') || '[]');
      if (storedEvents.length > 0) {
        console.log(`Syncing ${storedEvents.length} stored AB test events to API...`);
        
        // Send each stored event to API
        for (const event of storedEvents) {
          try {
            await apiService.recordABTestEvent(event);
            console.log('Synced AB Test Event:', event);
          } catch (error) {
            console.error('Failed to sync AB test event:', error);
          }
        }
        
        // Clear stored events after successful sync
        localStorage.removeItem('abTestEvents');
        console.log('AB test events synced successfully');
      }
    } catch (error) {
      console.error('Failed to sync stored AB test events:', error);
    }
  }
}

export const abTestAnalytics = new ABTestAnalytics(); 
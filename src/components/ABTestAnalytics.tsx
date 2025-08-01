interface ABTestEvent {
  variant: 'original' | 'v2';
  event: 'view' | 'signup' | 'google_signup' | 'login';
  timestamp: number;
  userId?: string;
}

class ABTestAnalytics {
  private events: ABTestEvent[] = [];

  // Track when a variant is shown
  trackView(variant: 'original' | 'v2', userId?: string) {
    this.trackEvent({
      variant,
      event: 'view',
      timestamp: Date.now(),
      userId
    });
  }

  // Track signup attempts
  trackSignup(variant: 'original' | 'v2', userId?: string) {
    this.trackEvent({
      variant,
      event: 'signup',
      timestamp: Date.now(),
      userId
    });
  }

  // Track Google signup attempts
  trackGoogleSignup(variant: 'original' | 'v2', userId?: string) {
    this.trackEvent({
      variant,
      event: 'google_signup',
      timestamp: Date.now(),
      userId
    });
  }

  // Track login attempts
  trackLogin(variant: 'original' | 'v2', userId?: string) {
    this.trackEvent({
      variant,
      event: 'login',
      timestamp: Date.now(),
      userId
    });
  }

  private trackEvent(event: ABTestEvent) {
    this.events.push(event);
    
    // Store in localStorage for persistence
    const storedEvents = JSON.parse(localStorage.getItem('abTestEvents') || '[]');
    storedEvents.push(event);
    localStorage.setItem('abTestEvents', JSON.stringify(storedEvents));
    
    // In a real app, you'd send this to your analytics service
    console.log('AB Test Event:', event);
  }

  // Get analytics data
  getAnalytics() {
    const views = this.events.filter(e => e.event === 'view');
    const signups = this.events.filter(e => e.event === 'signup');
    // const googleSignups = this.events.filter(e => e.event === 'google_signup');
    // const logins = this.events.filter(e => e.event === 'login');

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
}

export const abTestAnalytics = new ABTestAnalytics(); 
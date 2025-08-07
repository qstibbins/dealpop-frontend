import { User } from 'firebase/auth';
import { AuthService } from './firebase';
import { mockAuthService } from './mockAuthService';
import { shouldDisableFirebaseAuth } from '../config/staticMode';

// Import the mock auth service to access its setRealUser method
import { mockAuthService as mockAuth } from './mockAuthService';

class AuthAdapter {
  private useMockAuth: boolean = false;
  private mockAuthEnabled: boolean = true; // Set to false to disable mock auth

  constructor() {
    this.checkFirebaseAvailability();
  }

  private async checkFirebaseAvailability(): Promise<void> {
    // Check if we should disable Firebase auth
    if (shouldDisableFirebaseAuth()) {
      this.useMockAuth = true;
      console.log('Static mode enabled, using mock authentication');
      return;
    }

    if (!this.mockAuthEnabled) {
      this.useMockAuth = false;
      return;
    }

    try {
      // Try to access Firebase auth to see if it's available
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      
      // If we can get the auth instance without error, Firebase is available
      this.useMockAuth = false;
      console.log('Firebase Auth available, using real authentication');
      
      // Listen for real user changes and sync with mock service
      auth.onAuthStateChanged((user) => {
        if (this.useMockAuth) {
          mockAuth.setRealUser(user);
        }
      });
    } catch (error) {
      this.useMockAuth = true;
      console.log('Firebase Auth not available, using mock authentication:', error);
    }
  }

  private getService() {
    return this.useMockAuth ? mockAuthService : AuthService;
  }

  // Auth methods
  async signInWithGoogle() {
    return this.getService().signInWithGoogle();
  }

  async signInWithFacebook() {
    return this.getService().signInWithFacebook();
  }

  async signInWithEmail(email: string, password: string) {
    return this.getService().signInWithEmail(email, password);
  }

  async createAccountWithEmail(email: string, password: string) {
    return this.getService().createAccountWithEmail(email, password);
  }

  async signOut() {
    return this.getService().signOut();
  }

  getCurrentUser(): User | null {
    // Only available in real AuthService
    if (!this.useMockAuth) {
      return (this.getService() as any).getCurrentUser();
    }
    // For mock auth, return null (user is managed internally)
    return null;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return this.getService().onAuthStateChanged(callback);
  }

  // Force mock auth mode (for testing)
  forceMockMode(enabled: boolean) {
    this.useMockAuth = enabled;
    console.log(`Mock auth mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if currently using mock auth
  isUsingMockAuth(): boolean {
    return this.useMockAuth;
  }
}

export const authAdapter = new AuthAdapter();

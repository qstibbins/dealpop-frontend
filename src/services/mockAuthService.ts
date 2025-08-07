import { User } from 'firebase/auth';

// Create a more realistic mock user
const createMockUser = (realUser?: User | null): User => {
  const displayName = realUser?.displayName || 'Demo User';
  const email = realUser?.email || 'demo@dealpop.com';
  const photoURL = realUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=fff`;
  const uid = realUser?.uid || 'demo-user-1';

  return {
    uid,
    email,
    displayName,
    photoURL,
    emailVerified: realUser?.emailVerified ?? true,
    isAnonymous: false,
    metadata: {
      creationTime: realUser?.metadata?.creationTime || '2024-01-01T00:00:00Z',
      lastSignInTime: realUser?.metadata?.lastSignInTime || new Date().toISOString(),
    },
    providerData: realUser?.providerData || [],
    refreshToken: realUser?.refreshToken || 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
      authTime: new Date().toISOString(),
      claims: {},
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      issuedAtTime: new Date().toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      token: 'mock-id-token',
    }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: realUser?.phoneNumber || null,
    providerId: realUser?.providerId || 'password',
  } as User;
};

class MockAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private realUser: User | null = null;

  constructor() {
    // Auto-login for demo purposes after a short delay
    setTimeout(() => {
      this.currentUser = createMockUser(this.realUser);
      this.notifyAuthStateChange(this.currentUser);
    }, 1000);
  }

  private notifyAuthStateChange(user: User | null) {
    this.authStateListeners.forEach(listener => listener(user));
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.authStateListeners.push(callback);
    
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Method to set real user info when available
  setRealUser(realUser: User | null) {
    this.realUser = realUser;
    if (this.currentUser) {
      // Update current user with real info
      this.currentUser = createMockUser(realUser);
      this.notifyAuthStateChange(this.currentUser);
    }
  }

  async signInWithGoogle() {
    await this.delay(1000);
    this.currentUser = createMockUser(this.realUser);
    this.notifyAuthStateChange(this.currentUser);
    return { user: this.currentUser, error: null };
  }

  async signInWithFacebook() {
    await this.delay(1000);
    this.currentUser = createMockUser(this.realUser);
    this.notifyAuthStateChange(this.currentUser);
    return { user: this.currentUser, error: null };
  }

  async signInWithEmail(email: string, password: string) {
    await this.delay(1000);
    
    // Demo login - accept any email/password
    if (email && password) {
      this.currentUser = createMockUser(this.realUser);
      this.notifyAuthStateChange(this.currentUser);
      return { user: this.currentUser, error: null };
    } else {
      return { user: null, error: 'Email and password are required' };
    }
  }

  async createAccountWithEmail(email: string, password: string) {
    await this.delay(1000);
    
    // Demo account creation - accept any email/password
    if (email && password) {
      this.currentUser = createMockUser(this.realUser);
      this.notifyAuthStateChange(this.currentUser);
      return { user: this.currentUser, error: null };
    } else {
      return { user: null, error: 'Email and password are required' };
    }
  }

  async signOut() {
    await this.delay(500);
    this.currentUser = null;
    this.notifyAuthStateChange(null);
    return { error: null };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockAuthService = new MockAuthService();

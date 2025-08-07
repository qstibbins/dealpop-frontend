import { User } from 'firebase/auth';

// Mock user for demo purposes
const mockUser: User = {
  uid: 'demo-user-1',
  email: 'demo@dealpop.com',
  displayName: 'Demo User',
  photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0D9488&color=fff',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00Z',
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
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
  phoneNumber: null,
  providerId: 'password',
} as User;

class MockAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Auto-login for demo purposes
    setTimeout(() => {
      this.currentUser = mockUser;
      this.notifyAuthStateChange(mockUser);
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

  async signInWithGoogle() {
    await this.delay(1000);
    this.currentUser = mockUser;
    this.notifyAuthStateChange(mockUser);
    return { user: mockUser, error: null };
  }

  async signInWithFacebook() {
    await this.delay(1000);
    this.currentUser = mockUser;
    this.notifyAuthStateChange(mockUser);
    return { user: mockUser, error: null };
  }

  async signInWithEmail(email: string, password: string) {
    await this.delay(1000);
    
    // Demo login - accept any email/password
    if (email && password) {
      this.currentUser = mockUser;
      this.notifyAuthStateChange(mockUser);
      return { user: mockUser, error: null };
    } else {
      return { user: null, error: 'Email and password are required' };
    }
  }

  async createAccountWithEmail(email: string, password: string) {
    await this.delay(1000);
    
    // Demo account creation - accept any email/password
    if (email && password) {
      this.currentUser = mockUser;
      this.notifyAuthStateChange(mockUser);
      return { user: mockUser, error: null };
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

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authAdapter } from '../services/authAdapter';

// Get Chrome extension ID from environment
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  signInWithFacebook: () => Promise<{ user: User | null; error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  createAccountWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthContext useEffect - setting up auth listener');
    let isInitialLoad = true;
    
    const unsubscribe = authAdapter.onAuthStateChanged((user) => {
      console.log('🔍 Auth state changed - user:', user ? user.email : 'null');
      console.log('🔍 Is initial load:', isInitialLoad);
      
      setUser(user);
      setLoading(false);
      
      if (user && !isInitialLoad) {
        console.log('🔍 User logged in (NEW session), checking extension auth');
        
        // Check if this is from the extension and send auth data back
        sendAuthToExtension(user);
      } else if (user && isInitialLoad) {
        console.log('🔍 User already logged in (EXISTING session), skipping extension auth');
      }
      
      // After first auth state change, no longer initial load
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sends authentication data to Chrome extension
   * Call this after successful Firebase authentication
   */
  const sendAuthToExtension = async (user: User) => {
    console.log('🔍 sendAuthToExtension called for user:', user.email);
    
    // Check if this login came from the extension
    const fullUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const isFromExtension = urlParams.get('extension') === 'true' || fullUrl.includes('extension=true');
    
    console.log('🔍 Full URL:', fullUrl);
    console.log('🔍 URL search:', window.location.search);
    console.log('🔍 URL params extension:', urlParams.get('extension'));
    console.log('🔍 URL includes extension=true:', fullUrl.includes('extension=true'));
    console.log('🔍 isFromExtension:', isFromExtension);
    console.log('🔍 EXTENSION_ID:', EXTENSION_ID);
    console.log('🔍 Chrome runtime available:', !!window.chrome?.runtime);
    
    if (!isFromExtension) {
      console.log('❌ Not from extension, skipping extension auth');
      return;
    }

    // Verify extension ID is configured
    if (!EXTENSION_ID) {
      console.error('VITE_EXTENSION_ID not configured in environment variables');
      return;
    }

    // Verify Chrome extension API is available
    if (typeof window.chrome === 'undefined' || !window.chrome.runtime || !window.chrome.runtime.sendMessage) {
      console.error('❌ Chrome runtime API not available');
      console.error('❌ This page must be opened from the Chrome extension to send auth messages');
      console.log('Chrome object:', window.chrome);
      console.log('Runtime object:', window.chrome?.runtime);
      alert('Error: Chrome extension API not available. Please open this page from the extension.');
      return;
    }

    try {
      // Get Firebase ID token
      const token = await user.getIdToken();
      
      // Validate we have real user data and token
      if (!token || !user.uid || !user.email) {
        console.error('❌ Invalid user data or token, not sending to extension');
        return;
      }
      
      console.log('📤 Sending auth to extension:', EXTENSION_ID);
      console.log('📤 User data:', { uid: user.uid, email: user.email, token: token.substring(0, 20) + '...' });

      // Send message to extension
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        {
          type: 'EXTENSION_AUTH_SUCCESS',
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          token: token
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('❌ Failed to send to extension:', chrome.runtime.lastError.message);
            alert('Failed to connect to extension. Please try again.');
          } else {
            console.log('✅ Auth successfully sent to extension');
            // Show success message
            alert('Authentication successful! This window will close automatically.');
            // Close tab after 2 seconds
            setTimeout(() => window.close(), 2000);
          }
        }
      );
    } catch (error) {
      console.error('Error sending auth to extension:', error);
      
      // Send error to extension
      if (window.chrome?.runtime && EXTENSION_ID) {
        chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'EXTENSION_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔍 signInWithGoogle called');
    const result = await authAdapter.signInWithGoogle();
    console.log('🔍 signInWithGoogle result:', result);
    return result;
  };

  const signInWithFacebook = async () => {
    return await authAdapter.signInWithFacebook();
  };

  const signInWithEmail = async (email: string, password: string) => {
    return await authAdapter.signInWithEmail(email, password);
  };

  const createAccountWithEmail = async (email: string, password: string) => {
    return await authAdapter.createAccountWithEmail(email, password);
  };

  const signOut = async () => {
    return await authAdapter.signOut();
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    createAccountWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
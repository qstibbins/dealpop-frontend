import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authAdapter } from '../services/authAdapter';
import { abTestAnalytics } from '../components/ABTestAnalytics';

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
    const unsubscribe = authAdapter.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      // Sync stored AB test events when user logs in
      if (user) {
        abTestAnalytics.syncStoredEvents();
        
        // Check if this is from the extension and send auth data back
        handleExtensionAuth(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle extension authentication communication
  const handleExtensionAuth = async (user: User) => {
    try {
      // Check if this is from the extension
      const urlParams = new URLSearchParams(window.location.search);
      const isFromExtension = urlParams.get('extension') === 'true';
      
      if (isFromExtension && window.chrome && (window.chrome as any).runtime) {
        // Get the Firebase ID token
        const token = await user.getIdToken();
        
        // Send auth data to extension
        (window.chrome as any).runtime.sendMessage({
          type: 'EXTENSION_AUTH_SUCCESS',
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          token: token
        }, (response: any) => {
          if (response && response.success) {
            // Show success message and close tab after a delay
            setTimeout(() => {
              alert('Extension connected successfully! You can close this tab.');
              window.close();
            }, 1000);
          }
        });
      }
    } catch (error) {
      console.error('Error handling extension auth:', error);
    }
  };

  const signInWithGoogle = async () => {
    return await authAdapter.signInWithGoogle();
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
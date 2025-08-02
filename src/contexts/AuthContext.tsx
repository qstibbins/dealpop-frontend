import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../services/firebase';
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
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      // Sync stored AB test events when user logs in
      if (user) {
        abTestAnalytics.syncStoredEvents();
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    return await AuthService.signInWithGoogle();
  };

  const signInWithFacebook = async () => {
    return await AuthService.signInWithFacebook();
  };

  const signInWithEmail = async (email: string, password: string) => {
    return await AuthService.signInWithEmail(email, password);
  };

  const createAccountWithEmail = async (email: string, password: string) => {
    return await AuthService.createAccountWithEmail(email, password);
  };

  const signOut = async () => {
    return await AuthService.signOut();
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
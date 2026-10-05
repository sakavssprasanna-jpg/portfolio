import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isOwnerSetup: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  setupOwner: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOwnerSetup, setIsOwnerSetup] = useState<boolean>(() => authService.hasOwnerAccount());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuthState = useCallback(async () => {
    try {
      const session = await authService.getSession();
      setIsAuthenticated(session.isAuthenticated);
      setUser(session.user);
      setIsOwnerSetup(authService.hasOwnerAccount());
    } catch (err) {
      console.error('Session verification failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthState();

    // Listen to Supabase auth events
    const { unsubscribe } = authService.onAuthStateChange((session) => {
      setIsAuthenticated(session.isAuthenticated);
      setUser(session.user);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [refreshAuthState]);

  // Login with Email + Password
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signIn(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        setIsOwnerSetup(true);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid email or password.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register / Create Owner Account
  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signUp(email, password);
      if (res.success) {
        if (res.user && !res.requiresEmailVerification) {
          setUser(res.user);
          setIsAuthenticated(true);
        }
        setIsOwnerSetup(true);
        return { 
          success: true, 
          requiresEmailVerification: res.requiresEmailVerification 
        };
      }
      return { success: false, error: res.error || 'Failed to create account.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for backward compatibility
  const setupOwner = async (password: string, email?: string) => {
    return register(email || 'commander@veera.ai', password);
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      return await authService.sendPasswordReset(email);
    } finally {
      setIsLoading(false);
    }
  };

  // Update password (e.g. after password reset)
  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      return await authService.updatePassword(newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      window.location.hash = '';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isOwnerSetup, 
      isLoading, 
      login, 
      register,
      setupOwner,
      forgotPassword,
      updatePassword,
      logout,
      refreshAuthState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

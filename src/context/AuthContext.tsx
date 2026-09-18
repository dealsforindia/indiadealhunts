import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  email: string;
  role: 'shopper' | 'admin';
  alerts_count?: number;
  bounties_count?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isUserDrawerOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openUserDrawer: () => void;
  closeUserDrawer: () => void;
  requestCode: (email: string) => Promise<{ success: boolean; message: string; dev_code?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';
const SESSION_KEY = 'dealflow_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState<boolean>(false);

  const refreshUserProfile = useCallback(async () => {
    const savedToken = localStorage.getItem(SESSION_KEY);
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem(SESSION_KEY);
        setToken(null);
        setUser(null);
      }
    } catch {
      // Offline fallback: keep token but set loading false
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  const requestCode = async (email: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to send access code');
    }

    return {
      success: true,
      message: data.message,
      dev_code: data.dev_code,
    };
  };

  const verifyCode = async (email: string, code: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Invalid or expired code');
    }

    const sessionToken = data.token;
    localStorage.setItem(SESSION_KEY, sessionToken);
    setToken(sessionToken);
    setUser(data.user);
    setIsAuthModalOpen(false);

    return { success: true };
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silently clear local session
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setToken(null);
    setUser(null);
    setIsUserDrawerOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        isUserDrawerOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openUserDrawer: () => setIsUserDrawerOpen(true),
        closeUserDrawer: () => setIsUserDrawerOpen(false),
        requestCode,
        verifyCode,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

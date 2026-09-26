'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearToken, getToken, setToken } from '@/lib/auth-token';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from stored token on mount (do not assume valid; real validation is backend's job)
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (newToken: string, newUser: User) => {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login: handleLogin,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

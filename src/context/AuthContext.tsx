'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '@/utils/apiUrl';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: 'CONTRIBUTOR' | 'REVIEWER' | 'STEWARD' | 'EXPERT' | 'ADMIN';
  points: number;
  badges: string[];
}

export interface DemoAccount {
  id: string;
  displayName: string;
  email: string;
  role: 'CONTRIBUTOR' | 'REVIEWER' | 'STEWARD' | 'EXPERT' | 'ADMIN';
  points: number;
  badges: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  demoAccounts: DemoAccount[];
  sharedDemoPassword: string;
  hasAdminConfigured: boolean;
  adminEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'dharohar_user';
const TOKEN_STORAGE_KEY = 'dharohar_token';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [sharedDemoPassword, setSharedDemoPassword] = useState<string>('dharohar2026');
  const [hasAdminConfigured, setHasAdminConfigured] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  // Load existing session on initial render and verify JWT expiration
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (savedUser && savedToken) {
        const payload = parseJwt(savedToken);
        // If JWT has expired (exp in seconds), clear session
        if (payload?.exp && Date.now() >= payload.exp * 1000) {
          console.warn('[AuthContext] Stored JWT has expired. Logging out.');
          logout();
        } else {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session from localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Fetch demo accounts metadata from server
  useEffect(() => {
    async function fetchDemoAccounts() {
      try {
        const res = await fetch(`${apiUrl}/api/auth/seed-users`);
        if (res.ok) {
          const data = await res.json();
          if (data.accounts) setDemoAccounts(data.accounts);
          if (data.sharedDemoPassword) setSharedDemoPassword(data.sharedDemoPassword);
          setHasAdminConfigured(!!data.hasAdminConfigured);
          setAdminEmail(data.adminEmail || null);
        }
      } catch (err) {
        console.warn('Failed to load demo accounts list:', err);
      }
    }
    fetchDemoAccounts();
  }, [apiUrl]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.message || 'Authentication failed' };
        }

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error connecting to auth server' };
      }
    },
    [apiUrl]
  );

  const authFetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers || {});
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null);
      if (activeToken) {
        headers.set('Authorization', `Bearer ${activeToken}`);
      }

      const res = await fetch(url, {
        ...init,
        headers,
      });

      if (res.status === 401) {
        console.warn('[AuthContext] 401 Unauthorized received. Session expired or invalid signature.');
        logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }

      return res;
    },
    [token, logout],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        authFetch,
        demoAccounts,
        sharedDemoPassword,
        hasAdminConfigured,
        adminEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

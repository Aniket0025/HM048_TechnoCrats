import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; role: UserRole; department?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'edusync_token';

function getApiBaseUrl() {
  const raw = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  return (raw && raw.trim().length > 0 ? raw.trim() : 'http://localhost:5000').replace(/\/$/, '');
}

function getAvatarFallback(nameOrEmail?: string) {
  const seed = encodeURIComponent((nameOrEmail || 'User').trim());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function normalizeUser(raw: any): User {
  const id = raw?.id ?? raw?._id ?? '';
  const email = raw?.email ?? '';
  const name = raw?.name ?? '';
  const role = raw?.role as UserRole;
  const department = raw?.department;
  const avatar = raw?.avatar || getAvatarFallback(name || email);
  return { id: String(id), email: String(email), name: String(name), role, department, avatar };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const setSession = useCallback((token: string, rawUser: any) => {
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user: normalizeUser(rawUser), isAuthenticated: true, isLoading: false });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.json();
        if (!cancelled) {
          setState({ user: normalizeUser(data.user), isAuthenticated: true, isLoading: false });
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, clearSession]);

  const login = useCallback(async (email: string, password: string, _role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));

    const doSignin = async () => {
      const res = await fetch(`${apiBaseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Sign in failed');
      }

      return res.json();
    };

    try {
      const data = await doSignin();
      setSession(data.token, data.user);
    } catch (e) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw e;
    }
  }, [apiBaseUrl, setSession]);

  const signup = useCallback(async (payload: { name: string; email: string; password: string; role: UserRole; department?: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));

    const avatar = getAvatarFallback(payload.name || payload.email);
    const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, avatar }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error(err?.message || 'Sign up failed');
    }

    const data = await res.json();
    setSession(data.token, data.user);
  }, [apiBaseUrl, setSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

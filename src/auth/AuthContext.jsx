import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setAuthToken } from '../lib/api.js';

const STORAGE_KEY = 'pulsewise-cms-session';
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (session?.token) {
      setAuthToken(session.token);
    } else {
      setAuthToken(null);
    }
    setIsBootstrapping(false);
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      isBootstrapping,
      async login({ email, password }) {
        const response = await apiClient.post('/auth/login', {
          email,
          password
        });
        const payload = {
          token: response.data.data.token,
          user: response.data.data.user
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setSession(payload);
        return response.data;
      },
      logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      }
    }),
    [isBootstrapping, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

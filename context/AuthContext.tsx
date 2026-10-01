import { createContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';

export type User = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  authLoading: boolean;
  login: (accessToken: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'student_service_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = async (accessToken: string, userData: User) => {
    if (!accessToken) {
      throw new Error('Authentication token is missing.');
    }

    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      }

      setToken(accessToken);
      setUser(userData);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unable to save the authentication session.',
      );
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Unable to remove saved authentication token:', error);
    } finally {
      setToken(null);
      setUser(null);
      router.replace('/sign-in');
    }
  };

  const restoreSession = async () => {
    setAuthLoading(true);

    try {
      if (Platform.OS === 'web') {
        setToken(null);
        setUser(null);
        return;
      }

      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!savedToken) {
        setToken(null);
        setUser(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${savedToken}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Session validation failed with status ${response.status}.`);
      }

      const data = await response.json();

      const profile = data?.user ?? data;

      setToken(savedToken);
      setUser(profile);
    } catch (error) {
      console.error('Unable to restore authentication session:', error);
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        authLoading,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
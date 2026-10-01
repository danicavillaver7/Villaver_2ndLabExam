import { createContext, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';

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
  const [authLoading, setAuthLoading] = useState(false);

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
    // TODO EXAM: Set authLoading while restoring the session.
    // TODO EXAM: Read the saved token with SecureStore.getItemAsync().
    // TODO EXAM: Validate the token via GET /profile with a Bearer token.
    // TODO EXAM: Update token and user state for a valid session.
    // TODO EXAM: Handle 401 Unauthorized / expired sessions and clear invalid credentials.
    // TODO EXAM: Handle errors and stop authLoading in finally.
  };

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

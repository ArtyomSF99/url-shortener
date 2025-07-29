"use client";

import {
  JSX,
  ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { LOCAL_STORAGE_KEYS } from "../lib/constants";

/**
 * Authentication context and provider for managing auth state.
 */
interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string): void => {
    setToken(newToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
  };

  const logout = (): void => {
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authService } from "@/services/auth.service";
import { startTokenRefresh, stopTokenRefresh } from "@/lib/api/token-refresh";
import type { User } from "@/types";

type AuthContextValue = {
  ready: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch user from backend on mount (cookies are sent automatically)
  useEffect(() => {
    async function fetchUser() {
      try {
        // Try to get current user from backend
        // If cookies are valid, this will succeed
        const user = await authService.me();
        setCurrentUser(user);
        
        // User is logged in, start automatic token refresh
        startTokenRefresh();
      } catch (err) {
        // No valid session or error
        console.log("No active session");
        setCurrentUser(null);
        
        // No user, stop any token refresh
        stopTokenRefresh();
      } finally {
        setReady(true);
      }
    }

    fetchUser();
    
    // Cleanup on unmount
    return () => {
      stopTokenRefresh();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      currentUser,
      async login(email, password) {
        const user = await authService.login({ email, password });
        // Cookies are set by backend automatically
        setCurrentUser(user);
        return user;
      },
      async register(name, email, password) {
        const user = await authService.register({
          name,
          email,
          password,
          confirmPassword: password,
        });
        // Cookies are set by backend automatically
        setCurrentUser(user);
        return user;
      },
      async logout() {
        try {
          await authService.logout();
        } catch (error) {
          // Ignore logout errors - user might already be logged out
          console.log("Logout error (ignored):", error);
        }
        // Always clear local state regardless of API call success
        setCurrentUser(null);
      },
      setUser: (user) => {
        // Just update state, no localStorage
        setCurrentUser(user);
      },
    }),
    [ready, currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useApp(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useApp must be used within an <AuthProvider>.");
  }
  return ctx;
}

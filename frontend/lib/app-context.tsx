"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authService } from "@/services/auth.service";
import { mockUsers, currentUser as mockCurrentUser } from "@/data/mock";
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

const STORAGE_KEY = "northwind.auth.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Hydrate from localStorage on the client only.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCurrentUser(JSON.parse(raw) as User);
      else setCurrentUser(mockCurrentUser);
    } catch {
      setCurrentUser(mockCurrentUser);
    } finally {
      setReady(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      currentUser,
      async login(email, password) {
        const user = await authService.login({ email, password });
        // Mock resolver returns the demo user; fall back to a deterministic
        // mock user matched by email so the login feels real in the UI.
        const matched =
          mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
          user;
        setCurrentUser(matched);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matched));
        } catch {}
        return matched;
      },
      async register(name, email, password) {
        const created = await authService.register({
          name,
          email,
          password,
          confirmPassword: password,
        });
        const user: User = { ...created, name, email };
        setCurrentUser(user);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch {}
        return user;
      },
      async logout() {
        await authService.logout();
        setCurrentUser(null);
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {}
      },
      setUser: (user) => {
        setCurrentUser(user);
        try {
          if (user)
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          else window.localStorage.removeItem(STORAGE_KEY);
        } catch {}
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

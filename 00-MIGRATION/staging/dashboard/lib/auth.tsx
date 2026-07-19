"use client";

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from "react";
import { api, storeAuth, clearAuth, getStoredUser, type User } from "./api";

interface AuthContextType {
  user:     User | null;
  loading:  boolean;
  login:    (username: string, password: string) => Promise<void>;
  logout:   () => void;
  isAdmin:  boolean;
}

const AuthContext = createContext<AuthContextType>({
  user:    null,
  loading: true,
  login:   async () => {},
  logout:  () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const form = new FormData();
      form.append("username", username);
      form.append("password", password);

      const { data } = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      storeAuth(data.access_token, meRes.data);
      setUser(meRes.data);
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAdmin: user?.is_admin ?? false }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const DEV_USER: User = {
  id: "dev-admin",
  name: "Admin User",
  email: "admin@triangle-black.com",
  role: "admin",
};

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, logout: () => {}, isLoading: true,
});

const IS_DEV = process.env.NEXT_PUBLIC_APP_ENV === "development";
const USER_KEY = "tb_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(IS_DEV ? DEV_USER : null);
  const [token, setToken] = useState<string | null>(IS_DEV ? "dev-token-bypass" : null);
  const [isLoading, setIsLoading] = useState(!IS_DEV);

  useEffect(() => {
    if (IS_DEV) {
      setIsLoading(false);
      return;
    }
    const t = typeof window !== "undefined"
      ? sessionStorage.getItem("tb_access_token") ?? localStorage.getItem("tb_token")
      : null;
    const u = typeof window !== "undefined"
      ? sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY)
      : null;
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { setUser(null); }
    }
    setIsLoading(false);
  }, []);

  const login = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tb_access_token", t);
      sessionStorage.setItem(USER_KEY, JSON.stringify(u));
      document.cookie = `tb_access_token=${t}; path=/; max-age=86400; samesite=lax`;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      document.cookie = "tb_access_token=; path=/; max-age=0";
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

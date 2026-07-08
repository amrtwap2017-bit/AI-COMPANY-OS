"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminUser { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: AdminUser | null; token: string | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void; isLoading: boolean;
}

const AuthContext = createContext<AuthCtx>({
  user: null, token: null, login: () => {}, logout: () => {}, isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    const u = localStorage.getItem("admin_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setIsLoading(false);
  }, []);

  const login = (t: string, u: AdminUser) => {
    localStorage.setItem("admin_token", t);
    localStorage.setItem("admin_user", JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null); setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);

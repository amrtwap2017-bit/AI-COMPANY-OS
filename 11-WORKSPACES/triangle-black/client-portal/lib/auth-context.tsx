"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ClientUser { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: ClientUser | null; token: string | null;
  login: (token: string, user: ClientUser) => void;
  logout: () => void; isLoading: boolean;
}

const AuthContext = createContext<AuthCtx>({
  user: null, token: null, login: () => {}, logout: () => {}, isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("client_token");
    const u = localStorage.getItem("client_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setIsLoading(false);
  }, []);

  const login = (t: string, u: ClientUser) => {
    localStorage.setItem("client_token", t);
    localStorage.setItem("client_user", JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    setToken(null); setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useClientAuth = () => useContext(AuthContext);

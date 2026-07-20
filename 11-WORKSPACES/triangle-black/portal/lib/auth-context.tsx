// @ts-nocheck
// Triangle Black - Auth Context
// Program A - Task A1: Uses tokenManager (single token source)
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { tokenManager } from "@/lib/auth/token-manager";

interface User {
  id:        number;
  name:      string;
  email:     string;
  role:      string;
  is_active: boolean;
}

interface AuthCtx {
  user:      User | null;
  isLoading: boolean;
  login:     (token: string, user: User) => void;
  logout:    () => void;
}

const DEV_USER: User = {
  id: 1, name: "Dev Admin",
  email: "dev@triangleblack.com",
  role: "admin", is_active: true,
};

const Ctx = createContext<AuthCtx>({
  user: DEV_USER, isLoading: false,
  login: () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(DEV_USER);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = tokenManager.getUser<User>();
    if (stored) setUser(stored);
    tokenManager.devAutoLogin().then((ok) => {
      if (ok) {
        const u = tokenManager.getUser<User>();
        if (u) setUser(u);
      }
    });
  }, []);

  const login = (token: string, u: User) => {
    tokenManager.setToken(token);
    tokenManager.setUser(u);
    setUser(u);
  };

  const logout = () => {
    tokenManager.clearAll();
    setUser(process.env.NEXT_PUBLIC_AUTH_BYPASS === "true" ? DEV_USER : null);
  };

  return (
    <Ctx.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

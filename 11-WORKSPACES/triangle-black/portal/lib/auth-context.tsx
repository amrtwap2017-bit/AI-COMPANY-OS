"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: number; name: string; email: string;
  role: string; is_active: boolean;
}
interface AuthCtx {
  user: User | null; isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(DEV_USER);

  const login = (token: string, u: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tb_token", token);
      localStorage.setItem("tb_user", JSON.stringify(u));
    }
    setUser(u);
  };

  const logout = () => setUser(DEV_USER); // keep dev user

  return (
    <Ctx.Provider value={{ user, isLoading: false, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

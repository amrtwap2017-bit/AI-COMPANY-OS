// Triangle Black - Enterprise Token Manager
// Program A - Task A1
// Single source of truth for all auth token operations.
// Fixes: 3 storage locations (tb_token, tb_access_token x2) -> 1
// Standard: sessionStorage key "tb_access_token"

const TOKEN_KEY = "tb_access_token";
const USER_KEY  = "tb_user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const tokenManager = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    const session = sessionStorage.getItem(TOKEN_KEY);
    if (session) return session;
    const legacy1 = localStorage.getItem("tb_access_token");
    const legacy2 = localStorage.getItem("tb_token");
    const found   = legacy1 || legacy2;
    if (found) {
      sessionStorage.setItem(TOKEN_KEY, found);
      localStorage.removeItem("tb_access_token");
      localStorage.removeItem("tb_token");
      return found;
    }
    return null;
  },

  setToken(token: string): void {
    if (!isBrowser()) return;
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem("tb_access_token");
    localStorage.removeItem("tb_token");
  },

  getUser<T = unknown>(): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = sessionStorage.getItem(USER_KEY)
               || localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: unknown): void {
    if (!isBrowser()) return;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(USER_KEY);
  },

  clearAll(): void {
    if (!isBrowser()) return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem("tb_access_token");
    localStorage.removeItem("tb_token");
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return true;
    const token = this.getToken();
    if (!token) return false;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  async devAutoLogin(): Promise<boolean> {
    if (!isBrowser()) return false;
    if (process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true") return false;
    if (this.isAuthenticated()) return true;
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
    try {
      const form = new URLSearchParams();
      form.append("username", "admin@triangleblack.com");
      form.append("password", "admin123");
      const res = await fetch(API + "/api/v1/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    form.toString(),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        this.setToken(data.access_token);
        if (data.user) this.setUser(data.user);
        console.debug("[TokenManager] Dev auto-login OK");
        return true;
      }
      return false;
    } catch (e) {
      console.debug("[TokenManager] Dev auto-login failed:", e);
      return false;
    }
  },
};

export default tokenManager;

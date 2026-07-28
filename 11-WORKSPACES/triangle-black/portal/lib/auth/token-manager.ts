// Triangle Black - Enterprise Token Manager
// Standard: localStorage key "tb_access_token"
// Survives page reload. Single source of truth.

const TOKEN_KEY = "tb_access_token";
const USER_KEY  = "tb_user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const tokenManager = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    return (
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem("tb_token") ||
      null
    );
  },

  setToken(token: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("tb_token", token);
    // Also set cookie for middleware compatibility
    document.cookie = `tb_access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `tb_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  },

  getUser<T = unknown>(): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: unknown): void {
    if (!isBrowser()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAll(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("tb_token");
    localStorage.removeItem(USER_KEY);
    // Clear cookies
    document.cookie = "tb_access_token=; path=/; max-age=0";
    document.cookie = "tb_token=; path=/; max-age=0";
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
      form.append("username", "amr@triangleblack.com");
      form.append("password", "admin123");
      const res = await fetch(API + "/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        this.setToken(data.access_token);
        if (data.user) this.setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

export default tokenManager;

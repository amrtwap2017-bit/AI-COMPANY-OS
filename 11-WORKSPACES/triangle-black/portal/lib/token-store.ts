// @ts-nocheck
// Auth token storage — saves TB Admin JWT

const TOKEN_KEY = "tb_access_token";
const USER_KEY  = "tb_user";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isValid(): boolean {
    const token = this.get();
    if (!token) return false;
    // Check if bypass mode
    if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return true;
    // Basic JWT expiry check
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

// Auto-login for development
export async function devAutoLogin() {
  if (typeof window === "undefined") return;
  if (tokenStore.isValid()) return; // already logged in

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true") return;

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
  try {
    const form = new URLSearchParams();
    form.append("username", "admin@triangleblack.com");
    form.append("password", "admin123");
    const res = await fetch(API + "/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        tokenStore.set(data.access_token);
        console.log("Dev auto-login successful");
      }
    }
  } catch (e) {
    console.debug("Dev auto-login failed:", e);
  }
}

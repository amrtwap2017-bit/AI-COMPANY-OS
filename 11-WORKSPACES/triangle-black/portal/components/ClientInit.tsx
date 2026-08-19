// @ts-nocheck
"use client";
import { useEffect } from "react";

export function ClientInit() {
  useEffect(() => {
    async function ensureAuth() {
      // Already have token
      const existing = sessionStorage.getItem("tb_access_token")
        || localStorage.getItem("tb_access_token");
      if (existing) {
        document.cookie = "tb_access_token=" + existing + "; path=/; max-age=28800; SameSite=Lax";
        return;
      }
      // DEV auto-login
      if (process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true") return;
      try {
        const form = new URLSearchParams();
        form.append("username", "admin@triangleblack.com");
        form.append("password", "admin123");
        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        if (res.ok) {
          const data = res.data ?? res;
          const token = data.access_token;
          if (token) {
            sessionStorage.setItem("tb_access_token", token);
            localStorage.setItem("tb_access_token", token);
            document.cookie = "tb_access_token=" + token + "; path=/; max-age=28800; SameSite=Lax";
          }
        }
      } catch {}
    }
    ensureAuth();
  }, []);
  return null;
}

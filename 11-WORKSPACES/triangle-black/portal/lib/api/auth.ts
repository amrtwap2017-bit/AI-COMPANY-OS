import { tbFormPost, tbFetch } from "./tb-client";

export const authApi = {
  async login(email: string, password: string) {
    return tbFormPost("/api/v1/auth/login", { username: email, password });
  },
  async me() {
    return tbFetch("/api/v1/auth/me");
  },
  async logout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("tb_access_token");
      localStorage.removeItem("tb_access_token");
    }
    return { ok: true };
  },
};

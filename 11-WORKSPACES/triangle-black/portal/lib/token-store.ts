// @ts-nocheck
// Triangle Black - Token Store (backward-compat shim)
// Program A - Task A1: Delegates to tokenManager
import { tokenManager } from "@/lib/auth/token-manager";

export const tokenStore = {
  get:     () => tokenManager.getToken(),
  set:     (t: string) => tokenManager.setToken(t),
  clear:   () => tokenManager.clearAll(),
  isValid: () => tokenManager.isAuthenticated(),
};

export async function devAutoLogin() {
  return tokenManager.devAutoLogin();
}

export default tokenStore;

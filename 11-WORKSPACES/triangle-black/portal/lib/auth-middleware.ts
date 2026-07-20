// @ts-nocheck
// API Middleware — adds auth headers to all requests
// In DEV mode: uses bypass token

const DEV_TOKEN = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true"
  ? "dev-bypass-token"
  : null;

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("tb_access_token") || DEV_TOKEN
    : DEV_TOKEN;

  if (!token) return { "Content-Type": "application/json" };

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export function isAuthenticated(): boolean {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return true;
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("tb_access_token");
}

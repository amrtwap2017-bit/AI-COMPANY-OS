// useAuthFetch — always reads fresh token, sends Authorization header
// Token is stored in localStorage as "tb_token" and cookie as "tb_token"

function getToken(): string {
  if (typeof window === "undefined") return "";
  // Try localStorage first
  const ls = localStorage.getItem("tb_token") || localStorage.getItem("tb_access_token");
  if (ls) return ls;
  // Fall back to cookie
  const match = document.cookie.match(/(?:^|;\s*)tb_token=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  const match2 = document.cookie.match(/(?:^|;\s*)tb_access_token=([^;]*)/);
  if (match2) return decodeURIComponent(match2[1]);
  return "";
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export function useAuthFetch() {
  return authFetch;
}

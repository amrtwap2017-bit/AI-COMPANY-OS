"use client"; // @ts-nocheck
/**
 * authFetch - Triangle Black authenticated fetch
 * Always sends auth token to backend
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Try token manager first
    const stored = localStorage.getItem("tb_token") ||
                   localStorage.getItem("access_token") ||
                   localStorage.getItem("token") ||
                   sessionStorage.getItem("tb_token") ||
                   sessionStorage.getItem("access_token");
    return stored;
  } catch {
    return null;
  }
}

export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  // Route API calls to backend
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth token
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const { tokenManager } = await import("@/lib/auth/token-manager");
    const tk = tokenManager.getToken();
    if (tk) headers["Authorization"] = `Bearer ${tk}`;
  } catch {}

  return fetch(url, {
    credentials: "include",
    redirect: "follow",
    ...options,
    headers,
  });
}

export async function authFetchJSON<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(path, options);
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const d = await response.json();
      detail = d.detail || d.message || detail;
    } catch {}
    throw new Error(`${response.status}: ${detail}`);
  }
  return response.json();
}

export function useAuthFetch() {
  return { authFetch, authFetchJSON };
}

export default authFetch;

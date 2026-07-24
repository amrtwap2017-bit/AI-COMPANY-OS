"use client"; // @ts-nocheck
/**
 * useAuthFetch — Triangle Black authentication fetch utilities
 * Exports: authFetch, authFetchJSON, useAuthFetch hook
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

function getFullUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/api/")) return `${API_BASE}${path}`;
  return `${API_BASE}${path}`;
}

async function getHeaders(extra: Record<string,string> = {}): Promise<Record<string,string>> {
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  try {
    const { tokenManager } = await import("@/lib/auth/token-manager");
    const token = tokenManager.getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  } catch {
    // No token manager — use cookies
  }
  return headers;
}

/**
 * authFetch — base fetch with auth headers, routes to backend
 */
export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getFullUrl(path);
  const headers = await getHeaders(options.headers as Record<string,string> || {});
  return fetch(url, {
    credentials: "include",
    redirect: "follow",
    ...options,
    headers,
  });
}

/**
 * authFetchJSON — fetch + auto parse JSON response
 */
export async function authFetchJSON<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(path, options);
  if (!response.ok) {
    let detail = response.statusText;
    try { const d = await response.json(); detail = d.detail || d.message || detail; } catch {}
    throw new Error(detail);
  }
  return response.json();
}

/**
 * useAuthFetch hook — returns authFetch bound to component
 */
export function useAuthFetch() {
  return { authFetch, authFetchJSON };
}

export default authFetch;

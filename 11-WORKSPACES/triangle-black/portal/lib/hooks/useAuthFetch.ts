"use client";
import { tokenManager } from "@/lib/auth/token-manager";

export async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = tokenManager.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = "Bearer " + token;

  return fetch(path, {
    redirect: "follow",
    ...options,
    headers,
    cache: "no-store",
  });
}

export async function authFetchJSON<T = any>(path: string, options?: RequestInit): Promise<T[]> {
  const res = await authFetch(path, options);
  if (!res.ok) return [];
  const d = await res.json();
  return Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
}

// Hook wrapper — makes { authFetch, authFetchJSON } available via useAuthFetch()
export function useAuthFetch() {
  return { authFetch, authFetchJSON };
}

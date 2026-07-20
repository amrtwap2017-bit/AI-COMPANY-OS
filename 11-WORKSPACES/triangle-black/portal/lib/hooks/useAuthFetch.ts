"use client";
import { tokenManager } from "@/lib/auth/token-manager";

export async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = tokenManager.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = "Bearer " + token;

  // Preserve the path exactly as provided.
  // Backend collection endpoints rely on trailing slashes:
  // /api/v1/work-orders/
  // /api/v1/technicians/
  // /api/v1/assets/
  // /api/v1/projects/
  // /api/v1/customers/
  // /api/v1/agents/
  return fetch(path, {
    ...options,
    headers,
    cache: "no-store",
  });
}

export async function authFetchJSON<T = any>(path: string, options?: RequestInit): Promise<T[]> {
  const res = await authFetch(path, options);
  if (!res.ok) return [];
  const d = await res.json();
  return Array.isArray(d) ? d : d?.items || d?.data || [];
}

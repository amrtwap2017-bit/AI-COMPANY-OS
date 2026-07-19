/**
 * Hub Dashboard — API Client
 * Thin wrapper around fetch pointing to AI Engine (port 8001)
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001") + "/api/v1/ai";

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return { data };
}

export const api = {
  get: <T = any>(path: string) =>
    request<T>(path, { method: "GET" }),

  post: <T = any>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T = any>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T = any>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

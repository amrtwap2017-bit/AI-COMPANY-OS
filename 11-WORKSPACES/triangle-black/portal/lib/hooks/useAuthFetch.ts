// Triangle Black - Auth Fetch Hook
// Single token source: tokenManager -> localStorage["tb_access_token"]
"use client";
import { tokenManager } from "@/lib/auth/token-manager";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // SSR guard — fetch not available on server side
  if (typeof window === "undefined") {
    return new Response(JSON.stringify({}), { status: 200 });
  }

  const token = tokenManager.getToken() || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Prepend API base if relative URL
  const fullUrl = url.startsWith("http") ? url : API_BASE + url;

  try {
    return await fetch(fullUrl, { ...options, headers });
  } catch (err) {
    console.warn("[authFetch] fetch failed for:", url, err);
    return new Response(JSON.stringify({ error: "Network error" }), { status: 503 });
  }
}

export function useAuthFetch() {
  return authFetch;
}

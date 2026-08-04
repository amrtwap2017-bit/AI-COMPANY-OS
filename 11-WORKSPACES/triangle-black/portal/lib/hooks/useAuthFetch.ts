// Triangle Black - Auth Fetch Hook
// Single token source: tokenManager -> localStorage["tb_access_token"]
import { tokenManager } from "@/lib/auth/token-manager";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

export async function authFetch(url: string, options: RequestInit = {
// Sprint-023 fix: prevent "Failed to fetch" on server-side or missing token
  if (typeof window === "undefined") {
    return new Response(JSON.stringify({}), { status: 200 });
  }
  const token = localStorage.getItem("tb_access_token");
  if (!token && !url.includes("/auth/login")) {
    console.warn("[authFetch] No token — skipping fetch for:", url);
    return new Response(JSON.stringify({}), { status: 401 });
  }
}): Promise<Response> {
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
  return fetch(fullUrl, { ...options, headers });
}

export function useAuthFetch() {
  return authFetch;
}

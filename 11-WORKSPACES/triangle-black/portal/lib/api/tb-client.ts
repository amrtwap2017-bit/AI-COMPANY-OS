// Triangle Black API Client — Authenticated
// All portal API calls go through this client

const API_BASE = "";  // Relative URL - routes through Next.js proxy
const SESSION_KEY = "tb_access_token";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return (
    sessionStorage.getItem(SESSION_KEY) ||
    localStorage.getItem(SESSION_KEY) ||
    localStorage.getItem("tb_access_token") ||
    ""
  );
}

interface FetchOptions {
  method?: string;
  body?: any;
  params?: Record<string, any>;
}

export async function tbFetch<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; ok: boolean; status: number }> {
  const token  = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = API_BASE + path;
  if (options.params) {
    const qs = new URLSearchParams(
      Object.entries(options.params)
        .filter(([,v]) => v !== undefined && v !== null && v !== "")
        .map(([k,v]) => [k, String(v)])
    ).toString();
    if (qs) url += "?" + qs;
  }

  try {
    const res = await fetch(url, {
      method:  options.method || "GET",
      headers,
      body:    options.body ? JSON.stringify(options.body) : undefined,
      cache:   "no-store",
    });

    if (res.status === 401) {
      return { data: null, error: "Unauthorized — please log in", ok: false, status: 401 };
    }
    if (res.status === 404) {
      return { data: null, error: "Not found", ok: false, status: 404 };
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { data: null, error: err.detail || `HTTP ${res.status}`, ok: false, status: res.status };
    }

    const data = await res.json();
    return { data: data as T, error: null, ok: true, status: res.status };
  } catch (e: any) {
    return { data: null, error: e.message || "Network error", ok: false, status: 0 };
  }
}

// Form-encoded for auth
export async function tbFormPost(
  path: string,
  fields: Record<string, string>
): Promise<{ data: any; error: string | null; ok: boolean }> {
  const form = new URLSearchParams(fields).toString();
  try {
    const res = await fetch(API_BASE + path, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form,
    });
    const data = await res.json().catch(() => ({}));
    return { data, error: res.ok ? null : (data.detail || `HTTP ${res.status}`), ok: res.ok };
  } catch (e: any) {
    return { data: null, error: e.message, ok: false };
  }
}

// Normalize list response (handles array, {items:[]}, {data:[]}, {results:[]})
export function toList<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items))   return data.items;
  if (Array.isArray(data.data))    return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.leads))   return data.leads;
  return [];
}

// Normalize pagination metadata
export function toPagination(data: any) {
  return {
    total:    data?.total    || data?.count    || 0,
    page:     data?.page     || data?.current_page || 1,
    limit:    data?.limit    || data?.per_page || 20,
    pages:    data?.pages    || data?.total_pages  || 1,
  };
}

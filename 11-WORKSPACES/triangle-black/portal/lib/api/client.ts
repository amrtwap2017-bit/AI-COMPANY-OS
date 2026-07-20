// @ts-nocheck
// Triangle Black - Enterprise API Client
// Program A - Task A1: Uses tokenManager (single token source)
import { tokenManager } from "@/lib/auth/token-manager";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030") + "/api/v1";

export interface ApiResponse<T> {
  data:     T;
  meta?:    { total: number; page: number; per_page: number };
  message?: string;
}

export interface ApiError {
  status:  number;
  message: string;
  detail?: string | Record<string, unknown>;
}

export class TBApiError extends Error {
  status:  number;
  detail?: string | Record<string, unknown>;
  constructor(status: number, message: string, detail?: string | Record<string, unknown>) {
    super(message);
    this.name   = "TBApiError";
    this.status  = status;
    this.detail  = detail;
  }
}

export function setAccessToken(token: string | null): void {
  if (token) tokenManager.setToken(token);
  else tokenManager.clearAll();
}

export function getAccessToken(): string | null {
  return tokenManager.getToken();
}

export function clearTokens(): void {
  tokenManager.clearAll();
}

interface RequestOptions {
  method?:  "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?:    unknown;
  params?:  Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?:  AbortSignal;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, headers = {}, signal } = options;
  const url = new URL(API_BASE + endpoint);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const token = tokenManager.getToken();
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept":       "application/json",
    ...headers,
  };
  if (token) reqHeaders["Authorization"] = "Bearer " + token;

  const response = await fetch(url.toString(), {
    method,
    headers: reqHeaders,
    body:    body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 401) throw new TBApiError(401, "Session expired. Please log in again.");
  if (response.status === 403) throw new TBApiError(403, "Access denied. Insufficient permissions.");
  if (!response.ok) {
    let detail: string | Record<string, unknown> | undefined;
    try   { detail = (await response.json()).detail; }
    catch { detail = await response.text(); }
    throw new TBApiError(response.status, "API Error " + response.status, detail);
  }
  if (response.status === 204) return undefined as T;
  try   { return await response.json() as T; }
  catch { throw new TBApiError(500, "Invalid JSON response from server"); }
}

export const api = {
  get<T = any>(endpoint: string, options?: Omit<RequestOptions, "method"|"body">): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T = any>(endpoint: string, body: unknown, options?: Omit<RequestOptions, "method"|"body">): Promise<T> {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },
  put<T = any>(endpoint: string, body: unknown, options?: Omit<RequestOptions, "method"|"body">): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PUT", body });
  },
  patch<T = any>(endpoint: string, body: unknown, options?: Omit<RequestOptions, "method"|"body">): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },
  delete<T = any>(endpoint: string, options?: Omit<RequestOptions, "method"|"body">): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};

export function buildParams(
  obj: Record<string, string | number | boolean | null | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") result[k] = String(v);
  });
  return result;
}

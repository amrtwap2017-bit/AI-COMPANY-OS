// @ts-nocheck
// Triangle Black - Safe API Wrapper
// Program A - Task A1: Uses tokenManager
// FIXED: notifications() was calling leads/search - now calls /api/v1/notifications/
"use client";
import { tokenManager } from "@/lib/auth/token-manager";

// Use relative URL so calls go through Next.js proxy rewrite
// next.config.ts: /api/v1/* -> http://localhost:8030/api/v1/*
const API_URL = "";  // Relative URL - routes through Next.js proxy

export async function safeFetch(path: string, options?: RequestInit): Promise<any> {
  const token = tokenManager.getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  try {
    const res = await fetch(API_URL + path, {
      ...options,
      headers: { ...headers, ...((options?.headers as Record<string,string>) || {}) },
      cache: "no-store",
    });
    if (res.status === 404) return { ok: false, data: [], error: "Not found",    status: 404 };
    if (res.status === 401) return { ok: false, data: [], error: "Unauthorized", status: 401 };
    if (!res.ok)            return { ok: false, data: [], error: "HTTP " + res.status, status: res.status };
    const data = await res.json();
    return { ok: true, data, error: null };
  } catch (e) {
    return { ok: false, data: [], error: String(e), status: 0 };
  }
}

export function toList(result: any): any[] {
  if (!result) return [];
  const d = result?.data ?? result;
  if (Array.isArray(d))          return d;
  if (Array.isArray(d?.items))   return d.items;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data))    return d.data;
  return [];
}

export const safeApi = {
  leads:            () => safeFetch("/api/v1/actions/leads/search"),
  leadCreate:       (d: any) => safeFetch("/api/v1/actions/leads/create", { method: "POST", body: JSON.stringify(d) }),
  leadGet:          (id: string) => safeFetch("/api/v1/actions/leads/" + id),
  leadTimeline:     (id: string) => safeFetch("/api/v1/actions/leads/" + id + "/timeline"),
  pipelineSummary:  () => safeFetch("/api/v1/actions/pipeline/summary"),
  dashboardStats:   () => safeFetch("/api/v1/actions/dashboard/stats"),
  serviceOps:       () => safeFetch("/api/v1/actions/dashboard/service-ops"),
  inventory:        () => safeFetch("/api/v1/actions/inventory/dashboard"),
  stockBalances:    () => safeFetch("/api/v1/actions/inventory/stock-balances"),
  lowStock:         () => safeFetch("/api/v1/actions/inventory/low-stock"),
  purchaseOrders:   () => safeFetch("/api/v1/actions/procurement/dashboard"),
  rfqs:             () => safeFetch("/api/v1/actions/procurement/rfqs"),
  agentLeaderboard: () => safeFetch("/api/v1/actions/reports/agent-leaderboard"),
  reportDashboard:  () => safeFetch("/api/v1/actions/reports/dashboard"),
  notifications:    (limit = 20) => safeFetch("/api/v1/notifications/?limit=" + limit),
  markRead:         (id: string) => safeFetch("/api/v1/notifications/" + id + "/read", { method: "PATCH" }),
  markAllRead:      () => safeFetch("/api/v1/notifications/bulk-read", { method: "POST" }),
  unreadCount:      () => safeFetch("/api/v1/notifications/unread-count"),
};

export default safeApi;

"use client";
// @ts-nocheck
// Safe API — maps portal needs to REAL TB Admin routes
// TB Admin base: /api/v1/actions/* and /api/v1/*

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tb_access_token") || "";
}

export async function safeFetch(path: string, options?: any): Promise<any> {
  const token = getToken();
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(API_URL + path, {
      ...options,
      headers: { ...headers, ...options?.headers },
      cache: "no-store",
    });
    if (res.status === 404) return { ok: false, data: [], error: "Not found", status: 404 };
    if (res.status === 401) return { ok: false, data: [], error: "Unauthorized", status: 401 };
    if (!res.ok) return { ok: false, data: [], error: `HTTP ${res.status}`, status: res.status };
    const data = await res.json();
    return { ok: true, data, error: null };
  } catch (e) {
    return { ok: false, data: [], error: String(e), status: 0 };
  }
}

export function toList(result: any): any[] {
  if (!result) return [];
  const d = result?.data ?? result;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

// ── REAL TB Admin API routes (from /openapi.json audit) ──────
export const safeApi = {
  // Leads — /api/v1/actions/leads/
  leads:           () => safeFetch("/api/v1/actions/leads/search"),
  leadCreate:      (data: any) => safeFetch("/api/v1/actions/leads/create", { method: "POST", body: JSON.stringify(data) }),
  leadGet:         (id: string) => safeFetch(`/api/v1/actions/leads/${id}`),
  leadTimeline:    (id: string) => safeFetch(`/api/v1/actions/leads/${id}/timeline`),
  pipelineSummary: () => safeFetch("/api/v1/actions/pipeline/summary"),

  // Dashboard stats
  dashboardStats:  () => safeFetch("/api/v1/actions/dashboard/stats"),
  serviceOps:      () => safeFetch("/api/v1/actions/dashboard/service-ops"),

  // Inventory
  inventory:       () => safeFetch("/api/v1/actions/inventory/dashboard"),
  stockBalances:   () => safeFetch("/api/v1/actions/inventory/stock-balances"),
  lowStock:        () => safeFetch("/api/v1/actions/inventory/low-stock"),

  // Procurement
  purchaseOrders:  () => safeFetch("/api/v1/actions/procurement/dashboard"),
  rfqs:            () => safeFetch("/api/v1/actions/procurement/rfqs"),

  // Quotes
  quotes:          (id: string) => safeFetch(`/api/v1/actions/quotes/${id}`),

  // Reports
  agentLeaderboard:() => safeFetch("/api/v1/actions/reports/agent-leaderboard"),
  reportDashboard: () => safeFetch("/api/v1/actions/reports/dashboard"),

  // Notifications
  notifications:   () => safeFetch("/api/v1/actions/leads/search"),
};

export default safeApi;

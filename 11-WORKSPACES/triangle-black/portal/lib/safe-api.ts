// @ts-nocheck
// Safe Enterprise API — never throws, always returns graceful data
// Handles 404, 401, network errors → returns empty arrays/objects

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tb_access_token") || "";
}

async function safeFetch(path: string, fallback: any = null) {
  const token = getToken();
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(API_URL + path, { headers, cache: "no-store" });
    if (res.status === 404) return fallback ?? { ok: false, error: "Not found", data: [] };
    if (res.status === 401) return fallback ?? { ok: false, error: "Unauthorized", data: [] };
    if (!res.ok) return fallback ?? { ok: false, error: `HTTP ${res.status}`, data: [] };
    const data = await res.json();
    return { ok: true, data, error: null };
  } catch (e) {
    return fallback ?? { ok: false, error: String(e), data: [] };
  }
}

function toList(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.items)) return result.items;
  if (result.data && typeof result.data === "object") {
    const vals = Object.values(result.data);
    if (vals.length && Array.isArray(vals[0])) return vals[0] as any[];
  }
  return [];
}

// ── API endpoints ─────────────────────────────────────────
export const safeApi = {
  // Commercial
  leads:          () => safeFetch("/api/v1/leads"),
  customers:      () => safeFetch("/api/v1/customers"),
  contracts:      () => safeFetch("/api/v1/contracts"),
  invoices:       () => safeFetch("/api/v1/invoices"),
  quotes:         () => safeFetch("/api/v1/quotes"),

  // Operations
  workOrders:     () => safeFetch("/api/v1/work-orders"),
  serviceRequests:() => safeFetch("/api/v1/service-requests"),
  technicians:    () => safeFetch("/api/v1/technicians"),

  // Assets & Maintenance
  assets:         () => safeFetch("/api/v1/assets"),
  pmPlans:        () => safeFetch("/api/v1/pm-plans"),

  // Supply Chain
  inventory:      () => safeFetch("/api/v1/inventory"),
  warehouses:     () => safeFetch("/api/v1/warehouses"),
  purchaseOrders: () => safeFetch("/api/v1/purchase-orders"),
  suppliers:      () => safeFetch("/api/v1/suppliers"),
  rfqs:           () => safeFetch("/api/v1/rfqs"),

  // Analytics
  analytics:      () => safeFetch("/api/v1/analytics"),
  kpis:           () => safeFetch("/api/v1/analytics/kpis"),

  // Generic
  get: (path: string) => safeFetch(path),
  toList,
};

export { safeFetch, toList };

// @ts-nocheck
// Triangle Black Enterprise API
// All routes go through Next.js proxy -> TB Admin
// Always use trailing slash for collection endpoints
import { safeFetch, toList } from "./safe-api";

export type SafeApiResult = {
  ok:    boolean;
  data:  any;
  error: string | null;
};

async function safeGet(path: string): Promise<SafeApiResult> {
  const r = await safeFetch(path);
  return r || { ok: false, data: null, error: "No response" };
}

export const enterpriseApi = {
  operations: {
    workOrders:      () => safeGet("/api/v1/work-orders/"),
    technicians:     () => safeGet("/api/v1/technicians/"),
    serviceRequests: () => safeGet("/api/v1/service-requests/"),
  },
  maintenance: {
    assets:    () => safeGet("/api/v1/assets/"),
    pmPlans:   () => safeGet("/api/v1/maintenance/pm-plans"),
    schedules: () => safeGet("/api/v1/maintenance/schedule"),
    dashboard: () => safeGet("/api/v1/maintenance/dashboard"),
  },
  commercial: {
    leads:     () => safeGet("/api/v1/actions/leads/search"),
    contracts: () => safeGet("/api/v1/contracts/"),
    invoices:  () => safeGet("/api/v1/invoices/"),
    customers: () => safeGet("/api/v1/customers/"),
    agents:    () => safeGet("/api/v1/agents/"),
  },
  supplyChain: {
    inventory:      () => safeGet("/api/v1/inventory/items/"),
    warehouses:     () => safeGet("/api/v1/inventory/warehouses/"),
    purchaseOrders: () => safeGet("/api/v1/inventory/purchase-orders/"),
    suppliers:      () => safeGet("/api/v1/inventory/vendors/"),
  },
  executive: {
    kpis:      () => safeGet("/api/v1/analytics/kpis"),
    dashboard: () => safeGet("/api/v1/actions/executive/dashboard"),
    alerts:    () => safeGet("/api/v1/actions/executive/alerts/predictive"),
  },
  projects: {
    list:      () => safeGet("/api/v1/projects/"),
    dashboard: () => safeGet("/api/v1/projects/dashboard"),
  },
};

export { toList };

// Backward compat
export const apiJson = safeFetch;
export const safeApiJson = safeFetch;

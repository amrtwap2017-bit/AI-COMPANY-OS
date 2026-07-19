/**
 * Triangle Black — Master API Barrel
 * Single source of truth for all API imports across the portal.
 */

export { api as default, api, setAccessToken, getAccessToken, clearTokens, buildParams, TBApiError } from "./api/client";
export type { ApiResponse, ApiError } from "./api/client";
export { authApi }                                             from "./api/auth";
export { contractsApi, invoicesApi, customersApi, leadsApi }   from "./api/commercial";
export type { Contract, Invoice, Customer, Lead }              from "./api/commercial";
export { workOrdersApi, techniciansApi, serviceRequestsApi, sitesApi } from "./api/operations";
export type { WorkOrder, Technician, ServiceRequest, ListResponse, WOStatus, WorkOrderCreate } from "./api/operations";
export { assetsApi, pmPlansApi }                               from "./api/maintenance";
export type { Asset, PMPlan }                                  from "./api/maintenance";
export { purchaseOrdersApi, suppliersApi, inventoryApi, rfqsApi } from "./api/supply-chain";
export type { PurchaseOrder, Supplier, InventoryItem }         from "./api/supply-chain";
export { analyticsApi, executiveApi }                          from "./api/analytics";
export { workflowsApi }                                        from "./api/workflows";

export interface ListParams {
  page?:   number;
  limit?:  number;
  search?: string;
  status?: string;
  sort?:   string;
  order?:  "asc" | "desc";
  [key: string]: string | number | boolean | undefined | null;
}

export interface LoginRequest { email: string; password: string; }

import { api as _a } from "./api/client";

// ─── Dashboard API ────────────────────────────────────────────────
export const dashboardApi = {
  summary:   () => _a.get<any>("/actions/dashboard/stats"),
  serviceOps:() => _a.get<any>("/actions/dashboard/service-ops"),
};

// ─── Quotes API ───────────────────────────────────────────────────
export const quotesApi = {
  list:    (p?: any) => _a.get<any>("/quotes/", { params: p }),
  get:     (id: string) => _a.get<any>(`/quotes/${id}`),
  create:  (d: any)  => _a.post<any>("/quotes/", d),
  submit:  (id: string) => _a.post<any>(`/actions/quotes/${id}/submit`),
  send:    (id: string) => _a.post<any>(`/actions/quotes/${id}/send`),
  approve: (id: string) => _a.post<any>(`/actions/quotes/${id}/approve`),
  reject:  (id: string) => _a.post<any>(`/actions/quotes/${id}/reject`),
  pdf:     (id: string) => _a.get<any>(`/actions/quotes/${id}/pdf`),
};

// ─── PDF API ──────────────────────────────────────────────────────
export const pdfApi = {
  quote:    (id: string) => _a.get<any>(`/actions/quotes/${id}/pdf`),
  contract: (id: string) => _a.get<any>(`/actions/contracts/${id}/pdf`),
  invoice:  (id: string) => _a.get<any>(`/actions/invoices/${id}/pdf`),
};

// ─── Reports API ──────────────────────────────────────────────────
export const reportsApi = {
  list:          (p?: any) => _a.get<any>("/reports/", { params: p }),
  revenueTrend:  () => _a.get<any>("/actions/reports/revenue-trend"),
  leadFunnel:    () => _a.get<any>("/actions/reports/lead-funnel"),
  agentLeaderboard: () => _a.get<any>("/actions/reports/agent-leaderboard"),
  dashboard:     () => _a.get<any>("/actions/reports/dashboard"),
};

// ─── Agents API ───────────────────────────────────────────────────
export const agentsApi = {
  list:        (p?: any) => _a.get<any>("/agents/", { params: p }),
  get:         (id: string) => _a.get<any>(`/agents/${id}`),
  create:      (d: any)  => _a.post<any>("/actions/agents/create", d),
  leads:       (id: string) => _a.get<any>(`/actions/agents/${id}/leads`),
  performance: (id: string) => _a.get<any>(`/actions/agents/${id}/performance`),
};

// ─── Search API ───────────────────────────────────────────────────
export const searchApi = {
  leads:   (q: string) => _a.get<any>("/actions/leads/search", { params: { q } }),
  global:  (q: string) => _a.get<any>("/searches/", { params: { q } }),
};

// ─── Service Ops API ──────────────────────────────────────────────
export const serviceOpsApi = {
  workOrders:   { list: (p?: any) => _a.get<any>("/work-orders/", { params: p }), get: (id: string) => _a.get<any>(`/work-orders/${id}`), assign: (woId: string, techId: string) => _a.post<any>(`/actions/work-orders/${woId}/assign`, { technician_id: techId }), complete: (woId: string) => _a.post<any>(`/actions/work-orders/${woId}/complete`) },
  technicians:  { list: (p?: any) => _a.get<any>("/technicians/", { params: p }), get: (id: string) => _a.get<any>(`/technicians/${id}`), create: (d: any) => _a.post<any>("/technicians/", d) },
  assets:       { list: (p?: any) => _a.get<any>("/assets/", { params: p }) },
  serviceRequests: { list: (p?: any) => _a.get<any>("/service-requests/", { params: p }) },
  warehouses:   { list: (p?: any) => _a.get<any>("/warehouses/", { params: p }), create: (d: any) => _a.post<any>("/warehouses/", d) },
  inventory:    { getItems: (p?: any) => _a.get<any>("/inventory-items/", { params: p }), createItem: (d: any) => _a.post<any>("/inventory-items/", d), getInventoryDashboard: () => _a.get<any>("/actions/inventory/dashboard"), getLowStock: () => _a.get<any>("/actions/inventory/low-stock") },
  purchaseOrders: { getPurchaseOrders: (p?: any) => _a.get<any>("/purchase-orders/", { params: p }), approvePO: (id: string) => _a.post<any>(`/actions/inventory/purchase-requests/${id}/approve`) },
  purchaseRequests: { getPurchaseRequests: (p?: any) => _a.get<any>("/purchase-requests/", { params: p }), createPurchaseRequest: (d: any) => _a.post<any>("/purchase-requests/", d), approvePR: (id: string) => _a.post<any>(`/purchase-requests/${id}/approve`), convertPRtoPO: (id: string) => _a.post<any>(`/purchase-requests/${id}/convert`) },
  vendors: { getVendors: (p?: any) => _a.get<any>("/inventory-vendors/", { params: p }), createVendor: (d: any) => _a.post<any>("/inventory-vendors/", d) },
};

// ─── Notifications API ────────────────────────────────────────────
export const notificationsApi = {
  list:          (limit = 20) => _a.get<any>(`/notifications/?limit=${limit}`),
  markRead:      (id: string) => _a.patch<any>(`/notifications/${id}/read`),
  markAllRead:   ()           => _a.post<any>("/notifications/bulk-read"),
  unreadCount:   ()           => _a.get<any>("/notifications/unread-count"),
  getUnreadCount:()           => _a.get<any>("/notifications/unread-count"),
};

// ─── Extended contractsApi methods ───────────────────────────────
import { contractsApi as _cApi } from "./api/commercial";
export const extendedContractsApi = {
  ..._cApi,
  activate: (id: string) => _a.post<any>(`/contracts/${id}/activate`),
  renew:    (id: string) => _a.post<any>(`/contracts/${id}/renew`),
};

// ─── Extended leadsApi methods ────────────────────────────────────
import { leadsApi as _lApi } from "./api/commercial";
export const extendedLeadsApi = {
  ..._lApi,
  update:       (id: string, d: any) => _a.put<any>(`/actions/leads/${id}`, d),
  timeline:     (id: string) => _a.get<any>(`/actions/leads/${id}/timeline`),
  qualify:      (id: string) => _a.post<any>(`/actions/leads/${id}/qualify`),
  assign:       (id: string, agentId: string) => _a.post<any>(`/actions/leads/${id}/assign`, { agent_id: agentId }),
  generateQuote:(id: string) => _a.post<any>(`/actions/leads/${id}/quote`),
};

// ─── Extended invoicesApi methods ─────────────────────────────────
import { invoicesApi as _iApi } from "./api/commercial";
export const extendedInvoicesApi = {
  ..._iApi,
  send:    (id: string) => _a.post<any>(`/invoices/${id}/send`),
  markPaid:(id: string) => _a.post<any>(`/invoices/${id}/mark-paid`),
};

// ─── scApi (supply chain page compatibility) ──────────────────────
export const scApi = {
  kpis:     () => _a.get<any>("/actions/inventory/dashboard"),
  pos:      (p?: any) => _a.get<any>("/purchase-orders/", { params: p }),
  vendors:  (p?: any) => _a.get<any>("/inventory-vendors/", { params: p }),
  purchaseRequests: { list: (skip = 0, limit = 25) => _a.get<any>(`/purchase-requests/?skip=${skip}&limit=${limit}`), get: (id: string) => _a.get<any>(`/purchase-requests/${id}`), create: (d: any) => _a.post<any>("/purchase-requests/", d), update: (id: string, d: any) => _a.put<any>(`/purchase-requests/${id}`, d), approve: (id: string) => _a.post<any>(`/purchase-requests/${id}/approve`) },
  rfqs:     { list: (skip = 0, limit = 25) => _a.get<any>(`/rfqs/?skip=${skip}&limit=${limit}`), get: (id: string) => _a.get<any>(`/rfqs/${id}`) },
  goodsReceipts: { list: (skip = 0, limit = 25) => _a.get<any>(`/goods-receipts/?skip=${skip}&limit=${limit}`) },
  warehouses: { list: (skip = 0, limit = 25) => _a.get<any>(`/warehouses/?skip=${skip}&limit=${limit}`) },
};

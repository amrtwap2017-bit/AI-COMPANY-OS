// Triangle Black — Supply Chain API Client
import { safeApiJson } from "./enterprise-api";

// Response shape normalizer
// PR/PO/RFQ/GRN return {items:[], count:N}
// Inventory/Warehouse return plain []
export function extractList(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function extractCount(data: any): number {
  if (!data) return 0;
  if (typeof data?.count === "number") return data.count;
  if (Array.isArray(data)) return data.length;
  return 0;
}

export const scApi = {
  purchaseRequests: {
    list: (skip=0, limit=50) => safeApiJson(`/purchase-requests/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/purchase-requests/${id}`),
    create: (body: any)      => safeApiJson("/purchase-requests/", { method:"POST", body:JSON.stringify(body) }),
    update: (id: string, body: any) => safeApiJson(`/purchase-requests/${id}`, { method:"PATCH", body:JSON.stringify(body) }),
    approve:(id: string)     => safeApiJson(`/purchase-requests/${id}/approve`, { method:"POST", body:"{}" }),
  },
  purchaseOrders: {
    list: (skip=0, limit=50) => safeApiJson(`/purchase-orders/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/purchase-orders/${id}`),
    create: (body: any)      => safeApiJson("/purchase-orders/", { method:"POST", body:JSON.stringify(body) }),
    update: (id: string, body: any) => safeApiJson(`/purchase-orders/${id}`, { method:"PATCH", body:JSON.stringify(body) }),
    approve:(id: string)     => safeApiJson(`/purchase-orders/${id}/approve`, { method:"POST", body:"{}" }),
    lines:  (id: string)     => safeApiJson(`/purchase-orders/${id}/lines`),
  },
  rfqs: {
    list: (skip=0, limit=50) => safeApiJson(`/rfqs/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/rfqs/${id}`),
    create: (body: any)      => safeApiJson("/rfqs/", { method:"POST", body:JSON.stringify(body) }),
    lines:  (id: string)     => safeApiJson(`/rfqs/${id}/lines`),
    suppliers:(id:string)    => safeApiJson(`/rfqs/${id}/suppliers`),
    quotations:(id:string)   => safeApiJson(`/rfqs/${id}/quotations`),
    comparison:(id:string)   => safeApiJson(`/rfqs/${id}/comparison`),
  },
  suppliers: {
    list: (skip=0, limit=50) => safeApiJson(`/suppliers/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/suppliers/${id}`),
    create: (body: any)      => safeApiJson("/suppliers/", { method:"POST", body:JSON.stringify(body) }),
    update: (id: string, body: any) => safeApiJson(`/suppliers/${id}`, { method:"PATCH", body:JSON.stringify(body) }),
    documents:(id:string)    => safeApiJson(`/suppliers/${id}/documents`),
    scorecards:(id:string)   => safeApiJson(`/suppliers/${id}/scorecards`),
  },
  supplierInvoices: {
    list: (skip=0, limit=50) => safeApiJson(`/supplier-invoices/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/supplier-invoices/${id}`),
    create: (body: any)      => safeApiJson("/supplier-invoices/", { method:"POST", body:JSON.stringify(body) }),
    update: (id: string, body: any) => safeApiJson(`/supplier-invoices/${id}`, { method:"PATCH", body:JSON.stringify(body) }),
    match:  (id: string, body: any) => safeApiJson(`/supplier-invoices/${id}/match`, { method:"POST", body:JSON.stringify(body) }),
    matches:(id: string)     => safeApiJson(`/supplier-invoices/${id}/matches`),
  },
  goodsReceipts: {
    list: (skip=0, limit=50) => safeApiJson(`/goods-receipts/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/goods-receipts/${id}`),
    create: (body: any)      => safeApiJson("/goods-receipts/", { method:"POST", body:JSON.stringify(body) }),
    receive:(id: string)     => safeApiJson(`/goods-receipts/${id}/receive`, { method:"POST", body:"{}" }),
    lines:  (id: string)     => safeApiJson(`/goods-receipts/${id}/lines`),
  },
  inventory: {
    list: (skip=0, limit=50) => safeApiJson(`/inventory/items/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/inventory/items/${id}`),
    create: (body: any)      => safeApiJson("/inventory/items/", { method:"POST", body:JSON.stringify(body) }),
    update: (id: string, body: any) => safeApiJson(`/inventory/items/${id}`, { method:"PATCH", body:JSON.stringify(body) }),
  },
  warehouses: {
    list: (skip=0, limit=50) => safeApiJson(`/warehouses/?skip=${skip}&limit=${limit}`),
    get:  (id: string)       => safeApiJson(`/warehouses/${id}`),
    create: (body: any)      => safeApiJson("/warehouses/", { method:"POST", body:JSON.stringify(body) }),
  },
};

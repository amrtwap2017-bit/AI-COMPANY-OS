/**
 * Inventory / supply-chain APIs — aligned to /inventory/* backend routes.
 */
import { api, buildParams } from "./api/client";

export interface PurchaseOrder {
  id: string;
  hotel_id: string;
  po_number: string;
  vendor_id: string;
  vendor?: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  expected_date?: string | null;
}

export interface PurchaseRequest {
  id: string;
  hotel_id: string;
  pr_number: string;
  title?: string;
  requester: string;
  requested_by?: string;
  status: string;
  urgency: string;
  priority?: string;
  department?: string | null;
  justification?: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  hotel_id: string;
  item_code: string;
  sku?: string;
  name: string;
  category: string;
  standard_cost: number;
  unit_price?: number;
  is_active: boolean;
}

export interface Vendor {
  id: string;
  hotel_id: string;
  vendor_code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  category?: string | null;
  is_active: boolean;
}

export interface ListParams {
  skip?: number;
  limit?: number;
  status?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined | null;
}

function asList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

export const purchaseOrdersApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<PurchaseOrder[]>("/inventory/purchase-orders/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<PurchaseOrder>(res).map((po) => ({
      ...po,
      vendor: po.vendor ?? po.vendor_id ?? null,
    }));
  },
};

export const purchaseRequestsApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<PurchaseRequest[]>("/inventory/purchase-requests/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<PurchaseRequest>(res).map((pr) => ({
      ...pr,
      title: pr.title ?? pr.justification ?? pr.pr_number,
      requested_by: pr.requested_by ?? pr.requester,
      priority: pr.priority ?? pr.urgency,
    }));
  },
};

export const inventoryApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<InventoryItem[]>("/inventory/items/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<InventoryItem>(res).map((item) => ({
      ...item,
      sku: item.sku ?? item.item_code,
      unit_price: item.unit_price ?? item.standard_cost,
    }));
  },
};

export const vendorsApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<Vendor[]>("/inventory/vendors/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<Vendor>(res);
  },
};

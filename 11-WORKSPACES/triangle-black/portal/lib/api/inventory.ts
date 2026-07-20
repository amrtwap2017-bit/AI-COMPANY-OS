// @ts-nocheck
import { tbFetch, toList } from "./tb-client";

export const inventoryApi = {
  async dashboard() {
    return tbFetch("/api/v1/actions/inventory/dashboard");
  },

  async stockBalances(params?: { warehouse_id?: string }) {
    const r = await tbFetch("/api/v1/actions/inventory/stock-balances", { params });
    return { data: toList(r.data?.stock_balances || r.data), ...r };
  },

  async lowStock() {
    const r = await tbFetch("/api/v1/actions/inventory/low-stock");
    return { data: toList(r.data?.items || r.data), ...r };
  },

  async adjust(itemId: string, quantity: number, reason: string) {
    return tbFetch("/api/v1/actions/inventory/adjust", {
      method: "POST",
      body: { item_id: itemId, quantity, reason },
    });
  },

  async rebuildBalances() {
    return tbFetch("/api/v1/actions/inventory/rebuild-balances", { method: "POST" });
  },

  async purchaseOrders(params?: { status?: string; limit?: number }) {
    const r = await tbFetch("/api/v1/actions/inventory/purchase-orders", { params });
    return { data: toList(r.data?.items || r.data), ...r };
  },

  async purchaseRequests(params?: { status?: string }) {
    const r = await tbFetch("/api/v1/actions/inventory/purchase-requests", { params });
    return { data: toList(r.data?.items || r.data), ...r };
  },

  async approvePO(poId: string) {
    return tbFetch(`/api/v1/actions/inventory/purchase-orders/${poId}/approve`, {
      method: "POST",
    });
  },

  async approvePR(prId: string) {
    return tbFetch(`/api/v1/actions/inventory/purchase-requests/${prId}/approve`, {
      method: "POST",
    });
  },
};

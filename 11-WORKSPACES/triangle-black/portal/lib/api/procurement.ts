import { tbFetch, toList } from "./tb-client";

export const procurementApi = {
  async dashboard() {
    return tbFetch("/api/v1/actions/procurement/dashboard");
  },

  async rfqs(params?: { status?: string; limit?: number }) {
    const r = await tbFetch("/api/v1/actions/procurement/rfqs", { params });
    return { data: toList(r.data?.rfqs || r.data), ...r };
  },

  async createRFQ(data: any) {
    return tbFetch("/api/v1/actions/procurement/rfqs", {
      method: "POST", body: data,
    });
  },

  async compareRFQ(rfqId: string) {
    return tbFetch(`/api/v1/actions/procurement/rfqs/${rfqId}/compare`);
  },

  async awardRFQ(rfqId: string, vendorQuoteId: string) {
    return tbFetch(`/api/v1/actions/procurement/rfqs/${rfqId}/award/${vendorQuoteId}`, {
      method: "POST",
    });
  },

  async vendorScorecard(vendorId: string) {
    return tbFetch(`/api/v1/actions/procurement/vendors/${vendorId}/scorecard`);
  },

  async receiveGoods(grnId: string, data: any) {
    return tbFetch(`/api/v1/actions/procurement/goods-receipts/${grnId}/receive`, {
      method: "POST", body: data,
    });
  },

  async convertPRtoPO(prId: string, data: any) {
    return tbFetch(`/api/v1/actions/procurement/purchase-requests/${prId}/convert-to-po`, {
      method: "POST", body: data,
    });
  },

  async events(entityType: string, entityId: string) {
    return tbFetch(`/api/v1/actions/procurement/events/${entityType}/${entityId}`);
  },
};

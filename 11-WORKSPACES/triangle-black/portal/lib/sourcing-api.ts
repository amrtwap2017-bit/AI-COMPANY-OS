import { getAccessToken } from "./api/client";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8030/api/v1";

function authHeaders() {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }
  const token = getAccessToken() || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(res: Response) {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "detail" in data
        ? String((data as any).detail)
        : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

export const sourcingApi = {
  listRfqs: async (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    q.set("limit", "200");
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const res = await fetch(`${BASE}/rfqs/?${q.toString()}`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  getRfq: async (id: string) => {
    const res = await fetch(`${BASE}/rfqs/${id}`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  createRfq: async (data: any) => {
    const res = await fetch(`${BASE}/rfqs/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  getRfqLines: async (id: string) => {
    const res = await fetch(`${BASE}/rfqs/${id}/lines`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  inviteSupplier: async (rfqId: string, supplierId: string) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/invite-supplier`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ supplier_id: supplierId }),
    });
    return parseResponse(res);
  },

  getInvitedSuppliers: async (rfqId: string) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/suppliers`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  createQuotation: async (rfqId: string, data: any) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/quotations`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  listQuotations: async (rfqId: string) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/quotations`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  getComparison: async (rfqId: string) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/comparison`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  saveComparison: async (rfqId: string, data: any) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/comparison`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  listNegotiations: async (rfqId: string) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/negotiations`, { headers: authHeaders(), cache: "no-store" });
    return parseResponse(res);
  },

  addNegotiation: async (rfqId: string, data: any) => {
    const res = await fetch(`${BASE}/rfqs/${rfqId}/negotiations`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },
};

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

export const supplyIntelligenceApi = {
  spend: async () => {
    const res = await fetch(`${BASE}/supply-intelligence/spend`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  vendorPerformance: async () => {
    const res = await fetch(`${BASE}/supply-intelligence/vendor-performance`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  risk: async () => {
    const res = await fetch(`${BASE}/supply-intelligence/risk`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  listFrameworkAgreements: async () => {
    const res = await fetch(`${BASE}/supply-intelligence/framework-agreements`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  createFrameworkAgreement: async (data: any) => {
    const res = await fetch(`${BASE}/supply-intelligence/framework-agreements`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  listPriceLists: async () => {
    const res = await fetch(`${BASE}/supply-intelligence/price-lists`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  createPriceList: async (data: any) => {
    const res = await fetch(`${BASE}/supply-intelligence/price-lists`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  listCatalogs: async () => {
    const res = await fetch(`${BASE}/supply-intelligence/catalogs`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  createCatalog: async (data: any) => {
    const res = await fetch(`${BASE}/supply-intelligence/catalogs`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },
};

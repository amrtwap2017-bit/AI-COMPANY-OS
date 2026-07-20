// @ts-nocheck
import { getAccessToken } from "./api/client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8030/api/v1";

export type SafeApiResult<T = any> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number | null;
};

function getToken() {
  if (typeof window === "undefined") return "";
  return getAccessToken() || "";
}

function baseHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export async function apiJson(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...baseHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data && "detail" in data
        ? String((data as any).detail)
        : typeof data === "string"
          ? data
          : `${res.status} ${res.statusText}`;

    const err = new Error(detail);
    (err as any).status = res.status;
    throw err;
  }

  return data;
}

export async function safeApiJson<T = any>(path: string, init?: RequestInit): Promise<SafeApiResult<T>> {
  try {
    const data = await apiJson(path, init);
    return { ok: true, data, error: null, status: 200 };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: toErrorMessage(error),
      status: (error as any)?.status ?? null,
    };
  }
}

export const enterpriseApi = {
  executive: {
    summary: () => safeApiJson("/actions/reports/dashboard"),
    pipeline: () => safeApiJson("/actions/pipeline/summary"),
    contracts: () => safeApiJson("/contracts/?limit=5"),
  },
  commercial: {
    leads: () => safeApiJson("/leads/?limit=20"),
    quotes: () => safeApiJson("/quotes/?limit=20"),
    contracts: () => safeApiJson("/contracts/?limit=20"),
  },
  operations: {
    workOrders: () => safeApiJson("/work-orders/"),
    technicians: () => safeApiJson("/technicians/"),
    serviceRequests: () => safeApiJson("/service-requests/"),
    serviceReports: () => safeApiJson("/service-reports/"),
  },
  supplyChain: {
    inventoryDashboard: () => safeApiJson("/actions/inventory/dashboard"),
    items: () => safeApiJson("/inventory/items/?skip=0&limit=20"),
    vendors: () => safeApiJson("/inventory/vendors/"),
    purchaseRequests: () => safeApiJson("/purchase-requests/"),
    purchaseOrders: () => safeApiJson("/purchase-orders/"),
    goodsReceipts: () => safeApiJson("/goods-receipts/"),
  },
  finance: {
    invoices: () => safeApiJson("/invoices/"),
  },
};

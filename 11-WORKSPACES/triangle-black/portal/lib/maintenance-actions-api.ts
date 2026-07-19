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

export const maintenanceActionsApi = {
  reviewSummary: async () => {
    const res = await fetch(`${BASE}/maintenance/review/summary`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  completePM: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/maintenance/pm-plans/${id}/complete${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },

  completeCorrective: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/maintenance/corrective/${id}/complete${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },

  completeEmergency: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/maintenance/emergency/${id}/complete${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },

  reviewDowntime: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/maintenance/downtime/${id}/review${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },

  reviewCost: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/maintenance/costs/${id}/review${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },
};

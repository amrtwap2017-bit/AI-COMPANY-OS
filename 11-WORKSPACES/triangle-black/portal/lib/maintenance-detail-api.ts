// @ts-nocheck
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

export const maintenanceDetailApi = {
  assetContext: async (assetId: string) => {
    const res = await fetch(`${BASE}/maintenance/assets/${assetId}/context`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  planContext: async (planId: string) => {
    const res = await fetch(`${BASE}/maintenance/pm-plans/${planId}/context`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  scheduleReview: async () => {
    const res = await fetch(`${BASE}/maintenance/review/schedules`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },
};

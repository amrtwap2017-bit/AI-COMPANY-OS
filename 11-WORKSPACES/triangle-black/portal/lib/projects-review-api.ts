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

export const projectsReviewApi = {
  reviewSummary: async () => {
    const res = await fetch(`${BASE}/projects-enterprise/review/summary`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  scheduleReview: async () => {
    const res = await fetch(`${BASE}/projects-enterprise/review/schedule`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  reviewTask: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/projects-enterprise/tasks/${id}/review${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },

  reviewRisk: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/projects-enterprise/risks/${id}/review${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },

  reviewIssue: async (id: string, detail?: string) => {
    const q = detail ? `?detail=${encodeURIComponent(detail)}` : "";
    const res = await fetch(`${BASE}/projects-enterprise/issues/${id}/review${q}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return parseResponse(res);
  },
};
export const projectsEnterpriseApi = projectsReviewApi;

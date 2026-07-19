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

export const projectsEnterpriseApi = {
  sections: async () => {
    const res = await fetch(`${BASE}/projects-enterprise/sections`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  summary: async () => {
    const res = await fetch(`${BASE}/projects-enterprise/intelligence/summary`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  list: async (section: string, params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    q.set("limit", "200");
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);

    const res = await fetch(`${BASE}/projects-enterprise/${section}?${q.toString()}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  create: async (section: string, data: any) => {
    const res = await fetch(`${BASE}/projects-enterprise/${section}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },

  get: async (section: string, id: string) => {
    const res = await fetch(`${BASE}/projects-enterprise/${section}/${id}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return parseResponse(res);
  },

  update: async (section: string, id: string, data: any) => {
    const res = await fetch(`${BASE}/projects-enterprise/${section}/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res);
  },
};

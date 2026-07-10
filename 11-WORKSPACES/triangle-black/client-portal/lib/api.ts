import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("client_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const clientAuth = {
  login: (email: string, password: string) =>
    api.post(
      "/auth/login",
      new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),
  me: () => api.get("/auth/me"),
};

export const clientQuotesApi = {
  list: () => api.get("/quotes/?limit=100"),
  get: (id: string) => api.get(`/quotes/${id}`),
  approve: (id: string) => api.post(`/actions/quotes/${id}/approve`, {}),
  reject: (id: string, note: string) =>
    api.post(`/actions/quotes/${id}/reject`, { note }),
};

export const clientContractsApi = {
  list: () => api.get("/contracts/?limit=100"),
  get: (id: string) => api.get(`/contracts/${id}`),
  activate: (id: string, start_date?: string) =>
    api.post(`/contracts/${id}/activate`, { start_date }),
  renew: (id: string, months = 12) =>
    api.post(`/contracts/${id}/renew`, { duration_months: months }),
};

export const clientLeadsApi = {
  myLead: (id: string) => api.get(`/leads/${id}`),
  timeline: (id: string) => api.get(`/actions/leads/${id}/timeline`),
};

export const clientDashboardApi = {
  pipeline: () => api.get("/actions/pipeline/summary"),
};

export const clientPdfApi = {
  downloadQuote: async (quoteId: string): Promise<void> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("client_token") || ""
        : "";
    const res = await fetch(`${BASE}/actions/quotes/${quoteId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("PDF generation failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TB-${quoteId.slice(0, 8).toUpperCase()}-Proposal.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT PORTAL — Invoices API
// ─────────────────────────────────────────────────────────────────────────────

export const invoicesApi = {
  list: () => api.get("/invoices/").then((r) => r.data),
  get:  (id: string) => api.get(`/invoices/${id}`).then((r) => r.data),
};

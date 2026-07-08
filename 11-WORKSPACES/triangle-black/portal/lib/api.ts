import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", new URLSearchParams({ username: email, password }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  me: () => api.get("/auth/me"),
  logout: () => {
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    window.location.href = "/login";
  },
};

// ─── Leads ───────────────────────────────────────────────────────────────────
export const leadsApi = {
  list: (skip = 0, limit = 100) => api.get(`/leads/?skip=${skip}&limit=${limit}`),
  get: (id: string) => api.get(`/leads/${id}`),
  create: (data: Record<string, unknown>) => api.post("/leads/", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/leads/${id}`, data),
  qualify: (id: string) => api.post(`/actions/leads/${id}/qualify`),
  assign: (id: string, agent_id?: string) =>
    api.post(`/actions/leads/${id}/assign`, { agent_id }),
  generateQuote: (id: string, months = 12) =>
    api.post(`/actions/leads/${id}/quote`, { contract_months: months }),
  timeline: (id: string) => api.get(`/actions/leads/${id}/timeline`),
};

// ─── Quotes ──────────────────────────────────────────────────────────────────
export const quotesApi = {
  list: () => api.get("/quotes/?limit=100"),
  get: (id: string) => api.get(`/quotes/${id}`),
  submit: (id: string) => api.post(`/actions/quotes/${id}/submit`, {}),
  send: (id: string) => api.post(`/actions/quotes/${id}/send`, {}),
  approve: (id: string) => api.post(`/actions/quotes/${id}/approve`, {}),
  reject: (id: string, note?: string) =>
    api.post(`/actions/quotes/${id}/reject`, { note }),
};

// ─── Agents ──────────────────────────────────────────────────────────────────
export const agentsApi = {
  list: () => api.get("/agents/?limit=100"),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  summary: () => api.get("/actions/reports/dashboard"),
  pipeline: () => api.get("/actions/pipeline/summary"),
};

// ─── Contracts ───────────────────────────────────────────────────────────────
export const contractsApi = {
  list: (status?: string) =>
    api.get(`/contracts/?limit=100${status ? `&status=${status}` : ""}`),
  get: (id: string) => api.get(`/contracts/${id}`),
  activate: (id: string, start_date?: string) =>
    api.post(`/contracts/${id}/activate`, { start_date }),
  renew: (id: string, months: number = 12) =>
    api.post(`/contracts/${id}/renew`, { duration_months: months }),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/contracts/${id}`, data),
};

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchApi = {
  leads: (q: string, filters?: {
    status?: string; source?: string; priority?: string;
  }) => api.get(`/actions/leads/search?q=${encodeURIComponent(q)}${
    filters?.status ? `&status=${filters.status}` : ""
  }${filters?.source ? `&source=${filters.source}` : ""
  }${filters?.priority ? `&priority=${filters.priority}` : ""}`),
  checkDuplicate: (email: string, excludeId?: string) =>
    api.get(`/actions/leads/check-duplicate?email=${encodeURIComponent(email)}${
      excludeId ? `&exclude_id=${excludeId}` : ""
    }`),
};

// ─── Users (admin) ───────────────────────────────────────────────────────────
export const usersApi = {
  list: () => api.get("/users/?limit=100"),
};

// ─── PDF ─────────────────────────────────────────────────────────────────────
export const pdfApi = {
  downloadQuote: async (quoteId: string, token: string): Promise<void> => {
    const res = await fetch(
      `${API_BASE}/actions/quotes/${quoteId}/pdf`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("PDF generation failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TB-${quoteId.slice(0,8).toUpperCase()}-Proposal.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

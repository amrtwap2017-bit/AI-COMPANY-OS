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

import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const adminAuth = {
  login: (email: string, password: string) =>
    api.post("/auth/login",
      new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),
};

export const usersApi = {
  list: () => api.get("/actions/users"),
  create: (data: Record<string, unknown>) => api.post("/actions/users", data),
};

export const agentsApi = {
  list: () => api.get("/agents/?limit=200"),
  create: (data: Record<string, unknown>) => api.post("/agents/", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/agents/${id}`, data),
  performance: (id: string) => api.get(`/actions/agents/${id}/performance`),
};

export const contractsApi = {
  list: (status?: string) =>
    api.get(`/contracts/?limit=200${status ? `&status=${status}` : ""}`),
  activate: (id: string) => api.post(`/contracts/${id}/activate`, {}),
  renew: (id: string, months: number) =>
    api.post(`/contracts/${id}/renew`, { duration_months: months }),
};

export const dashboardApi = {
  summary: () => api.get("/actions/reports/dashboard"),
  pipeline: () => api.get("/actions/pipeline/summary"),
};

export const webhooksApi = {
  list: () => api.get("/webhooks/?limit=100"),
  create: (data: Record<string, unknown>) => api.post("/webhooks/", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/webhooks/${id}`, data),
  delete: (id: string) => api.delete(`/webhooks/${id}`),
};

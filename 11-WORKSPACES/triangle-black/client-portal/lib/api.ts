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
    api.post("/auth/login",
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

export const clientLeadsApi = {
  myLead: (id: string) => api.get(`/leads/${id}`),
  timeline: (id: string) => api.get(`/actions/leads/${id}/timeline`),
};

export const clientDashboardApi = {
  pipeline: () => api.get("/actions/pipeline/summary"),
};

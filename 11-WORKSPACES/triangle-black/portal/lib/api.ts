import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api/v1";

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
  addNote: (id: string, note: string) =>
    api.post(`/actions/leads/${id}/note`, { note }),
  delete: (id: string) => api.delete(`/leads/${id}`),
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
  get: (id: string) => api.get(`/agents/${id}`),
  create: (data: Record<string, unknown>) => api.post("/actions/agents/create", data),
  leads: (id: string) => api.get(`/actions/agents/${id}/leads`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/agents/${id}`, data),
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

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (unread_only = false) =>
    api.get(`/notifications/?unread_only=${unread_only}&limit=50`),
  unreadCount: () =>
    api.get("/notifications/unread"),
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () =>
    api.post("/notifications/read-all", {}),
  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
};

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoicesApi = {
  list: (status?: string, contract_id?: string) =>
    api.get(`/invoices/?limit=100${status ? `&status=${status}` : ""}${contract_id ? `&contract_id=${contract_id}` : ""}`),
  get: (id: string) => api.get(`/invoices/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/invoices/${id}`, data),
  markPaid: (id: string, paid_date?: string, notes?: string) =>
    api.post(`/invoices/${id}/mark-paid`, { paid_date, notes }),
  send: (id: string) =>
    api.post(`/invoices/${id}/send`, {}),
};


// ─────────────────────────────────────────────────────────────────────────────
// SPRINT 13B — Advanced Reports API
// ─────────────────────────────────────────────────────────────────────────────

export const reportsApi = {
  getRevenueTrend: async (months = 12) => {
    const token = localStorage.getItem("tb_token");
    const res = await fetch(
      `${API_BASE}/actions/reports/revenue-trend?months=${months}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Failed to fetch revenue trend");
    return res.json();
  },

  getLeadFunnel: async () => {
    const token = localStorage.getItem("tb_token");
    const res = await fetch(`${API_BASE}/actions/reports/lead-funnel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch lead funnel");
    return res.json();
  },

  getAgentLeaderboard: async () => {
    const token = localStorage.getItem("tb_token");
    const res = await fetch(`${API_BASE}/actions/reports/agent-leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch agent leaderboard");
    return res.json();
  },

  exportInvoicesCsv: async () => {
    const token = localStorage.getItem("tb_token");
    const res = await fetch(`${API_BASE}/actions/reports/export/invoices.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to export invoices");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  exportContractsCsv: async () => {
    const token = localStorage.getItem("tb_token");
    const res = await fetch(`${API_BASE}/actions/reports/export/contracts.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to export contracts");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contracts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY & PROCUREMENT API — v4.3.0
// ─────────────────────────────────────────────────────────────────────────────

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('tb_token') : null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export const inventoryApi = {
  // Items
  getItems:    (skip = 0, limit = 100) =>
    fetch(`${API_BASE}/inventory/items/?skip=${skip}&limit=${limit}`,
      { headers: authHeaders() }).then(r => r.json()),
  createItem:  (data: any) =>
    fetch(`${API_BASE}/inventory/items/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  updateItem:  (id: string, data: any) =>
    fetch(`${API_BASE}/inventory/items/${id}`,
      { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  // Warehouses
  getWarehouses: () =>
    fetch(`${API_BASE}/inventory/warehouses/`,
      { headers: authHeaders() }).then(r => r.json()),
  createWarehouse: (data: any) =>
    fetch(`${API_BASE}/inventory/warehouses/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  // Vendors
  getVendors: () =>
    fetch(`${API_BASE}/inventory/vendors/`,
      { headers: authHeaders() }).then(r => r.json()),
  createVendor: (data: any) =>
    fetch(`${API_BASE}/inventory/vendors/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  getVendorScorecard: (id: string) =>
    fetch(`${API_BASE}/actions/procurement/vendors/${id}/scorecard`,
      { headers: authHeaders() }).then(r => r.json()),

  // Purchase Requests
  getPurchaseRequests: () =>
    fetch(`${API_BASE}/inventory/purchase-requests/`,
      { headers: authHeaders() }).then(r => r.json()),
  createPurchaseRequest: (data: any) =>
    fetch(`${API_BASE}/inventory/purchase-requests/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  approvePR: (id: string) =>
    fetch(`${API_BASE}/actions/inventory/purchase-requests/${id}/approve`,
      { method: 'POST', headers: authHeaders() }).then(r => r.json()),
  convertPRtoPO: (id: string) =>
    fetch(`${API_BASE}/actions/procurement/purchase-requests/${id}/convert-to-po`,
      { method: 'POST', headers: authHeaders() }).then(r => r.json()),

  // Purchase Orders
  getPurchaseOrders: () =>
    fetch(`${API_BASE}/inventory/purchase-orders/`,
      { headers: authHeaders() }).then(r => r.json()),
  approvePO: (id: string) =>
    fetch(`${API_BASE}/actions/inventory/purchase-orders/${id}/approve`,
      { method: 'POST', headers: authHeaders() }).then(r => r.json()),

  // Dashboards
  getInventoryDashboard: () =>
    fetch(`${API_BASE}/actions/inventory/dashboard`,
      { headers: authHeaders() }).then(r => r.json()),
  getProcurementDashboard: () =>
    fetch(`${API_BASE}/actions/procurement/dashboard`,
      { headers: authHeaders() }).then(r => r.json()),
  getLowStock: () =>
    fetch(`${API_BASE}/actions/inventory/low-stock`,
      { headers: authHeaders() }).then(r => r.json()),

  // Stock adjustment
  adjustStock: (data: any) =>
    fetch(`${API_BASE}/actions/inventory/adjust`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
};

export const serviceOpsApi = {
  // Technicians
  getTechnicians: () =>
    fetch(`${API_BASE}/technicians/`,
      { headers: authHeaders() }).then(r => r.json()),
  createTechnician: (data: any) =>
    fetch(`${API_BASE}/technicians/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  // Sites
  getSites: () =>
    fetch(`${API_BASE}/sites/`,
      { headers: authHeaders() }).then(r => r.json()),
  createSite: (data: any) =>
    fetch(`${API_BASE}/sites/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),

  // Work Orders
  getWorkOrders: () =>
    fetch(`${API_BASE}/work-orders/`,
      { headers: authHeaders() }).then(r => r.json()),
  createWorkOrder: (data: any) =>
    fetch(`${API_BASE}/work-orders/`,
      { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  assignWorkOrder: (id: string, techId: string) =>
    fetch(`${API_BASE}/actions/work-orders/${id}/assign`,
      { method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ agent_id: techId }) }).then(r => r.json()),
  completeWorkOrder: (id: string) =>
    fetch(`${API_BASE}/actions/work-orders/${id}/complete`,
      { method: 'POST', headers: authHeaders() }).then(r => r.json()),

  // Service Requests
  getServiceRequests: () =>
    fetch(`${API_BASE}/service-requests/`,
      { headers: authHeaders() }).then(r => r.json()),

  // Service Dashboard
  getServiceDashboard: () =>
    fetch(`${API_BASE}/actions/dashboard/service-ops`,
      { headers: authHeaders() }).then(r => r.json()),
};

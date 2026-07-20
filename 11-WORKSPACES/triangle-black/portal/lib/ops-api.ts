// @ts-nocheck
/**
 * Operations domain APIs — aligned to real backend routes.
 */
import { api, buildParams } from "./api/client";

export type WOStatus = "open" | "in_progress" | "completed" | "cancelled";
export type WOPriority = "low" | "medium" | "high" | "critical" | "emergency";

export interface WorkOrder {
  id: string;
  hotel_id: string;
  title: string;
  description?: string | null;
  status: WOStatus | string;
  priority: WOPriority | string;
  type?: string | null;
  technician_id?: string | null;
  site_id?: string | null;
  asset_id?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  /** Resolved display fields (optional joins) */
  technician?: string | null;
  site?: string | null;
}

export interface Technician {
  id: string;
  hotel_id: string;
  name: string;
  email: string;
  phone?: string | null;
  specializations: string[];
  max_work_orders: number;
  current_work_orders: number;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  /** Display aliases */
  role?: string;
  current_assignments?: number;
}

export interface ServiceRequest {
  id: string;
  hotel_id: string;
  title: string;
  description?: string | null;
  status: string;
  urgency: string;
  category: string;
  site_id?: string | null;
  submitted_by?: string | null;
  contact_phone?: string | null;
  created_at: string;
  updated_at: string;
  /** Display aliases */
  priority?: string;
  site?: string | null;
}

export interface ListParams {
  page?: number;
  limit?: number;
  skip?: number;
  status?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined | null;
}

function asList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

export const workOrdersApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<WorkOrder[] | { items: WorkOrder[] }>("/work-orders/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<WorkOrder>(res);
  },
  get: (id: string) => api.get<WorkOrder>(`/work-orders/${id}`),
};

export const techniciansApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<Technician[] | { items: Technician[] }>("/technicians/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<Technician>(res).map((t) => ({
      ...t,
      role: t.role ?? (Array.isArray(t.specializations) && t.specializations.length
        ? t.specializations.slice(0, 2).join(", ")
        : "Technician"),
      current_assignments: t.current_assignments ?? t.current_work_orders ?? 0,
    }));
  },
  get: (id: string) => api.get<Technician>(`/technicians/${id}`),
};

export const serviceRequestsApi = {
  list: async (params?: ListParams) => {
    const res = await api.get<ServiceRequest[] | { items: ServiceRequest[] }>("/service-requests/", {
      params: buildParams((params ?? {}) as Record<string, string | number | boolean | null | undefined>),
    });
    return asList<ServiceRequest>(res).map((r) => ({
      ...r,
      priority: r.priority ?? r.urgency,
      site: r.site ?? r.site_id ?? null,
    }));
  },
  get: (id: string) => api.get<ServiceRequest>(`/service-requests/${id}`),
};

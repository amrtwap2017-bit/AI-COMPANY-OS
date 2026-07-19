import { api, buildParams } from './client'

// ─── Types ────────────────────────────────────────────────────────────────

export type WOStatus   = 'open' | 'in_progress' | 'pending' | 'completed' | 'cancelled' | 'on_hold'
export type WOPriority = 'critical' | 'high' | 'medium' | 'low'

export interface WorkOrder {
  id:           string
  number:       string
  title:        string
  description?: string
  status:       WOStatus
  priority:     WOPriority
  category?:    string
  location?:    string
  hotel?:       string
  asset_id?:    string
  assigned_to?: string
  requested_by?:string
  created_at:   string
  updated_at:   string
  due_date?:    string
  estimated_hours?: number
  actual_hours?:    number
  cost?:        number
  sla_target_hours?: number
}

export interface WorkOrderCreate {
  title:        string
  description?: string
  priority:     WOPriority
  category?:    string
  location?:    string
  hotel_id?:    string
  asset_id?:    string
  due_date?:    string
  estimated_hours?: number
}

export interface Technician {
  id:           string
  name:         string
  email:        string
  phone?:       string
  role:         string
  specialty?:   string
  status:       'available' | 'on_job' | 'break' | 'off_duty' | 'traveling'
  location?:    string
  utilization?: number
}

export interface ServiceRequest {
  id:           string
  number:       string
  title:        string
  description?: string
  status:       string
  priority:     string
  category?:    string
  location?:    string
  hotel?:       string
  submitted_by? :string
  assigned_to?: string
  created_at:   string
  sla_hours?:   number
}

export interface ListParams {
  page?:     number
  per_page?: number
  status?:   string
  priority?: string
  search?:   string
  sort?:     string
}

export interface ListResponse<T> {
  data:  T[]
  total: number
  page:  number
  per_page: number
}

// ─── Work Orders ──────────────────────────────────────────────────────────

export const workOrdersApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<WorkOrder>>('/operations/work-orders', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<WorkOrder>(`/operations/work-orders/${id}`),

  create: (data: WorkOrderCreate) =>
    api.post<WorkOrder>('/operations/work-orders', data),

  update: (id: string, data: Partial<WorkOrderCreate>) =>
    api.patch<WorkOrder>(`/operations/work-orders/${id}`, data),

  updateStatus: (id: string, status: WOStatus) =>
    api.patch<WorkOrder>(`/operations/work-orders/${id}`, { status }),

  delete: (id: string) =>
    api.delete(`/operations/work-orders/${id}`),

  assign: (id: string, technicianId: string) =>
    api.patch<WorkOrder>(`/operations/work-orders/${id}`, { assigned_to: technicianId }),

  dashboard: () =>
    api.get<{
      total: number; open: number; in_progress: number;
      completed_today: number; sla_breached: number;
    }>('/operations/work-orders/dashboard'),

  slaReview: () =>
    api.get('/operations/sla/review'),

  timeline: (id: string) =>
    api.get(`/operations/work-orders/${id}/timeline`),
}

// ─── Technicians ──────────────────────────────────────────────────────────

export const techniciansApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<Technician>>('/operations/technicians', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<Technician>(`/operations/technicians/${id}`),

  availability: () =>
    api.get('/operations/technicians/availability'),

  performance: (id: string) =>
    api.get(`/operations/technicians/${id}/performance`),
}

// ─── Service Requests ─────────────────────────────────────────────────────

export const serviceRequestsApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<ServiceRequest>>('/operations/service-requests', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<ServiceRequest>(`/operations/service-requests/${id}`),

  create: (data: Partial<ServiceRequest>) =>
    api.post<ServiceRequest>('/operations/service-requests', data),

  updateStatus: (id: string, status: string) =>
    api.patch<ServiceRequest>(`/operations/service-requests/${id}`, { status }),
}

export const sitesApi = {
  list:   (params?: ListParams) => api.get('/operations/sites',      { params: buildParams((params ?? {}) as any) }),
  get:    (id: string)          => api.get(`/operations/sites/${id}`),
  create: (data: unknown)       => api.post('/operations/sites', data),
}

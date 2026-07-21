import { api, buildParams } from './client'
import type { ListParams, ListResponse } from './operations'

export interface Asset {
  id:            string
  name:          string
  type?:         string
  category?:     string
  location?:     string
  hotel?:        string
  status?:       string
  health_score?: number
  serial_number?: string
  last_pm_date?: string
  next_pm_date?: string
  created_at:    string
}

export interface PMPlan {
  id:          string
  name:        string
  asset_id?:   string
  asset_name?: string
  frequency:   string
  status:      string
  last_run?:   string
  next_run?:   string
  technician?: string
  created_at:  string
}

export const assetsApi = {
  list:      (p?: ListParams)  => api.get<ListResponse<Asset>>('/maintenance/assets', { params: buildParams(p ?? {}) }),
  get:       (id: string)      => api.get<Asset>(`/maintenance/assets/${id}`),
  create:    (d: Partial<Asset>) => api.post<Asset>('/maintenance/assets', d),
  update:    (id: string, d: Partial<Asset>) => api.patch<Asset>(`/maintenance/assets/${id}`, d),
  health:    ()                => api.get('/maintenance/assets/health-summary'),
  assetTree: ()                => api.get('/maintenance/assets/tree'),
}

export const pmPlansApi = {
  list:      (p?: ListParams)    => api.get<ListResponse<PMPlan>>('/maintenance/pm-plans', { params: buildParams(p ?? {}) }),
  get:       (id: string)        => api.get<PMPlan>(`/maintenance/pm-plans/${id}`),
  create:    (d: Partial<PMPlan>)=> api.post<PMPlan>('/maintenance/pm-plans', d),
  schedule:  ()                  => api.get('/maintenance/schedule'),
  dashboard: ()                  => api.get('/maintenance/dashboard'),
}

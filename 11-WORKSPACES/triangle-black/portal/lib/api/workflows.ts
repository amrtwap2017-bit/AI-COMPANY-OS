// @ts-nocheck
import { api, buildParams } from './client'
import type { ListParams, ListResponse } from './operations'

export interface WorkflowInstance {
  id:          string
  workflow:    string
  status:      'running' | 'completed' | 'failed' | 'waiting' | 'cancelled'
  triggered_by?: string
  started_at:  string
  completed_at?: string
  steps:       number
  total_steps: number
  result?:     string
}

export interface ApprovalItem {
  id:          string
  title:       string
  type:        string
  amount?:     number | string
  currency?:   string
  requested_by?: string
  status:      'pending' | 'approved' | 'rejected'
  priority:    string
  created_at:  string
  description?: string
}

export interface WorkflowDef {
  id:          string
  name:        string
  description?: string
  status:      'active' | 'paused' | 'draft'
  category?:   string
  triggers_count?: number
  last_run?:   string
  created_at:  string
}

export const workflowsApi = {
  list:      (p?: ListParams) => api.get<ListResponse<WorkflowDef>>('/operations/workflows', { params: buildParams(p ?? {}) }),
  get:       (id: string)     => api.get<WorkflowDef>(`/operations/workflows/${id}`),
  instances: (p?: ListParams) => api.get<ListResponse<WorkflowInstance>>('/operations/workflows/instances', { params: buildParams(p ?? {}) }),
  approvals: (p?: ListParams) => api.get<ListResponse<ApprovalItem>>('/operations/workflows/approvals', { params: buildParams(p ?? {}) }),
  approve:   (id: string, comment?: string) => api.post(`/operations/workflows/approvals/${id}/approve`, { comment }),
  reject:    (id: string, comment?: string) => api.post(`/operations/workflows/approvals/${id}/reject`,  { comment }),
}

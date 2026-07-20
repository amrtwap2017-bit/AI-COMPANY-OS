// @ts-nocheck
import { api, buildParams } from './client'
import type { ListParams, ListResponse } from './operations'

export interface Contract {
  id:          string
  number:      string
  title:       string
  customer_id?: string
  customer_name?: string
  status:      string
  value?:      number
  currency?:   string
  start_date?: string
  end_date?:   string
  category?:   string
  created_at:  string
}

export interface Invoice {
  id:          string
  number:      string
  contract_id?: string
  customer_name?: string
  status:      string
  amount?:     number
  tax?:        number
  total?:      number
  issued_at?:  string
  due_date?:   string
  paid_at?:    string
}

export interface Customer {
  id:          string
  name:        string
  email?:      string
  phone?:      string
  status:      string
  type?:       string
  created_at:  string
}

export interface Lead {
  id:          string
  name:        string
  company?:    string
  status:      string
  value?:      number
  probability?: number
  owner?:      string
  created_at:  string
}

export const contractsApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<Contract>>('/commercial/contracts', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<Contract>(`/commercial/contracts/${id}`),

  create: (data: Partial<Contract>) =>
    api.post<Contract>('/commercial/contracts', data),

  renewalPipeline: () =>
    api.get('/commercial/contracts/renewal-pipeline'),

  dashboard: () =>
    api.get('/commercial/contracts/dashboard'),
}

export const invoicesApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<Invoice>>('/commercial/invoices', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<Invoice>(`/commercial/invoices/${id}`),

  create: (data: Partial<Invoice>) =>
    api.post<Invoice>('/commercial/invoices', data),
}

export const customersApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<Customer>>('/commercial/customers', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<Customer>(`/commercial/customers/${id}`),
}

export const leadsApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<Lead>>('/commercial/leads', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<Lead>(`/commercial/leads/${id}`),

  create: (data: Partial<Lead>) =>
    api.post<Lead>('/commercial/leads', data),

  updateStatus: (id: string, status: string) =>
    api.patch<Lead>(`/commercial/leads/${id}`, { status }),
}

// @ts-nocheck
import { api, buildParams } from './client'
import type { ListParams, ListResponse } from './operations'

export interface PurchaseOrder {
  id:             string
  number:         string
  supplier_id?:   string
  supplier_name?: string
  status:         string
  amount?:        number
  currency?:      string
  items_count?:   number
  requested_by?:  string
  approved_by?:   string
  created_at:     string
  expected_delivery?: string
  category?:      string
}

export interface Supplier {
  id:       string
  name:     string
  category?: string
  country?: string
  status:   string
  rating?:  number
  contact_name?: string
  phone?:   string
  email?:   string
}

export interface InventoryItem {
  id:           string
  sku:          string
  name:         string
  category?:    string
  quantity:     number
  unit?:        string
  location?:    string
  min_quantity?: number
  unit_cost?:   number
}

export const purchaseOrdersApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<PurchaseOrder>>('/supply-chain/purchase-orders', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<PurchaseOrder>(`/supply-chain/purchase-orders/${id}`),

  create: (data: Partial<PurchaseOrder>) =>
    api.post<PurchaseOrder>('/supply-chain/purchase-orders', data),

  approve: (id: string) =>
    api.patch<PurchaseOrder>(`/supply-chain/purchase-orders/${id}`, { status: 'approved' }),

  receive: (id: string) =>
    api.patch<PurchaseOrder>(`/supply-chain/purchase-orders/${id}`, { status: 'received' }),

  dashboard: () =>
    api.get('/supply-chain/purchase-orders/dashboard'),
}

export const suppliersApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<Supplier>>('/supply-chain/suppliers', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get<Supplier>(`/supply-chain/suppliers/${id}`),

  performance: (id: string) =>
    api.get(`/supply-chain/suppliers/${id}/performance`),

  create: (data: Partial<Supplier>) =>
    api.post<Supplier>('/supply-chain/suppliers', data),
}

export const inventoryApi = {
  list: (params?: ListParams) =>
    api.get<ListResponse<InventoryItem>>('/supply-chain/inventory', { params: buildParams((params ?? {}) as any) }),

  stockBalances: () =>
    api.get('/supply-chain/stock-balances'),
}

export const rfqsApi = {
  list: (params?: ListParams) =>
    api.get('/supply-chain/rfqs', { params: buildParams((params ?? {}) as any) }),

  get: (id: string) =>
    api.get(`/supply-chain/rfqs/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/supply-chain/rfqs', data),
}

// @ts-nocheck
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseOrdersApi, suppliersApi, inventoryApi, type ListParams } from '@/lib/api'
import { toast } from 'sonner'

export const PO_KEYS = { all:['purchase-orders'] as const, lists:()=>[...PO_KEYS.all,'list'] as const, list:(p:ListParams)=>[...PO_KEYS.lists(),p] as const, details:()=>[...PO_KEYS.all,'detail'] as const, detail:(id:string)=>[...PO_KEYS.details(),id] as const, dashboard:()=>[...PO_KEYS.all,'dashboard'] as const }
export const SUPPLIER_KEYS = { all:['suppliers'] as const, lists:()=>[...SUPPLIER_KEYS.all,'list'] as const, list:(p:ListParams)=>[...SUPPLIER_KEYS.lists(),p] as const, details:()=>[...SUPPLIER_KEYS.all,'detail'] as const, detail:(id:string)=>[...SUPPLIER_KEYS.details(),id] as const }

export const usePurchaseOrders = (p: ListParams={}) => useQuery({ queryKey:PO_KEYS.list(p), queryFn:()=>purchaseOrdersApi.list(p) })
export const usePurchaseOrder  = (id:string) => useQuery({ queryKey:PO_KEYS.detail(id), queryFn:()=>purchaseOrdersApi.get(id), enabled:!!id })
export const usePODashboard    = () => useQuery({ queryKey:PO_KEYS.dashboard(), queryFn:purchaseOrdersApi.dashboard, refetchInterval:60_000 })
export const useSuppliers      = (p: ListParams={}) => useQuery({ queryKey:SUPPLIER_KEYS.list(p), queryFn:()=>suppliersApi.list(p) })
export const useSupplier       = (id:string) => useQuery({ queryKey:SUPPLIER_KEYS.detail(id), queryFn:()=>suppliersApi.get(id), enabled:!!id })
export const useInventory      = (p: ListParams={}) => useQuery({ queryKey:['inventory',p], queryFn:()=>inventoryApi.list(p) })
export const useStockBalances  = () => useQuery({ queryKey:['stock-balances'], queryFn:inventoryApi.stockBalances, refetchInterval:120_000 })

export function useApprovePO(id: string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn:()=>purchaseOrdersApi.approve(id), onSuccess:()=>{ qc.invalidateQueries({queryKey:PO_KEYS.detail(id)}); qc.invalidateQueries({queryKey:PO_KEYS.lists()}); toast.success('Purchase Order approved') }, onError:(e:Error)=>toast.error(`Approval failed: ${e.message}`) })
}

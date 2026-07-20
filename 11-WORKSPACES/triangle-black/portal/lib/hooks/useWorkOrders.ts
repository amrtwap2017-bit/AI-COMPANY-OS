// @ts-nocheck
'use client'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { workOrdersApi, type ListParams, type WorkOrderCreate, type WOStatus } from '@/lib/api'
import { toast } from 'sonner'

export const WO_KEYS = {
  all:       ['work-orders'] as const,
  lists:     () => [...WO_KEYS.all,'list'] as const,
  list:      (p:ListParams) => [...WO_KEYS.lists(),p] as const,
  details:   () => [...WO_KEYS.all,'detail'] as const,
  detail:    (id:string) => [...WO_KEYS.details(),id] as const,
  dashboard: () => [...WO_KEYS.all,'dashboard'] as const,
  sla:       () => [...WO_KEYS.all,'sla'] as const,
}

export const useWorkOrderList      = (p:ListParams={}) => useQuery({ queryKey:WO_KEYS.list(p), queryFn:()=>workOrdersApi.list(p), placeholderData:keepPreviousData, staleTime:30_000 })
export const useWorkOrder          = (id:string) => useQuery({ queryKey:WO_KEYS.detail(id), queryFn:()=>workOrdersApi.get(id), enabled:!!id })
export const useWorkOrderDashboard = () => useQuery({ queryKey:WO_KEYS.dashboard(), queryFn:workOrdersApi.dashboard, refetchInterval:60_000 })
export const useWorkOrderSLA       = () => useQuery({ queryKey:WO_KEYS.sla(), queryFn:workOrdersApi.slaReview, refetchInterval:30_000 })
export const useWorkOrderTimeline  = (id:string) => useQuery({ queryKey:[...WO_KEYS.detail(id),'timeline'], queryFn:()=>workOrdersApi.timeline(id), enabled:!!id })

export function useCreateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({ mutationFn:(d:WorkOrderCreate)=>workOrdersApi.create(d), onSuccess:(wo)=>{ qc.invalidateQueries({queryKey:WO_KEYS.lists()}); qc.invalidateQueries({queryKey:WO_KEYS.dashboard()}); toast.success(`Work Order ${wo.number} created`) }, onError:(e:Error)=>toast.error(`Failed: ${e.message}`) })
}

export function useUpdateWorkOrder(id:string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn:(d:Partial<WorkOrderCreate>)=>workOrdersApi.update(id,d), onSuccess:(wo)=>{ qc.invalidateQueries({queryKey:WO_KEYS.detail(id)}); qc.invalidateQueries({queryKey:WO_KEYS.lists()}); toast.success(`${wo.number} updated`) }, onError:(e:Error)=>toast.error(`Update failed: ${e.message}`) })
}

export function useUpdateWOStatus(id:string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn:(s:WOStatus)=>workOrdersApi.updateStatus(id,s), onSuccess:(wo)=>{ qc.invalidateQueries({queryKey:WO_KEYS.detail(id)}); qc.invalidateQueries({queryKey:WO_KEYS.lists()}); qc.invalidateQueries({queryKey:WO_KEYS.dashboard()}); toast.success(`Status updated to ${wo.status}`) }, onError:(e:Error)=>toast.error(`Status update failed: ${e.message}`) })
}

export function useAssignTechnician(workOrderId:string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn:(techId:string)=>workOrdersApi.assign(workOrderId,techId), onSuccess:()=>{ qc.invalidateQueries({queryKey:WO_KEYS.detail(workOrderId)}); qc.invalidateQueries({queryKey:WO_KEYS.lists()}); toast.success('Technician assigned') }, onError:(e:Error)=>toast.error(`Assignment failed: ${e.message}`) })
}

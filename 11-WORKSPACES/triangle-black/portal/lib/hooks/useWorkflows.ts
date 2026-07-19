'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowsApi, type ListParams } from '@/lib/api'
import { toast } from 'sonner'

export const WF_KEYS = {
  all:       ['workflows'] as const,
  lists:     () => [...WF_KEYS.all, 'list'] as const,
  list:      (p: ListParams) => [...WF_KEYS.lists(), p] as const,
  instances: () => [...WF_KEYS.all, 'instances'] as const,
  approvals: () => [...WF_KEYS.all, 'approvals'] as const,
}

export const useWorkflows          = (p: ListParams={}) => useQuery({ queryKey: WF_KEYS.list(p), queryFn: ()=>workflowsApi.list(p) })
export const useWorkflowInstances  = (p: ListParams={}) => useQuery({ queryKey: [...WF_KEYS.instances(), p], queryFn: ()=>workflowsApi.instances(p), refetchInterval: 15_000 })
export const useWorkflowApprovals  = (p: ListParams={}) => useQuery({ queryKey: [...WF_KEYS.approvals(), p], queryFn: ()=>workflowsApi.approvals(p), staleTime: 30_000 })

export function useApproveItem(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (comment?: string) => workflowsApi.approve(id, comment),
    onSuccess: () => { qc.invalidateQueries({ queryKey: WF_KEYS.approvals() }); toast.success('Approved') },
    onError: (e: Error) => toast.error(`Approval failed: ${e.message}`),
  })
}

export function useRejectItem(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (comment?: string) => workflowsApi.reject(id, comment),
    onSuccess: () => { qc.invalidateQueries({ queryKey: WF_KEYS.approvals() }); toast.success('Rejected') },
    onError: (e: Error) => toast.error(`Rejection failed: ${e.message}`),
  })
}

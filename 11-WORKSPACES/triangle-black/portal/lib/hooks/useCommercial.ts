'use client'
import { useQuery } from '@tanstack/react-query'
import { contractsApi, invoicesApi, customersApi, leadsApi, type ListParams } from '@/lib/api'

export const CONTRACT_KEYS = { all:['contracts'] as const, lists:()=>[...CONTRACT_KEYS.all,'list'] as const, list:(p:ListParams)=>[...CONTRACT_KEYS.lists(),p] as const, details:()=>[...CONTRACT_KEYS.all,'detail'] as const, detail:(id:string)=>[...CONTRACT_KEYS.details(),id] as const, renewal:()=>[...CONTRACT_KEYS.all,'renewal'] as const }

export const useContracts              = (p: ListParams={}) => useQuery({ queryKey:CONTRACT_KEYS.list(p), queryFn:()=>contractsApi.list(p) })
export const useContract               = (id:string) => useQuery({ queryKey:CONTRACT_KEYS.detail(id), queryFn:()=>contractsApi.get(id), enabled:!!id })
export const useContractRenewalPipeline= () => useQuery({ queryKey:CONTRACT_KEYS.renewal(), queryFn:contractsApi.renewalPipeline, refetchInterval:300_000 })
export const useInvoices               = (p: ListParams={}) => useQuery({ queryKey:['invoices',p], queryFn:()=>invoicesApi.list(p) })
export const useCustomers              = (p: ListParams={}) => useQuery({ queryKey:['customers',p], queryFn:()=>customersApi.list(p) })
export const useLeads                  = (p: ListParams={}) => useQuery({ queryKey:['leads',p], queryFn:()=>leadsApi.list(p) })

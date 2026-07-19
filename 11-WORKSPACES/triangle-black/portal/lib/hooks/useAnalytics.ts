'use client'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi, executiveApi } from '@/lib/api'

export const useSLAOverview      = () => useQuery({ queryKey:['analytics','sla','overview'], queryFn:analyticsApi.slaOverview, refetchInterval:60_000 })
export const useSLABreaches      = (p?:{module?:string;days?:number}) => useQuery({ queryKey:['analytics','sla','breaches',p], queryFn:()=>analyticsApi.slaBreaches(p), staleTime:30_000 })
export const useKPIs             = (period:'7d'|'30d'|'90d'='30d') => useQuery({ queryKey:['analytics','kpis',period], queryFn:()=>analyticsApi.kpis(period), staleTime:120_000 })
export const useExecutiveSummary = () => useQuery({ queryKey:['executive','summary'], queryFn:executiveApi.summary, refetchInterval:300_000 })
export const useDailyReview      = () => useQuery({ queryKey:['executive','daily-review'], queryFn:executiveApi.dailyReview, staleTime:60_000 })

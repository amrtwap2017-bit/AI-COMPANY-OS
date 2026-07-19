'use client'
import { useQuery } from '@tanstack/react-query'
import { assetsApi, pmPlansApi, type ListParams } from '@/lib/api'

export const ASSET_KEYS = { all:['assets'] as const, lists:()=>[...ASSET_KEYS.all,'list'] as const, list:(p:ListParams)=>[...ASSET_KEYS.lists(),p] as const, details:()=>[...ASSET_KEYS.all,'detail'] as const, detail:(id:string)=>[...ASSET_KEYS.details(),id] as const, health:()=>[...ASSET_KEYS.all,'health'] as const }
export const PM_KEYS    = { all:['pm-plans'] as const, lists:()=>[...PM_KEYS.all,'list'] as const, list:(p:ListParams)=>[...PM_KEYS.lists(),p] as const, schedule:()=>[...PM_KEYS.all,'schedule'] as const, dashboard:()=>[...PM_KEYS.all,'dashboard'] as const }

export const useAssets               = (p:ListParams={}) => useQuery({ queryKey:ASSET_KEYS.list(p), queryFn:()=>assetsApi.list(p) })
export const useAsset                = (id:string) => useQuery({ queryKey:ASSET_KEYS.detail(id), queryFn:()=>assetsApi.get(id), enabled:!!id })
export const useAssetHealth          = () => useQuery({ queryKey:ASSET_KEYS.health(), queryFn:assetsApi.health, refetchInterval:120_000 })
export const usePMPlans              = (p:ListParams={}) => useQuery({ queryKey:PM_KEYS.list(p), queryFn:()=>pmPlansApi.list(p) })
export const usePMSchedule           = () => useQuery({ queryKey:PM_KEYS.schedule(), queryFn:pmPlansApi.schedule, staleTime:60_000 })
export const useMaintenanceDashboard = () => useQuery({ queryKey:PM_KEYS.dashboard(), queryFn:pmPlansApi.dashboard, refetchInterval:60_000 })

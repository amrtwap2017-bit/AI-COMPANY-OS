// @ts-nocheck
'use client'
import { useQuery } from '@tanstack/react-query'
import { techniciansApi, type ListParams } from '@/lib/api'

export const TECH_KEYS = {
  all:          ['technicians'] as const,
  lists:        () => [...TECH_KEYS.all, 'list'] as const,
  list:         (p: ListParams) => [...TECH_KEYS.lists(), p] as const,
  details:      () => [...TECH_KEYS.all, 'detail'] as const,
  detail:       (id: string) => [...TECH_KEYS.details(), id] as const,
  availability: () => [...TECH_KEYS.all, 'availability'] as const,
}
export const useTechnicianList      = (p: ListParams = {}) => useQuery({ queryKey: TECH_KEYS.list(p), queryFn: () => techniciansApi.list(p), staleTime: 30_000 })
export const useTechnician          = (id: string) => useQuery({ queryKey: TECH_KEYS.detail(id), queryFn: () => techniciansApi.get(id), enabled: !!id })
export const useTechnicianAvailability = () => useQuery({ queryKey: TECH_KEYS.availability(), queryFn: techniciansApi.availability, refetchInterval: 30_000 })
export const useTechnicianPerformance  = (id: string) => useQuery({ queryKey: [...TECH_KEYS.detail(id), 'performance'], queryFn: () => techniciansApi.performance(id), enabled: !!id, staleTime: 60_000 })

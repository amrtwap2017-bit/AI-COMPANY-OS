// @ts-nocheck
import { api, buildParams } from './client'

export interface SLAMetric {
  module:    string
  target:    number
  actual:    number
  compliant: number
  breached:  number
  at_risk:   number
}

export interface KPIData {
  label:   string
  value:   number | string
  change?: number
  trend?:  'up' | 'down' | 'stable'
}

export const analyticsApi = {
  slaOverview: () => api.get<SLAMetric[]>('/analytics/sla'),
  slaBreaches: (p?: { module?: string; days?: number }) => api.get('/analytics/sla/breaches', { params: buildParams(p ?? {}) }),
  kpis:        (period?: '7d'|'30d'|'90d') => api.get<KPIData[]>('/analytics/kpis', { params: buildParams({ period: period ?? '30d' }) }),
  workOrderTrend: (p?: { days?: number }) => api.get('/analytics/work-orders/trend', { params: buildParams(p ?? {}) }),
  spendAnalysis:  (p?: { period?: string }) => api.get('/analytics/spend', { params: buildParams(p ?? {}) }),
  scorecards: () => api.get('/analytics/scorecards'),
}

export const executiveApi = {
  summary:     () => api.get('/executive/summary'),
  portfolio:   () => api.get('/executive/portfolio'),
  dailyReview: () => api.get('/executive/daily-review'),
  reports:     (p?: Record<string, string>) => api.get('/executive/reports', { params: buildParams(p ?? {}) }),
  risks:       () => api.get('/executive/risks'),
}

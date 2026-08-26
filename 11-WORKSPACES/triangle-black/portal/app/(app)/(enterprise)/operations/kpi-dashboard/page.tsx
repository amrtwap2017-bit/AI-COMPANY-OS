'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface KPI {
  id: string
  name: string
  category: string
  value: number | string
  unit: string
  target: number | null
  status: 'RED' | 'AMBER' | 'GREEN'
  insight: string
  weight: number
}

interface OHI {
  score: number
  grade: string
  label: string
  alert_threshold_exceeded: boolean
}

interface Dashboard {
  hotel_id: string
  generated_at: string
  report_type: string
  operational_health_index: OHI
  kpi_summary: { total: number; red: number; amber: number; green: number }
  kpis: KPI[]
  urgent_alerts: Array<{ kpi_id: string; kpi_name: string; message: string; category: string }>
  alert_count: number
  morning_brief: string
}

function OHIGauge({ ohi }: { ohi: OHI }) {
  const color = ohi.score >= 80 ? '#22c55e' : ohi.score >= 65 ? '#f59e0b' : ohi.score >= 50 ? '#ef4444' : '#7f1d1d'
  return (
    <div className="tb-card flex flex-col items-center justify-center p-6">
      <div className="text-xs tb-muted uppercase tracking-widest mb-2">Operational Health Index</div>
      <div style={{ color, fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{ohi.score}</div>
      <div style={{ color }} className="text-xl font-bold mt-1">Grade {ohi.grade}</div>
      <div className="tb-badge mt-2" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
        {ohi.label}
      </div>
      {ohi.alert_threshold_exceeded && (
        <div className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
          <AlertTriangle size={12} /> Executive alert threshold exceeded
        </div>
      )}
    </div>
  )
}

function KPICard({ kpi }: { kpi: KPI }) {
  const bg = kpi.status === 'GREEN' ? 'bg-green-50 border-green-200'
    : kpi.status === 'AMBER' ? 'bg-amber-50 border-amber-200'
    : 'bg-red-50 border-red-200'
  const textColor = kpi.status === 'GREEN' ? 'text-green-700'
    : kpi.status === 'AMBER' ? 'text-amber-700'
    : 'text-red-700'
  const icon = kpi.status === 'GREEN'
    ? <CheckCircle size={14} className="text-green-500" />
    : kpi.status === 'AMBER'
    ? <Clock size={14} className="text-amber-500" />
    : <AlertTriangle size={14} className="text-red-500" />

  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.id}</div>
        <div className="flex items-center gap-1">{icon}
          <span className={`text-xs font-semibold ${textColor}`}>{kpi.status}</span>
        </div>
      </div>
      <div className="font-semibold text-sm text-gray-800 mb-1">{kpi.name}</div>
      <div className={`text-2xl font-bold ${textColor}`}>
        {typeof kpi.value === 'number' && kpi.unit === 'USD'
          ? `$${kpi.value.toLocaleString()}`
          : `${kpi.value}${kpi.unit === '%' ? '%' : kpi.unit === 'WOs' || kpi.unit === 'assets' ? ` ${kpi.unit}` : ''}`}
      </div>
      {kpi.target !== null && (
        <div className="text-xs text-gray-500 mt-1">
          Target: {kpi.unit === '%' ? `${kpi.target}%` : kpi.target}
        </div>
      )}
      <div className="text-xs text-gray-600 mt-2 line-clamp-2">{kpi.insight}</div>
    </div>
  )
}

export default function KPIDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await authFetch('/api/v1/kpi-engine/dashboard')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setData(await r.json())
    } catch (e) {
      setError('Failed to load KPI dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="tb-canvas">
      <div className="tb-shimmer tb-shimmer-title mb-4" />
      <div className="tb-grid-4">{[...Array(4)].map((_,i) => <div key={i} className="tb-shimmer tb-shimmer-block" />)}</div>
    </div>
  )

  if (error || !data) return (
    <div className="tb-canvas"><div className="tb-alert tb-alert-danger">{error || 'No data'}</div></div>
  )

  const categories = ['OPERATIONS', 'ASSETS', 'MAINTENANCE', 'FINANCE', 'PROCUREMENT']

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">KPI Dashboard</h1>
          <p className="tb-muted text-sm mt-1">
            {new Date(data.generated_at).toLocaleString()} · 10 Key Performance Indicators
          </p>
        </div>
        <button onClick={load} className="tb-btn tb-btn-ghost flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Morning Brief Banner */}
      <div className={`rounded-lg p-4 mb-6 font-mono text-sm ${
        data.operational_health_index.alert_threshold_exceeded
          ? 'bg-red-900 text-red-100'
          : 'bg-gray-900 text-green-400'
      }`}>
        📊 {data.morning_brief}
      </div>

      {/* OHI + Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <OHIGauge ohi={data.operational_health_index} />
        <div className="tb-card p-4 flex flex-col justify-center">
          <div className="text-xs tb-muted uppercase mb-2">KPI Status</div>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.kpi_summary.red}</div>
              <div className="text-xs text-red-600">RED</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{data.kpi_summary.amber}</div>
              <div className="text-xs text-amber-600">AMBER</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.kpi_summary.green}</div>
              <div className="text-xs text-green-600">GREEN</div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 tb-card p-4">
          <div className="text-xs font-semibold mb-2 flex items-center gap-1">
            <AlertTriangle size={12} className="text-red-500" />
            {data.alert_count} Active Alerts
          </div>
          <div className="space-y-1">
            {data.urgent_alerts.slice(0, 4).map((a, i) => (
              <div key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 truncate">
                {a.kpi_name}: {a.message}
              </div>
            ))}
            {data.urgent_alerts.length === 0 && (
              <div className="text-xs text-green-700">No urgent alerts</div>
            )}
          </div>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {data.kpis.map(kpi => <KPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* By Category */}
      <div className="tb-grid-4">
        {categories.map(cat => {
          const catData = data.by_category[cat]
          if (!catData) return null
          return (
            <div key={cat} className="tb-card p-3">
              <div className="text-xs font-semibold tb-muted uppercase mb-2">{cat}</div>
              <div className="flex gap-2 text-xs">
                {catData.red > 0 && <span className="text-red-600">{catData.red} RED</span>}
                {catData.amber > 0 && <span className="text-amber-600">{catData.amber} AMBER</span>}
                {catData.green > 0 && <span className="text-green-600">{catData.green} GREEN</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

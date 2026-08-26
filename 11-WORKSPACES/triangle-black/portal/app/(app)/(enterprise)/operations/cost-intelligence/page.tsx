'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react'

export default function CostIntelligencePage() {
  const [summary, setSummary] = useState<any>(null)
  const [trend, setTrend] = useState<any>(null)
  const [aging, setAging] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, t, a] = await Promise.all([
        authFetch('/api/v1/cost-intelligence/summary').then(r => r.json()),
        authFetch('/api/v1/cost-intelligence/monthly-trend').then(r => r.json()),
        authFetch('/api/v1/cost-intelligence/invoice-aging').then(r => r.json()),
      ])
      setSummary(s); setTrend(t); setAging(a)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="tb-canvas"><div className="tb-shimmer tb-shimmer-title" /></div>

  const gradeColor = (g: string) =>
    g === 'A' ? 'text-green-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="tb-canvas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign size={24} className="text-amber-600" /> Cost Intelligence
          </h1>
          <p className="tb-muted text-sm mt-1">Invoice spend analysis · Aging · Efficiency</p>
        </div>
        <button onClick={load} className="tb-btn tb-btn-ghost flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      {summary && (
        <div className="tb-grid-4 mb-6">
          <div className="tb-card p-4">
            <div className="tb-kpi-label">Total Invoice Spend</div>
            <div className="tb-kpi-value">${(summary.total_invoice_spend || 0).toLocaleString()}</div>
          </div>
          <div className="tb-card p-4">
            <div className="tb-kpi-label">Cost Efficiency</div>
            <div className={`tb-kpi-value ${gradeColor(summary.cost_efficiency_grade)}`}>
              {summary.cost_efficiency_score}/100 Grade {summary.cost_efficiency_grade}
            </div>
          </div>
          <div className="tb-card p-4">
            <div className="tb-kpi-label">Overdue Amount</div>
            <div className="tb-kpi-value text-red-600">${(summary.overdue_amount || 0).toLocaleString()}</div>
          </div>
          <div className="tb-card p-4">
            <div className="tb-kpi-label">Spend Trend</div>
            <div className="tb-kpi-value flex items-center gap-2">
              {summary.spend_trend_direction === 'INCREASING'
                ? <TrendingUp size={20} className="text-red-500" />
                : <TrendingDown size={20} className="text-green-500" />}
              {summary.spend_trend_direction}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        {trend && (
          <div className="tb-card p-5">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide tb-muted">6-Month Spend Trend</h3>
            <div className="space-y-2">
              {(trend.months || []).map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 w-20">{m.month}</span>
                  <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (m.total_spend / Math.max(...(trend.months || []).map((x: any) => x.total_spend), 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="font-medium w-28 text-right">${Number(m.total_spend).toLocaleString()}</span>
                  {m.mom_change_pct !== 0 && (
                    <span className={`w-16 text-right text-xs ${m.mom_change_pct > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {m.mom_change_pct > 0 ? '+' : ''}{m.mom_change_pct}%
                    </span>
                  )}
                </div>
              ))}
              {!(trend.months || []).length && (
                <p className="text-sm tb-muted">No invoice data for the last 6 months</p>
              )}
            </div>
          </div>
        )}

        {/* Invoice Aging */}
        {aging && (
          <div className="tb-card p-5">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide tb-muted">Invoice Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(aging.status_breakdown || {}).map(([status, data]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize font-medium w-24">{status}</span>
                  <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status === 'paid' ? 'bg-green-500' : status === 'overdue' ? 'bg-red-500' : 'bg-amber-400'}`}
                      style={{ width: `${(data.count / Math.max(aging.total_invoices, 1)) * 100}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{data.count}</span>
                    <span className="text-xs tb-muted ml-2">${(data.amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between text-sm">
              <span className="tb-muted">Payment rate</span>
              <span className="font-semibold text-green-600">{aging.payment_rate}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {summary?.insights?.length > 0 && (
        <div className="tb-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Cost Insights
          </h3>
          <div className="space-y-2">
            {summary.insights.map((ins: any, i: number) => (
              <div key={i} className={`rounded px-3 py-2 text-sm ${
                ins.severity === 'CRITICAL' || ins.severity === 'HIGH'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-amber-50 text-amber-800'
              }`}>
                <strong>{ins.type}:</strong> {ins.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

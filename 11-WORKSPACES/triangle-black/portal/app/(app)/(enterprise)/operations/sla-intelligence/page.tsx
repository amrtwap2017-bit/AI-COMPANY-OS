'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { ShieldAlert, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function SLAIntelligencePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const r = await authFetch('/api/v1/sla-intelligence/summary')
      setData(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="tb-canvas"><div className="tb-shimmer tb-shimmer-title" /></div>
  if (!data) return <div className="tb-canvas"><div className="tb-alert tb-alert-danger">Failed to load</div></div>

  const statusColor = (s: string) =>
    s === 'CRITICAL' ? 'text-red-700 bg-red-50' :
    s === 'HIGH' ? 'text-orange-700 bg-orange-50' :
    s === 'MODERATE' ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'

  const gradeColor = (g: string) =>
    g === 'A' ? 'text-green-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="tb-canvas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert size={24} className="text-red-600" /> SLA Intelligence
          </h1>
          <p className="tb-muted text-sm mt-1">Breach analysis · Backlog · Recommendations</p>
        </div>
        <button onClick={load} className="tb-btn tb-btn-ghost flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Overview */}
      <div className="tb-grid-4 mb-6">
        <div className="tb-card p-4 text-center">
          <div className="text-xs tb-muted uppercase mb-1">Overall Compliance</div>
          <div className={`text-3xl font-bold ${gradeColor(data.compliance_grade)}`}>
            {data.overall_compliance_pct}%
          </div>
          <div className={`text-sm font-semibold mt-1 ${gradeColor(data.compliance_grade)}`}>
            Grade {data.compliance_grade}
          </div>
        </div>
        <div className="tb-card p-4 text-center">
          <div className="text-xs tb-muted uppercase mb-1">Breach Rate</div>
          <div className="text-3xl font-bold text-red-600">{data.overall_breach_pct}%</div>
          <div className="text-sm tb-muted mt-1">{data.total_breached} WOs breached</div>
        </div>
        <div className="tb-card p-4 text-center">
          <div className="text-xs tb-muted uppercase mb-1">Open Backlog</div>
          <div className="text-3xl font-bold text-orange-600">{data.backlog?.total_open}</div>
          <div className="text-sm tb-muted mt-1">Stale &gt;30d: {data.backlog?.stale_over_30_days}</div>
        </div>
        <div className="tb-card p-4 text-center">
          <div className="text-xs tb-muted uppercase mb-1">Action Items</div>
          <div className="text-3xl font-bold text-blue-600">{data.recommendation_count}</div>
          <div className="text-sm tb-muted mt-1">Recommendations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Priority */}
        <div className="tb-card p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide tb-muted">Breach by Priority</h3>
          <div className="space-y-3">
            {(data.by_priority || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="capitalize font-medium w-20 text-sm">{p.priority}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                  <div className="h-3 rounded-full bg-red-400" style={{ width: `${p.breach_pct}%` }} />
                </div>
                <div className="flex items-center gap-2 w-40 justify-end">
                  <span className="text-sm font-semibold">{p.breach_pct}%</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.risk_level)}`}>
                    {p.risk_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="tb-card p-5">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide tb-muted">Worst Categories</h3>
          <div className="space-y-2">
            {(data.by_category || []).slice(0, 6).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700 w-32 truncate">{c.category}</span>
                <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-red-400" style={{ width: `${c.breach_pct}%` }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.breach_pct}%</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {(data.recommendations || []).length > 0 && (
        <div className="tb-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            SLA Improvement Recommendations
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((r: any, i: number) => (
              <div key={i} className={`rounded-lg p-3 border-l-4 ${
                r.priority === 'P0' ? 'border-red-500 bg-red-50' : 'border-orange-400 bg-orange-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    r.priority === 'P0' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                  }`}>{r.priority}</span>
                  <span className="text-sm font-semibold">{r.type.replace(/_/g,' ')}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{r.message}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle size={10} /> {r.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

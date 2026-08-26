'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { ShieldOff, RefreshCw, AlertTriangle } from 'lucide-react'

export default function RiskIntelligencePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const r = await authFetch('/api/v1/risk-engine/summary')
      setData(await r.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="tb-canvas"><div className="tb-shimmer tb-shimmer-title" /></div>
  if (!data) return <div className="tb-canvas"><div className="tb-alert tb-alert-danger">Failed to load</div></div>

  const riskColor = (s: string) =>
    s === 'CRITICAL' ? '#dc2626' : s === 'HIGH' ? '#ea580c' : s === 'MODERATE' ? '#d97706' : '#16a34a'

  const riskBg = (s: string) =>
    s === 'CRITICAL' ? 'bg-red-50 border-red-200' :
    s === 'HIGH' ? 'bg-orange-50 border-orange-200' :
    s === 'MODERATE' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'

  return (
    <div className="tb-canvas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldOff size={24} className="text-red-600" /> Operational Risk Intelligence
          </h1>
          <p className="tb-muted text-sm mt-1">5-domain composite risk analysis</p>
        </div>
        <button onClick={load} className="tb-btn tb-btn-ghost flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Overall Risk Score */}
      <div className={`rounded-xl border-2 p-6 mb-6 flex items-center gap-6 ${riskBg(data.risk_grade)}`}>
        <div className="text-center min-w-[120px]">
          <div style={{ color: riskColor(data.risk_grade), fontSize: '3rem', fontWeight: 800 }}>
            {data.overall_risk_score}
          </div>
          <div style={{ color: riskColor(data.risk_grade) }} className="font-bold text-lg">/100</div>
          <div style={{ color: riskColor(data.risk_grade) }} className="text-sm font-semibold mt-1">
            {data.risk_grade} RISK
          </div>
        </div>
        <div className="flex-1">
          <p className="text-gray-700 text-sm">{data.executive_summary}</p>
          <p className="text-xs tb-muted mt-2">{new Date(data.generated_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Domain Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {(data.domains || []).map((d: any) => (
          <div key={d.domain} className={`rounded-lg border p-3 ${riskBg(d.status)}`}>
            <div className="text-xs font-semibold tb-muted uppercase mb-1">{d.domain}</div>
            <div style={{ color: riskColor(d.status) }} className="text-2xl font-bold">{d.score}</div>
            <div style={{ color: riskColor(d.status) }} className="text-xs font-medium">{d.status}</div>
          </div>
        ))}
      </div>

      {/* Top Risk Factors */}
      {(data.top_risk_factors || []).length > 0 && (
        <div className="tb-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            Top Risk Factors
          </h3>
          <div className="space-y-2">
            {data.top_risk_factors.map((f: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 rounded p-2 ${riskBg(f.severity)}`}>
                <span style={{ color: riskColor(f.severity) }}
                  className="text-xs font-bold w-20 shrink-0 uppercase">{f.severity}</span>
                <span className="text-xs font-semibold tb-muted w-24 shrink-0">{f.domain}</span>
                <span className="text-sm text-gray-700">{f.factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

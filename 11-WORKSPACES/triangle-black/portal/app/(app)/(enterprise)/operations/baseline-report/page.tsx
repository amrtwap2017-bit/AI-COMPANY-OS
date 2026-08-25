'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import {
  ShieldAlert, TrendingUp, Wrench, ShoppingCart,
  Users, FileText, Building2, AlertTriangle,
  CheckCircle2, XCircle, Clock, RefreshCw
} from 'lucide-react'

interface RiskData {
  score: number
  grade: string
  label: string
  components: {
    critical_assets_pct: number
    open_wo_pct: number
    failed_assets_pct: number
    sla_breach_pct: number
  }
}

interface Insight {
  type: string
  severity: string
  message: string
}

interface BaselineReport {
  hotel_id: string
  report_type: string
  generated_at: string
  version: string
  risk: RiskData
  insights: Insight[]
  sections: {
    asset_health: Record<string, number>
    work_order_backlog: Record<string, number>
    maintenance_cost: Record<string, number>
    procurement: Record<string, number>
    service_requests: Record<string, number>
    contract_compliance: Record<string, number>
    sites: { total_sites: number; sites: Array<Record<string, unknown>> }
    workforce: Record<string, number>
  }
}

function RiskGauge({ score, grade, label }: { score: number; grade: string; label: string }) {
  const color = score < 20 ? '#22c55e' : score < 40 ? '#f59e0b' : score < 60 ? '#ef4444' : '#7f1d1d'
  return (
    <div className="tb-card flex flex-col items-center justify-center p-8">
      <div className="text-sm tb-muted mb-2 uppercase tracking-widest">Operational Risk Score</div>
      <div style={{ color, fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>{score}</div>
      <div style={{ color }} className="text-2xl font-bold mt-1">Grade {grade}</div>
      <div className="tb-badge mt-3"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
        {label}
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    HIGH: 'tb-badge-danger',
    MEDIUM: 'tb-badge-warning',
    LOW: 'tb-badge-success',
  }
  return <span className={`tb-badge ${map[severity] || 'tb-badge-neutral'}`}>{severity}</span>
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="tb-card p-4">
      <div className="tb-muted text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="tb-muted text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function BaselineReportPage() {
  const [report, setReport] = useState<BaselineReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await authFetch('/api/v1/baseline/report')
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setReport(await r.json())
      setLastRefresh(new Date())
    } catch (e) {
      setError('Failed to load baseline report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="tb-canvas">
      <div className="tb-shimmer tb-shimmer-title mb-4" />
      <div className="tb-grid-4">
        {[...Array(4)].map((_, i) => <div key={i} className="tb-shimmer tb-shimmer-block" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="tb-canvas">
      <div className="tb-alert tb-alert-danger">{error}</div>
    </div>
  )

  if (!report) return null

  const s = report.sections
  const fmt = (n: number) => n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '0'
  const fmtUsd = (n: number) => `$${fmt(n)}`
  const fmtPct = (n: number) => `${n ?? 0}%`

  return (
    <div className="tb-canvas">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-amber-500" size={24} />
            Operational Baseline Report
          </h1>
          <p className="tb-muted text-sm mt-1">
            Generated {new Date(report.generated_at).toLocaleString()} · v{report.version}
          </p>
        </div>
        <button onClick={load} className="tb-btn tb-btn-ghost flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Risk + Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <RiskGauge
          score={report.risk.score}
          grade={report.risk.grade}
          label={report.risk.label}
        />
        <div className="md:col-span-2 tb-card p-4">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Key Operational Insights
          </div>
          <div className="space-y-2">
            {report.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded border border-neutral-100 bg-neutral-50">
                <SeverityBadge severity={insight.severity} />
                <span className="text-sm">{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Components */}
      <div className="tb-grid-4 mb-6">
        <KpiCard label="Critical Assets" value={fmtPct(report.risk.components.critical_assets_pct)} sub="of total asset base" />
        <KpiCard label="Open WO Rate" value={fmtPct(report.risk.components.open_wo_pct)} sub="work orders still open" />
        <KpiCard label="SLA Breach Rate" value={fmtPct(report.risk.components.sla_breach_pct)} sub="exceeded SLA target" />
        <KpiCard label="Failed Assets" value={fmtPct(report.risk.components.failed_assets_pct)} sub="in failed status" />
      </div>

      {/* Section 1: Assets */}
      <div className="tb-card p-4 mb-4">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-amber-500" /> Asset Health
        </h2>
        <div className="tb-grid-4">
          <KpiCard label="Total Assets" value={fmt(s.asset_health.total)} />
          <KpiCard label="Critical" value={fmt(s.asset_health.critical)} sub={`${s.asset_health.critical_pct}% of base`} />
          <KpiCard label="Operational" value={fmt(s.asset_health.operational)} sub={`${s.asset_health.health_pct}% health`} />
          <KpiCard label="In Maintenance" value={fmt(s.asset_health.in_maintenance)} />
        </div>
      </div>

      {/* Section 2: Work Orders */}
      <div className="tb-card p-4 mb-4">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Wrench size={16} className="text-amber-500" /> Work Order Backlog
        </h2>
        <div className="tb-grid-4">
          <KpiCard label="Total WOs" value={fmt(s.work_order_backlog.total)} />
          <KpiCard label="Open" value={fmt(s.work_order_backlog.open)} sub="requires action" />
          <KpiCard label="Completion Rate" value={fmtPct(s.work_order_backlog.completion_rate_pct)} />
          <KpiCard label="SLA Compliance" value={fmtPct(s.work_order_backlog.sla_compliance_pct)} />
        </div>
      </div>

      {/* Section 3: Cost + Procurement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="tb-card p-4">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <FileText size={16} className="text-amber-500" /> Maintenance Cost
          </h2>
          <div className="tb-grid-2">
            <KpiCard label="Total Spend" value={fmtUsd(s.maintenance_cost.total_spend)} />
            <KpiCard label="Overdue Amount" value={fmtUsd(s.maintenance_cost.overdue_amount)} sub={`${s.maintenance_cost.overdue_count} overdue invoices`} />
          </div>
        </div>
        <div className="tb-card p-4">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-amber-500" /> Procurement
          </h2>
          <div className="tb-grid-2">
            <KpiCard label="Active Suppliers" value={fmt(s.procurement.active_suppliers)} />
            <KpiCard label="PO Value" value={fmtUsd(s.procurement.total_po_value)} sub={`${s.procurement.pending} pending POs`} />
          </div>
        </div>
      </div>

      {/* Section 4: Service Requests + Contracts + Workforce */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="tb-card p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock size={14} className="text-amber-500" /> Service Requests
          </h2>
          <KpiCard label="Total" value={fmt(s.service_requests.total)} />
          <div className="mt-2 text-xs tb-muted">
            {s.service_requests.urgent} urgent · {s.service_requests.open} open ·{' '}
            {s.service_requests.resolution_rate_pct}% resolved
          </div>
        </div>
        <div className="tb-card p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <FileText size={14} className="text-amber-500" /> Contracts
          </h2>
          <KpiCard label="Active" value={fmt(s.contract_compliance.active)} sub={`${s.contract_compliance.expiring_30d} expiring in 30d`} />
          <div className="mt-2 text-xs tb-muted">
            Total value: {fmtUsd(s.contract_compliance.total_contract_value)}
          </div>
        </div>
        <div className="tb-card p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Users size={14} className="text-amber-500" /> Workforce
          </h2>
          <KpiCard label="Employees" value={fmt(s.workforce.active_employees)} sub={`${s.workforce.technicians} technicians`} />
        </div>
      </div>

      {/* Sites */}
      {s.sites.sites.length > 0 && (
        <div className="tb-card p-4 mb-4">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-amber-500" />
            Top Sites by Critical Assets ({s.sites.total_sites} total)
          </h2>
          <div className="tb-table-wrap">
            <table className="tb-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th className="text-right">Assets</th>
                  <th className="text-right">Critical</th>
                </tr>
              </thead>
              <tbody>
                {s.sites.sites.map((site: any, i: number) => (
                  <tr key={i}>
                    <td>{site.name}</td>
                    <td className="text-right">{site.asset_count}</td>
                    <td className="text-right">
                      {site.critical_assets > 0
                        ? <span className="tb-badge tb-badge-danger">{site.critical_assets}</span>
                        : <span className="tb-badge tb-badge-success">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center tb-muted text-xs mt-4">
        Triangle Black · Operational Baseline Report · {report.hotel_id}
      </div>
    </div>
  )
}

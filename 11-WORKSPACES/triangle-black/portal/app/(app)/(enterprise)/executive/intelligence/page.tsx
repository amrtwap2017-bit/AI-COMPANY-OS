"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Award, RefreshCw, TrendingUp, ShieldCheck,
  DollarSign, AlertTriangle, Zap, CheckCircle2
} from "lucide-react";

export default function ExecutiveIntelligencePage() {
  const { data: briefing, isLoading, refetch } = useQuery(
    ["executive-intelligence-briefing"],
    () => authFetch("/api/v1/executive-intelligence/briefing").then(r => r.json()),
    { staleTime: 30000 }
  );

  const fin = briefing?.financial_performance || {};
  const asset = briefing?.asset_portfolio_risk || {};
  const sla = briefing?.sla_governance || {};
  const supplier = briefing?.supplier_intelligence || {};
  const phi = briefing?.portfolio_health_index || {};
  const risks = briefing?.top_risks || [];
  const actions = briefing?.recommended_executive_actions || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Award className="w-7 h-7 text-brand" />
              Executive Intelligence Briefing
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              phi.grade === "A+" || phi.grade === "A"
                ? "bg-success-bg text-success-text border-success-border"
                : "bg-brand-light text-brand border-brand-border"
            }`}>
              Portfolio Grade: {phi.grade || "—"}
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            {phi.benchmark || "Complete C-suite operational intelligence briefing"}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Portfolio Health + Key KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Portfolio Health Index"
          value={`${phi.index_score ?? "—"}/100`}
          sub={`Grade ${phi.grade || "—"} · ${phi.trend || "—"}`}
          color="emerald"
          status="ok"
        />
        <KpiCard
          label="Total Maintenance Spend"
          value={`$${Number(fin.total_maintenance_spend_usd || 0).toLocaleString()}`}
          sub={fin.trend || "—"}
          color="blue"
        />
        <KpiCard
          label="SLA Compliance"
          value={`${sla.sla_compliance_rate_pct ?? "—"}%`}
          sub={`Grade: ${sla.governance_grade || "—"}`}
          color="purple"
        />
        <KpiCard
          label="Supplier Performance"
          value={supplier.avg_performance_rating ?? "—"}
          sub={`${supplier.active_vendors ?? 0} active vendors`}
          color="brand"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asset Portfolio Risk */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <ShieldCheck className="w-4 h-4 text-brand" />
            Asset Portfolio
          </h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-surface-alt">
              <span className="text-secondary">Total Assets:</span>
              <span className="font-bold text-primary">{asset.total_assets ?? "—"}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-alt">
              <span className="text-secondary">Critical:</span>
              <span className="font-bold text-danger-text">{asset.critical_assets ?? 0}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-alt">
              <span className="text-secondary">Risk Level:</span>
              <StatusBadge status={asset.portfolio_risk_level || "LOW"} variant={asset.portfolio_risk_level === "HIGH" ? "danger" : asset.portfolio_risk_level === "MEDIUM" ? "warning" : "success"} />
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-alt">
              <span className="text-secondary">Lifecycle Exposure:</span>
              <span className="font-bold text-primary">${Number(asset.lifecycle_risk_exposure_usd || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Risks */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <AlertTriangle className="w-4 h-4 text-danger" />
            Top Risks ({risks.length})
          </h2>
          <div className="space-y-2">
            {risks.slice(0, 3).map((r: any) => (
              <div key={r.risk_id} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary">{r.category}</span>
                  <StatusBadge status={r.probability} variant={r.probability === "HIGH" ? "danger" : "warning"} />
                </div>
                <p className="text-xs font-semibold text-primary leading-snug">{r.title}</p>
                <div className="flex justify-between text-[11px] font-mono text-tertiary">
                  <span>${Number(r.financial_impact_usd || 0).toLocaleString()}</span>
                  <span>{r.days_to_action}d deadline</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommended Actions */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Zap className="w-4 h-4 text-brand" />
            Recommended Actions
          </h2>
          <div className="space-y-2">
            {actions.slice(0, 3).map((a: any) => (
              <div key={a.action_id} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    a.priority === "URGENT" ? "bg-danger-bg text-danger-text" :
                    a.priority === "HIGH" ? "bg-warning-bg text-warning-text" :
                    "bg-surface text-secondary border border-border"
                  }`}>{a.priority}</span>
                  <span className="text-xs font-bold text-success">{a.roi_multiple}</span>
                </div>
                <p className="text-xs font-semibold text-primary leading-snug">{a.title}</p>
                <div className="flex justify-between text-[11px] font-mono text-tertiary">
                  <span>Cost: ${Number(a.estimated_cost_usd || 0).toLocaleString()}</span>
                  <span>Saves: ${Number(a.avoided_risk_usd || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

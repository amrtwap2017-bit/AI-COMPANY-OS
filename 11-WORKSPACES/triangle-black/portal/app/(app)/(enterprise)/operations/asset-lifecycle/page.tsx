"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Box, RefreshCw, Wrench, TrendingUp } from "lucide-react";

export default function AssetLifecyclePage() {
  const { data: report, refetch } = useQuery(
    ["asset-lifecycle-report"],
    () => authFetch("/api/v1/asset-lifecycle/report").then(r => r.json()),
    { staleTime: 30000 }
  );

  const ps = report?.portfolio_summary || {};
  const cb = report?.criticality_breakdown || {};
  const pm = report?.pm_effectiveness || {};
  const eco = report?.replacement_economics || [];
  const risks = report?.lifecycle_risk_register || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <Box className="w-7 h-7 text-brand" />
            Asset Lifecycle Intelligence
          </h1>
          <p className="text-sm text-secondary mt-1">
            Portfolio health, replacement economics, PM effectiveness, lifecycle risks
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Total Assets" value={ps.total_assets ?? "—"} sub={`Health: ${ps.portfolio_health_score ?? 0}%`} color="blue" />
        <KpiCard label="Critical Assets" value={cb.by_criticality?.critical ?? 0} sub={`${cb.critical_pct ?? 0}% of portfolio`} color="amber" />
        <KpiCard label="PM Compliance" value={`${pm.pm_compliance_rate_pct ?? "—"}%`} sub={`Grade: ${pm.effectiveness_grade || "—"}`} color="emerald" status="ok" />
        <KpiCard label="Replacement Value" value={`$${Number(ps.estimated_replacement_value_usd || 0).toLocaleString()}`} sub="Portfolio Valuation" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand" />
            Replacement Economics
          </h2>
          {eco.slice(0, 5).map((e: any, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-border bg-surface-alt">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-primary">{e.asset_name || e.category}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  e.recommendation === "MONITOR" ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"
                }`}>{e.recommendation}</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-tertiary">
                <span>Replace: ${Number(e.replacement_cost_usd || 0).toLocaleString()}</span>
                <span>Annual: ${Number(e.annual_repair_cost_usd || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-danger" />
            Lifecycle Risk Register
          </h2>
          {risks.map((r: any) => (
            <div key={r.risk_id} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-primary">{r.asset_type}</span>
                <span className="text-xs font-mono text-tertiary">{r.timeline_months}mo</span>
              </div>
              <p className="text-[11px] text-secondary">{r.risk}</p>
              <p className="text-[11px] text-brand">{r.recommended_action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

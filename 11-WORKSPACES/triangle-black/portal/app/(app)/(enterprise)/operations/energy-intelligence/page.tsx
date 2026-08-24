"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Zap, RefreshCw, Leaf, TrendingDown } from "lucide-react";

export default function EnergyIntelligencePage() {
  const { data: report, refetch } = useQuery(
    ["energy-intelligence-report"],
    () => authFetch("/api/v1/energy-intelligence/report").then(r => r.json()),
    { staleTime: 30000 }
  );

  const ec = report?.energy_consumption || {};
  const cf = report?.carbon_footprint || {};
  const opps = report?.cost_optimization || [];
  const alerts = report?.energy_risk_alerts || [];
  const roadmap = report?.sustainability_roadmap || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-brand" />
            Energy & Sustainability Intelligence
          </h1>
          <p className="text-sm text-secondary mt-1">
            Energy consumption analysis, carbon footprint, and sustainability roadmap
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Total kWh (YTD)" value={ec.total_kwh_ytd?.toLocaleString() || "—"} sub={ec.trend || "—"} color="emerald" />
        <KpiCard label="HVAC Share" value={`${ec.hvac_pct_of_total ?? "—"}%`} sub="Of total consumption" color="amber" />
        <KpiCard label="CO₂ Tonnes" value={cf.total_co2_tonnes_ytd ?? "—"} sub={`Reduced ${cf.carbon_reduction_ytd_pct ?? 0}% YTD`} color="blue" />
        <KpiCard label="Net Zero Target" value={cf.net_zero_target_year || "—"} sub="ISO 50001 Roadmap" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-success" />
            Cost Optimization Opportunities
          </h2>
          {opps.map((opp: any) => (
            <div key={opp.opportunity_id} className="p-3 rounded-lg border border-border bg-surface-alt">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-primary flex-1 pr-2">{opp.title}</span>
                <span className="text-xs font-bold text-success whitespace-nowrap">{opp.roi_multiple}</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-tertiary">
                <span>Save: ${Number(opp.annual_savings_usd || 0).toLocaleString()}/yr</span>
                <span>Payback: {opp.payback_months}mo</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-success" />
            Sustainability Roadmap
          </h2>
          <div className="text-xs text-secondary mb-2">
            Target: <strong className="text-primary">{roadmap.green_certification_target}</strong>
            {" · "}Projected savings: <strong className="text-success">${Number(roadmap.total_projected_savings_usd || 0).toLocaleString()}</strong>
          </div>
          {(roadmap.milestones || []).map((m: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-surface-alt">
              <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${m.status === "IN_PROGRESS" ? "bg-brand" : "bg-surface-alt border border-border"}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary">{m.milestone}</p>
                <div className="flex justify-between text-[11px] text-tertiary mt-0.5">
                  <span>{m.target_date}</span>
                  <span className="text-success">+${Number(m.estimated_impact_usd || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

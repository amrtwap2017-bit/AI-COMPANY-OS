"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Layers, RefreshCw, ArrowRight, Building2, Activity, ShieldCheck } from "lucide-react";

export default function PilotControlRoomV2Page() {
  const { data: pilotData, isLoading, refetch } = useQuery(
    ["pilot-control-status-v2"],
    () => authFetch("/api/v1/pilot-control/status").then(r => r.json()),
    { staleTime: 30000 }
  );

  const { data: gateData } = useQuery(
    ["production-gate-readiness"],
    () => authFetch("/api/v1/production-gate/readiness").then(r => r.json()),
    { staleTime: 30000 }
  );

  const pilots = pilotData?.pilots || [];
  const gate = gateData || {};
  const totalAssets = pilots.reduce((sum: number, p: any) => sum + (p.kpis?.total_assets || 0), 0);
  const totalWOs = pilots.reduce((sum: number, p: any) => sum + (p.kpis?.work_orders || 0), 0);

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-brand" />
              SRE Multi-Tenant Pilot Control Room
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              gate.overall_status === "PRODUCTION_READY"
                ? "bg-success-bg text-success-text border-success-border"
                : "bg-brand-light text-brand border-brand-border"
            }`}>
              {gate.overall_status || "LOADING..."} · Score: {gate.gate_score_pct || 0}%
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Consolidated KPI monitoring across {pilots.length} active pilot properties
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Sync All
        </Button>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Active Pilots" value={pilots.length} sub="Live tenants" color="blue" />
        <KpiCard label="Total Assets" value={totalAssets} sub="Across all pilots" color="emerald" status="ok" />
        <KpiCard label="Work Orders" value={totalWOs} sub="Portfolio total" color="purple" />
        <KpiCard label="Production Gate" value={`${gate.gate_score_pct || 0}%`} sub={gate.overall_status || "—"} color={gate.gate_score_pct >= 80 ? "brand" : "amber"} />
      </div>

      {/* Production Gate Checks */}
      {gate.checks && (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <ShieldCheck className="w-4 h-4 text-brand" />
            Production Gate ({gate.passed}/{gate.total_gates} checks passed)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {gate.checks?.map((check: any) => (
              <div key={check.gate} className={`p-2.5 rounded-lg border text-center ${
                check.status === "PASS" ? "border-success-border bg-success-bg" :
                check.status === "WARN" ? "border-warning-border bg-warning-bg" :
                "border-danger-border bg-danger-bg"
              }`}>
                <div className={`text-[10px] font-extrabold ${
                  check.status === "PASS" ? "text-success-text" :
                  check.status === "WARN" ? "text-warning-text" : "text-danger-text"
                }`}>{check.status}</div>
                <div className="text-[9px] text-secondary mt-0.5 leading-tight">{check.gate.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pilot Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {pilots.map((p: any) => (
          <div key={p.hotel_id} className="rounded-xl border border-border bg-surface p-6 space-y-4 hover:border-brand/40 transition-colors">
            <div className="flex items-start justify-between border-b border-divider pb-3">
              <div>
                <h3 className="text-sm font-bold text-primary">{p.name}</h3>
                <p className="text-xs text-secondary">{p.brand} · {p.city}</p>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                p.health_index >= 90 ? "bg-success-bg text-success-text" :
                p.health_index >= 75 ? "bg-warning-bg text-warning-text" :
                "bg-danger-bg text-danger-text"
              }`}>
                {p.health_index || "—"}/100
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                ["Assets", p.kpis?.total_assets],
                ["SLA Breaches", p.kpis?.sla_breaches],
                ["Work Orders", p.kpis?.open_backlog],
                ["Spend", `$${Number(p.kpis?.procurement_spend_usd || 0).toLocaleString()}`]
              ].map(([label, val]: any) => (
                <div key={label} className="p-2 rounded border border-border bg-surface-alt flex justify-between">
                  <span className="text-secondary font-sans text-[10px]">{label}:</span>
                  <span className="font-bold text-primary">{val ?? "—"}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 text-[11px] text-tertiary border-t border-divider">
              <span className="font-mono text-[9px] truncate">{p.hotel_id?.slice(0, 20)}...</span>
              <span className="text-brand flex items-center gap-1 cursor-pointer font-semibold">
                View Tenant <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
        {pilots.length === 0 && !isLoading && (
          <div className="col-span-3 py-12 text-center text-secondary">
            <Building2 className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p className="text-sm font-medium">No pilot tenants found</p>
            <p className="text-xs mt-1">Run: python scripts/seed_pilot_tenants.py</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, RefreshCw, TrendingDown } from "lucide-react";

export default function RiskIntelligencePage() {
  const { data: report, isLoading, refetch } = useQuery(
    ["risk-intelligence-report"],
    () => authFetch("/api/v1/risk-intelligence/report").then(r => r.json()),
    { staleTime: 30000 }
  );

  const score = report?.composite_risk_score || {};
  const actions = report?.top_5_priority_actions || [];
  const domains = report?.domain_risk_scores || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-danger" />
            Operational Risk Intelligence
          </h1>
          <p className="text-sm text-secondary mt-1">
            Composite risk score across 6 operational domains — {report?.risk_trend || "Loading..."}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Risk Score" value={`${score.score ?? "—"}/100`} sub={`Grade: ${score.grade || "—"}`} color={score.score >= 85 ? "emerald" : "amber"} />
        <KpiCard label="Status" value={score.status || "—"} sub="Overall Risk Position" color="blue" />
        <KpiCard label="Active Risks" value={report?.total_active_risks ?? "—"} sub="All Domains Combined" color="purple" />
        <KpiCard label="Exposure" value={`$${Number(score.total_financial_exposure_usd || 0).toLocaleString()}`} sub="Total Financial Risk" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3">Priority Actions</h2>
          {actions.map((a: any) => (
            <div key={a.rank} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">#{a.rank} {a.domain}</span>
                <StatusBadge status={a.severity} variant={a.severity === "HIGH" ? "danger" : "warning"} />
              </div>
              <p className="text-xs text-secondary">{a.action}</p>
              <div className="flex justify-between text-xs font-mono text-tertiary">
                <span>${Number(a.financial_exposure_usd || 0).toLocaleString()} exposure</span>
                <span>{a.deadline_days}d to act</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3">Domain Scores</h2>
          {Object.entries(domains).map(([domain, val]: [string, any]) => (
            <div key={domain} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-xs font-semibold text-primary capitalize">{domain.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{width: `${val.score}%`}} />
                </div>
                <span className="text-xs font-bold text-primary w-8 text-right">{val.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

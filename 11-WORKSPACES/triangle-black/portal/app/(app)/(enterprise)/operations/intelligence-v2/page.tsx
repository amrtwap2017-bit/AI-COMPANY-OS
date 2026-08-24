"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Layers, RefreshCw, ShieldAlert, TrendingUp,
  Zap, DollarSign, CheckCircle2, AlertTriangle
} from "lucide-react";

export default function MasterIntelligencePage() {
  const { data: snapshot, isLoading, refetch } = useQuery(
    ["master-intelligence-snapshot"],
    () => authFetch("/api/v1/intelligence/snapshot").then(r => r.json()),
    { staleTime: 30000 }
  );

  const { data: riskData } = useQuery(
    ["risk-composite-score"],
    () => authFetch("/api/v1/risk-intelligence/composite-score").then(r => r.json()),
    { staleTime: 30000 }
  );

  const ops = snapshot?.pillar_1_operations || {};
  const fin = snapshot?.pillar_2_financial || {};
  const sla = snapshot?.pillar_4_sla || {};
  const risk = snapshot?.pillar_6_risk || {};
  const summary = snapshot?.intelligence_summary || {};
  const actions = snapshot?.pillar_7_ai_recommendations || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-brand" />
              Master Intelligence Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              8-Pillar Snapshot
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            {summary.overall_platform_verdict || "Loading operational intelligence..."}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Sync
        </Button>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Operational Health"
          value={summary.operational_health_grade || "—"}
          sub="Overall Ops Score"
          color="emerald"
          status="ok"
        />
        <KpiCard
          label="Risk Score"
          value={riskData?.score ? `${riskData.score}/100` : "—"}
          sub={`Grade: ${riskData?.grade || "—"}`}
          color={riskData?.score >= 85 ? "blue" : "amber"}
        />
        <KpiCard
          label="SLA Compliance"
          value={`${sla.sla_compliance_rate_pct ?? "—"}%`}
          sub={`Grade: ${sla.governance_grade || "—"}`}
          color="purple"
        />
        <KpiCard
          label="Financial Position"
          value={fin.trend || "—"}
          sub={`Cost Avoidance: $${Number(fin.cost_avoidance_usd ?? 0).toLocaleString()}`}
          color="brand"
        />
      </div>

      {/* Domain Risk Scores */}
      {risk.domain_scores && (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3">
            Domain Risk Scores
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(risk.domain_scores).map(([domain, val]: [string, any]) => (
              <div key={domain} className="p-3 rounded-lg border border-border bg-surface-alt text-center">
                <div className={`text-2xl font-black ${val.score >= 90 ? "text-success" : val.score >= 80 ? "text-primary" : "text-warning-text"}`}>
                  {val.grade}
                </div>
                <div className="text-xs text-secondary mt-1 capitalize">
                  {domain.replace(/_/g, " ")}
                </div>
                <div className="text-xs font-mono text-tertiary">{val.score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Risks */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <ShieldAlert className="w-4 h-4 text-danger" />
            Active Risk Signals ({risk.total_active_risks ?? 0})
          </h2>
          <div className="space-y-2">
            {(risk.top_actions || []).map((action: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-surface-alt">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-primary">{action.domain}</span>
                  <StatusBadge
                    status={action.severity}
                    variant={action.severity === "HIGH" ? "danger" : "warning"}
                  />
                </div>
                <p className="text-xs text-secondary">{action.action}</p>
                <div className="flex items-center justify-between mt-1.5 text-xs font-mono text-tertiary">
                  <span>Exposure: ${Number(action.financial_exposure_usd || 0).toLocaleString()}</span>
                  <span>{action.deadline_days}d deadline</span>
                </div>
              </div>
            ))}
            {(!risk.top_actions || risk.top_actions.length === 0) && (
              <div className="py-8 text-center text-secondary text-sm">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                No critical risks active
              </div>
            )}
          </div>
        </div>

        {/* AI Recommended Actions */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Zap className="w-4 h-4 text-brand" />
            AI Recommended Actions
          </h2>
          <div className="space-y-2">
            {actions.slice(0, 3).map((action: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    action.priority === "URGENT" ? "bg-danger-bg text-danger-text" :
                    action.priority === "HIGH" ? "bg-warning-bg text-warning-text" :
                    "bg-surface text-secondary border border-border"
                  }`}>{action.priority}</span>
                  <span className="text-xs font-bold text-success">{action.roi_multiple} ROI</span>
                </div>
                <p className="text-xs font-semibold text-primary">{action.title}</p>
                <p className="text-[11px] text-secondary">{action.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

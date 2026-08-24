"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { DollarSign, RefreshCw, TrendingDown, AlertCircle } from "lucide-react";

export default function FinancialIntelligencePage() {
  const { data: report, refetch } = useQuery(
    ["financial-intelligence-report"],
    () => authFetch("/api/v1/financial-intelligence/report").then(r => r.json()),
    { staleTime: 30000 }
  );

  const spend = report?.spend_overview || {};
  const leakage = report?.leakage_detection || {};
  const opps = report?.cost_reduction_opportunities || [];
  const risks = report?.financial_risk_register || [];
  const bv = report?.budget_variance || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-brand" />
            Financial Leakage & Cost Intelligence
          </h1>
          <p className="text-sm text-secondary mt-1">
            Procurement leakage detection, budget variance, cost reduction opportunities
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Total Spend YTD" value={`$${Number(spend.total_operations_spend_usd || 0).toLocaleString()}`} sub={bv.budget_status || "—"} color="blue" />
        <KpiCard label="Identified Leakage" value={`$${Number(leakage.total_identified_leakage_usd || 0).toLocaleString()}`} sub={`${leakage.leakage_as_pct_of_spend ?? 0}% of spend`} color="amber" />
        <KpiCard label="Prevention Potential" value={`$${Number(leakage.prevention_potential_usd || 0).toLocaleString()}`} sub="72% recoverable" color="emerald" status="ok" />
        <KpiCard label="Budget Variance" value={`${bv.budget_variance_pct ?? 0}%`} sub={bv.budget_status || "—"} color={bv.budget_variance_pct >= 0 ? "purple" : "amber"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-success" />
            Cost Reduction Opportunities
          </h2>
          {opps.map((opp: any) => (
            <div key={opp.opportunity_id} className="p-3 rounded-lg border border-border bg-surface-alt">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-primary flex-1 pr-2">{opp.title}</span>
                <span className="text-xs font-bold text-success">{opp.roi_multiple}</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-tertiary">
                <span>Save: ${Number(opp.annual_savings_usd || 0).toLocaleString()}/yr</span>
                <span>{opp.confidence_pct}% confidence</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger" />
            Financial Risk Register
          </h2>
          {risks.map((r: any) => (
            <div key={r.risk_id} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  r.probability === "HIGH" ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"
                }`}>{r.probability}</span>
                <span className="text-xs font-mono text-tertiary">${Number(r.financial_exposure_usd || 0).toLocaleString()} exposure</span>
              </div>
              <p className="text-xs font-semibold text-primary">{r.title}</p>
              <p className="text-[11px] text-secondary">{r.mitigation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

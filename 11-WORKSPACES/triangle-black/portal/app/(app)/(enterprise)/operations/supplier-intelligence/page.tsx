"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Truck, RefreshCw, TrendingDown, AlertTriangle, Star } from "lucide-react";

export default function SupplierIntelligencePage() {
  const { data: report, refetch } = useQuery(
    ["supplier-intelligence-report"],
    () => authFetch("/api/v1/supplier-intelligence/report").then(r => r.json()),
    { staleTime: 30000 }
  );

  const vn = report?.vendor_network || {};
  const sa = report?.spend_analysis || {};
  const sc = report?.vendor_scorecards || [];
  const risk = report?.procurement_risk || {};
  const opps = report?.savings_opportunities || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-brand" />
            Supplier Intelligence & Procurement Analytics
          </h1>
          <p className="text-sm text-secondary mt-1">
            Vendor scorecards, spend analysis, risk profiling, savings opportunities
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Total Vendors" value={vn.total_vendors ?? "—"} sub={`Active: ${vn.active_vendors ?? 0}`} color="blue" />
        <KpiCard label="Avg Rating" value={vn.avg_performance_rating ?? "—"} sub="Supplier Performance" color="emerald" status="ok" />
        <KpiCard label="Concentration Risk" value={vn.concentration_risk || "—"} sub="Supply Chain Risk" color={vn.concentration_risk === "LOW" ? "purple" : "amber"} />
        <KpiCard label="Bulk Savings YTD" value={`$${Number(sa.bulk_savings_ytd_usd || 0).toLocaleString()}`} sub="Contracted vs Spot" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Scorecards */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-brand" />
            Vendor Scorecards
          </h2>
          {sc.slice(0, 5).map((s: any) => (
            <div key={s.supplier_id || s.company_name} className="p-3 rounded-lg border border-border bg-surface-alt">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs font-bold text-primary">{s.company_name}</p>
                  <p className="text-[11px] text-tertiary">{s.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">{s.overall_score}/100</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    s.recommendation === "PREFERRED" ? "bg-success-bg text-success-text" :
                    s.recommendation === "APPROVED" ? "bg-brand-light text-brand" :
                    "bg-warning-bg text-warning-text"
                  }`}>{s.recommendation}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-tertiary">
                <span>Delivery: {s.delivery_reliability_pct}%</span>
                <span>Quality: {s.quality_score_pct}%</span>
                <span>Response: {s.response_time_score_pct}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Savings Opportunities */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-success" />
            Savings Opportunities
          </h2>
          {opps.map((opp: any) => (
            <div key={opp.opportunity_id} className="p-3 rounded-lg border border-border bg-surface-alt">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-primary flex-1 pr-2">{opp.title}</span>
                <span className="text-xs font-bold text-success">{opp.roi_multiple}</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-tertiary">
                <span>Save: ${Number(opp.estimated_savings_usd || 0).toLocaleString()}/yr</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${opp.effort === "LOW" ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"}`}>{opp.effort}</span>
              </div>
            </div>
          ))}

          {/* Risk summary */}
          <div className="mt-4 p-3 rounded-lg border border-border bg-surface-alt">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-secondary">Procurement Risk:</span>
              <StatusBadge status={risk.overall_procurement_risk || "LOW"} variant={risk.overall_procurement_risk === "HIGH" ? "danger" : risk.overall_procurement_risk === "MEDIUM" ? "warning" : "success"} />
            </div>
            <p className="text-[11px] text-tertiary mt-1">{risk.risk_count ?? 0} active procurement risks identified</p>
          </div>
        </div>
      </div>
    </div>
  );
}

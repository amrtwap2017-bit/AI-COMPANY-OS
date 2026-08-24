"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Award, RefreshCw, Download, ShieldCheck, TrendingUp, CheckCircle2 } from "lucide-react";

export default function ValueCertificationV2Page() {
  const { data: report, refetch } = useQuery(
    ["commercial-value-certification-v2"],
    () => authFetch("/api/v1/commercial-value/certification").then(r => r.json()),
    { staleTime: 60000 }
  );

  const roi = report?.financial_roi || {};
  const ops = report?.operational_achievements || {};
  const gov = report?.governance_signoff || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Award className="w-7 h-7 text-brand" />
              Commercial Value Certification
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              report?.certification_status === "COMMERCIALLY_VERIFIED"
                ? "bg-success-bg text-success-text border-success-border"
                : "bg-brand-light text-brand border-brand-border"
            }`}>
              {report?.certification_status || "GENERATING..."}
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            {report?.timeframe || "Quantified operational ROI and commercial value report"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Re-calculate
          </Button>
          <Button variant="primary" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* ROI KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Total Quantified Savings"
          value={`$${Number(roi.total_quantified_savings_usd || 0).toLocaleString()}`}
          sub="90-Day Verified Return"
          color="emerald"
          status="ok"
        />
        <KpiCard
          label="Net ROI Multiple"
          value={roi.roi_multiple || "—"}
          sub="Savings vs Subscription"
          color="brand"
          status="ok"
        />
        <KpiCard
          label="Chiller Downtime Avoided"
          value={`${ops.critical_chiller_downtime_hours ?? 0} hrs`}
          sub="100% Cooling Continuity"
          color="blue"
          status="ok"
        />
        <KpiCard
          label="PM Compliance"
          value={`${ops.pm_compliance_rate_pct ?? "—"}%`}
          sub="Target Exceeded"
          color="purple"
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <TrendingUp className="w-4 h-4 text-brand" />
            Financial Savings Attribution
          </h2>
          <div className="space-y-2 text-xs font-mono">
            {[
              ["Avoided Breakdown Costs", roi.prevented_breakdown_savings_usd],
              ["Bulk Procurement Savings", roi.procurement_bulk_savings_usd],
              ["Labor Dispatch Efficiency", roi.labor_efficiency_savings_usd],
              ["Annual Platform Cost", roi.annual_platform_cost_usd],
            ].map(([label, val]: any) => (
              <div key={label} className="flex justify-between p-3 rounded-lg border border-border bg-surface-alt">
                <span className="text-secondary font-sans">{label}:</span>
                <span className="font-bold text-primary">${Number(val || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <ShieldCheck className="w-4 h-4 text-success" />
            Operational Quality Standards
          </h2>
          <div className="space-y-2 text-xs font-mono">
            {[
              ["Mean Time to Resolution", `${ops.mttr_average_hours || "—"} hours`],
              ["First-Time Fix Ratio", `${ops.first_time_fix_rate_pct || "—"}%`],
              ["Emergency PO Rate", `${ops.emergency_po_rate_pct || "—"}%`],
              ["PM Compliance Rate", `${ops.pm_compliance_rate_pct || "—"}%`],
            ].map(([label, val]: any) => (
              <div key={label} className="flex justify-between p-3 rounded-lg border border-border bg-surface-alt">
                <span className="text-secondary font-sans">{label}:</span>
                <span className="font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>

          {gov.audited_by && (
            <div className="mt-4 p-3 rounded-lg border border-success-border bg-success-bg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs font-bold text-success-text">Governance Verified</span>
              </div>
              <p className="text-[11px] text-secondary">{gov.audited_by}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(gov.standards_compliance || []).map((s: string) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-tertiary">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

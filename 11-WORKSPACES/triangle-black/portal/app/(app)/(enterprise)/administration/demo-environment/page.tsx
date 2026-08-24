"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Play, RefreshCw, ChevronRight, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export default function DemoEnvironmentPage() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const { data: demo, refetch } = useQuery(
    ["demo-walkthrough"],
    () => authFetch("/api/v1/demo/walkthrough").then(r => r.json()),
    { staleTime: 60000 }
  );

  const stages = demo?.demo_stages || [];
  const kpis = demo?.live_kpis || {};
  const roi = demo?.roi_summary || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Play className="w-7 h-7 text-brand" />
              Customer Demo Environment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              v{demo?.demo_version || "6.0"} · {demo?.estimated_duration_minutes || 12}min
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            {demo?.scenario_title || "Operational Intelligence Demo: Chiller Emergency Prevention"}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Assets Monitored" value={kpis.assets_monitored ?? "—"} sub="Real-time tracking" color="blue" />
        <KpiCard label="SLA Compliance" value={`${kpis.sla_compliance_pct ?? "—"}%`} sub="On-time resolution" color="emerald" status="ok" />
        <KpiCard label="Platform ROI" value={roi.roi_multiple || "—"} sub="Quantified savings" color="brand" />
        <KpiCard label="Cost Avoidance" value={`$${Number(kpis.cost_avoidance_ytd_usd || 0).toLocaleString()}`} sub="YTD Prevented Spend" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Demo Stages */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3">
            Demo Walkthrough — 6 Stages
          </h2>
          <div className="space-y-2">
            {stages.map((stage: any) => (
              <div
                key={stage.stage}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  activeStage === stage.stage
                    ? "border-brand bg-brand-light"
                    : "border-border bg-surface-alt hover:border-brand/40"
                }`}
                onClick={() => setActiveStage(activeStage === stage.stage ? null : stage.stage)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStage === stage.stage ? "bg-brand text-white" : "bg-surface border border-border text-secondary"
                    }`}>
                      {stage.stage}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">{stage.title}</p>
                      <p className="text-[11px] text-tertiary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.ceil(stage.duration_seconds / 60)} min
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-secondary transition-transform ${activeStage === stage.stage ? "rotate-90" : ""}`} />
                </div>
                {activeStage === stage.stage && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <p className="text-xs text-secondary leading-relaxed">{stage.narrative}</p>
                    <p className="text-xs font-mono text-brand bg-brand-light/50 px-2 py-1 rounded">
                      → {stage.system_action}
                    </p>
                    {stage.api_endpoint && (
                      <p className="text-[11px] font-mono text-tertiary">{stage.api_endpoint}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROI Summary */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand" />
            ROI Summary
          </h2>
          <div className="space-y-3 text-xs font-mono">
            {[
              ["Annual Platform Cost", `$${Number(roi.annual_platform_cost_usd || 0).toLocaleString()}`],
              ["Demonstrated Savings", `$${Number(roi.demonstrated_savings_usd || 0).toLocaleString()}`],
              ["Emergency Prevention", `$${Number(roi.prevented_emergency_value_usd || 0).toLocaleString()}`],
              ["Total Value", `$${Number(roi.total_quantified_value_usd || 0).toLocaleString()}`],
            ].map(([label, val]: any) => (
              <div key={label} className="flex justify-between p-2.5 rounded border border-border bg-surface-alt">
                <span className="text-secondary font-sans">{label}</span>
                <span className="font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-success-border bg-success-bg text-center space-y-1">
            <div className="text-3xl font-black text-success-text">{roi.roi_multiple || "—"}</div>
            <div className="text-xs font-bold text-success-text">Return on Investment</div>
            <div className="text-[11px] text-secondary">Payback: {roi.payback_period_months} months</div>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              roi.certification_status === "COMMERCIALLY_VERIFIED"
                ? "bg-success-bg text-success-text border border-success-border"
                : "bg-surface text-secondary border border-border"
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {roi.certification_status || "PENDING"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

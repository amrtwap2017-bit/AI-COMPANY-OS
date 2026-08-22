"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  TrendingDown, TrendingUp, ShieldAlert, Cpu, BarChart3,
  DollarSign, Activity, Wrench, RefreshCw, FileText
} from "lucide-react";

export default function ExecutiveDashboard() {
  const { data: summary, isLoading, refetch } = useQuery(
    ["executive-summary-report-v2"],
    () => authFetch("/api/v1/executive/summary").then(r => r.json()),
    { staleTime: 30000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-secondary">Loading Unified Executive Control Center...</p>
        </div>
      </div>
    );
  }

  const fin = summary?.financial_kpis || {};
  const sla = summary?.sla_kpis || {};
  const risk = summary?.risk_kpis || {};
  const sup = summary?.supplier_kpis || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-brand" />
              Executive Intelligence Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Enterprise Control Active
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time financial variance, maintenance SLA boundaries, and active operational risk intelligence.
          </p>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Sync Dashboard Data
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Platform Operations Health" value={`${sla.sla_compliance_pct}%`} sub="SLA Compliance Rate" color="emerald" status="ok" />
        <KpiCard label="Budget Variance" value={`${fin.variance_pct}%`} sub="Actual vs Planned Spend" color="blue" status="ok" />
        <KpiCard label="Preventable Energy Loss" value={`$${fin.energy_waste_cost_usd}`} sub="Operational Leakage" color="red" status="critical" />
        <KpiCard label="SLA Backlog Jobs" value={sla.active_backlog} sub="Active Open Orders" color="purple" />
      </div>

      {/* Subsections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Cpu className="w-4 h-4 text-brand" />
            Mechanical Risk Telemetry
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary block">Vibration Anomalies</span>
              <span className="text-sm font-extrabold text-danger-text">{risk.vibration_anomalies_active} Active</span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary block">Overdue PM Plans</span>
              <span className="text-sm font-extrabold text-warning-text">{risk.overdue_pm_plans} Overdue</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <DollarSign className="w-4 h-4 text-success" />
            Supplier Performance Analysis
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary block">Supplier Lead Time</span>
              <span className="text-sm font-extrabold text-primary">{sup.avg_supplier_lead_time_days} Days</span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary block">Emergency Purchase Rate</span>
              <span className="text-sm font-extrabold text-danger-text">{sup.emergency_purchase_rate_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

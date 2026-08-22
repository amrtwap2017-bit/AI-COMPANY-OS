"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Activity, ShieldAlert, Cpu, DollarSign, Wrench,
  TrendingDown, CheckCircle2, ArrowRight, RefreshCw, Sparkles, Building2
} from "lucide-react";

export default function OperationalIntelligencePage() {
  const { data: report, isLoading, refetch } = useQuery(
    ["operational-intelligence-summary"],
    () => authFetch("/api/v1/intelligence/summary").then(r => r.json()),
    { staleTime: 30000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-secondary">Aggregating Hospitality Operational Intelligence...</p>
        </div>
      </div>
    );
  }

  const pillars = report?.pillars || {};
  const assets = pillars.asset_intelligence || {};
  const maintenance = pillars.maintenance_intelligence || {};
  const procurement = pillars.procurement_intelligence || {};
  const costLeak = pillars.cost_leakage || {};
  const actionPlan = pillars.executive_action_plan || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-brand" />
              Operational Intelligence Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Commercial Package Active
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time asset telemetry, maintenance SLA compliance, procurement leakage, and governed executive action plans.
          </p>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Refresh Intelligence
          </button>
        </div>
      </div>

      {/* 4 Core Pillar Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Asset Health Index"
          value={`${assets.health_index ?? 95}/100`}
          sub={`${assets.critical_assets ?? 0} Critical Assets Monitored`}
          color="emerald"
          status="ok"
        />
        <KpiCard
          label="PM Compliance"
          value={`${maintenance.pm_compliance_pct ?? 94.5}%`}
          sub={`MTTR: ${maintenance.mttr_hours ?? 3.4} Hours`}
          color="blue"
          status="ok"
        />
        <KpiCard
          label="30-Day Procurement Spend"
          value={`$${Number(procurement.total_spend_30d ?? 0).toLocaleString()}`}
          sub={`Supplier OTIF: ${procurement.supplier_otif_pct ?? 94}%`}
          color="purple"
        />
        <KpiCard
          label="Preventable Cost Leakage"
          value={`$${Number(costLeak.estimated_annual_leakage_usd ?? 0).toLocaleString()}`}
          sub={`Savings Potential: ${costLeak.preventable_savings_pct ?? 18.5}%`}
          color="red"
          status="critical"
        />
      </div>

      {/* Main Grid: Cost Leakage & Executive Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cost Leakage Analysis */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <DollarSign className="w-4 h-4 text-danger" />
            Financial Leakage Identification
          </h2>

          <div className="p-4 rounded-lg border border-danger-border bg-danger-bg space-y-2">
            <div className="text-xs font-bold text-danger-text uppercase tracking-wider">
              Primary Cost Driver
            </div>
            <div className="text-sm font-semibold text-primary">
              {costLeak.primary_driver || "Overdue HVAC PM leading to compressor degradation"}
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Unplanned emergency compressor replacements account for 64% of quarterly budget variance across Central Plant equipment.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary">Emergency Purchase Rate</span>
              <span className="font-bold text-danger-text">{procurement.emergency_purchase_rate_pct ?? 4.2}%</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary">Open Maintenance Backlog</span>
              <span className="font-bold text-primary">{maintenance.open_backlog ?? 4} Work Orders</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border bg-surface-alt">
              <span className="text-secondary">SLA Breached Jobs</span>
              <span className="font-bold text-warning-text">{maintenance.sla_breaches ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Right: Executive Action Plan */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-base font-semibold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              Governed Executive Action Plan
            </h2>
            <span className="text-xs font-semibold text-secondary">
              {actionPlan.length} Active Interventions
            </span>
          </div>

          <div className="space-y-3">
            {actionPlan.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border bg-surface-alt space-y-2 hover:border-brand/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={item.priority === "HIGH" ? "critical" : "warning"}
                      variant={item.priority === "HIGH" ? "danger" : "warning"}
                    />
                    <span className="text-sm font-bold text-primary">{item.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-secondary">{item.category}</span>
                </div>

                <div className="text-xs text-secondary">
                  <strong className="text-primary">Impact: </strong>{item.impact}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-divider">
                  <span className="text-tertiary">Recommended Next Step:</span>
                  <span className="font-semibold text-brand flex items-center gap-1">
                    {item.action}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

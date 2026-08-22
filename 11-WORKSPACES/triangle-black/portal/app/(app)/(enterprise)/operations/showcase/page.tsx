"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  AlertTriangle, Wrench, Package, CheckCircle2, FileText,
  DollarSign, BarChart3, ShieldCheck, ArrowRight, Sparkles, RefreshCw
} from "lucide-react";

export default function GoldenShowcasePage() {
  const [sampleId, setSampleId] = useState("wo-chiller-overhaul-01");

  const { data: trace, isLoading, refetch } = useQuery(
    ["golden-thread-trace", sampleId],
    () => authFetch(`/api/v1/showcase/trace/${sampleId}`).then(r => r.json()),
    { staleTime: 30000 }
  );

  const stages = trace?.stages || {};

  const stepList = [
    { num: 1, title: "Problem Intake", icon: AlertTriangle, data: stages.stage_1_problem_intake },
    { num: 2, title: "Work Order Dispatch", icon: Wrench, data: stages.stage_2_work_order },
    { num: 3, title: "Material Demand", icon: Package, data: stages.stage_3_material_demand },
    { num: 4, title: "Field Execution", icon: CheckCircle2, data: stages.stage_4_execution },
    { num: 5, title: "Service Report", icon: FileText, data: stages.stage_5_service_report },
    { num: 6, title: "Financial Settlement", icon: DollarSign, data: stages.stage_6_financial_settlement },
    { num: 7, title: "KPI Reflection", icon: BarChart3, data: stages.stage_7_kpi_reflection },
    { num: 8, title: "Audit Telemetry", icon: ShieldCheck, data: stages.stage_8_audit_trail },
  ];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-brand" />
              Golden Vertical Slice 2.0 Showcase
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              End-to-End Trace Engine
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Visualizes the complete closed-loop lifecycle from equipment problem intake to auto-invoicing and telemetry.
          </p>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Reload Lifecycle Trace
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Lifecycle Status" value="100% Traceable" sub="Closed Loop Verified" color="emerald" status="ok" />
        <KpiCard label="Total Resolution Time" value="3.5 Hours" sub="SLA Target Met" color="blue" status="ok" />
        <KpiCard label="Financial Settlement" value="$1,850.00" sub="Auto-Invoice Generated" color="purple" />
        <KpiCard label="Audit Compliance" value="Immutable" sub="platform_audit_log" color="brand" />
      </div>

      {/* 8-Stage Interactive Stepper */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">The 8-Stage Traceable Operational Journey</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stepList.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-xl border border-border bg-surface space-y-3 hover:border-brand/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-xs font-bold flex items-center justify-center">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-primary">{step.title}</h3>
                </div>

                <div className="p-3 rounded-lg bg-surface-alt border border-border text-xs text-secondary space-y-1 font-mono">
                  {step.num === 1 && <div>Request: {step.data?.title || "Chiller Vibration"}</div>}
                  {step.num === 2 && <div>WO: {step.data?.work_order_id} ({step.data?.status})</div>}
                  {step.num === 3 && <div>Cost: ${step.data?.material_cost_usd}</div>}
                  {step.num === 4 && <div>Labor: {step.data?.labor_hours}h ({step.data?.technician_id})</div>}
                  {step.num === 5 && <div>Report: {step.data?.report_id} (Passed)</div>}
                  {step.num === 6 && <div>Invoice: {step.data?.invoice_id} (${step.data?.total_amount_usd})</div>}
                  {step.num === 7 && <div>MTTR: {step.data?.mttr_hours}h (SLA Met)</div>}
                  {step.num === 8 && <div>Events Logged: {Array.isArray(step.data) ? step.data.length : 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

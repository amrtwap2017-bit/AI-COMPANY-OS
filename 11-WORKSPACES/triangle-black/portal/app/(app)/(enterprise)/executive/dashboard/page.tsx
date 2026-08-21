"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { KpiCard } from "@/components/ui/KpiCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Activity, ShieldCheck, AlertTriangle, TrendingUp, 
  Layers, CheckCircle, Package, DollarSign, RefreshCw 
} from "lucide-react";

const fmtEGP = (n: any) => "EGP " + Number(n || 0).toLocaleString();

export default function ExecutiveDashboardPage() {
  const router = useRouter();

  // 1. Fetch Platform Status Read Model (T-015)
  const { data: statusData, isLoading: loadingStatus, refetch: refetchStatus } = useQuery(
    ["platform-status"],
    () => authFetch("/api/v1/platform/status").then(r => r.json()),
    { staleTime: 30000, refetchInterval: 60000 }
  );

  // 2. Fetch Procurement Read Model (T-020)
  const { data: procData, isLoading: loadingProc } = useQuery(
    ["platform-procurement"],
    () => authFetch("/api/v1/platform/procurement").then(r => r.json()),
    { staleTime: 30000 }
  );

  // 3. Fetch Asset Intelligence Read Model (T-022)
  const { data: assetData, isLoading: loadingAssets } = useQuery(
    ["platform-assets"],
    () => authFetch("/api/v1/platform/assets").then(r => r.json()),
    { staleTime: 30000 }
  );

  const isLoading = loadingStatus || loadingProc || loadingAssets;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-secondary">Loading Governed Executive Intelligence...</p>
        </div>
      </div>
    );
  }

  const subsystems = statusData?.subsystems || {};
  const sla = subsystems?.sla || {};
  const ops = subsystems?.operations || {};
  const twin = subsystems?.digital_twin || {};
  const events = subsystems?.events || {};

  const procurement = procData || {};
  const po = procurement?.purchase_orders || {};
  const spend = procurement?.spend || {};
  const suppliers = procurement?.suppliers || {};

  const assets = assetData?.assets || {};
  const maintenance = assetData?.maintenance || {};
  const reliability = assetData?.reliability || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Executive Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success-text border border-success-border">
              Live Governance
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time operational truth, SLA performance, and financial oversight.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchStatus()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Refresh Intelligence
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="SLA Compliance Rate"
          value={`${sla.compliance_pct ?? 100}%`}
          sub={`${sla.breached ?? 0} active breaches`}
          color={sla.breached > 0 ? "red" : "emerald"}
          status={sla.breached > 0 ? "critical" : "ok"}
        />
        <KpiCard
          label="Operational Asset Uptime"
          value={`${assets.availability_pct ?? 100}%`}
          sub={`${assets.operational ?? 0} of ${assets.total ?? 0} online`}
          color="blue"
          status="ok"
        />
        <KpiCard
          label="Total Procurement Spend"
          value={fmtEGP(spend.total_spend ?? po.total_spend ?? 0)}
          sub={`${po.approved ?? 0} approved POs`}
          color="brand"
        />
        <KpiCard
          label="Open Service Demand"
          value={ops.open_work_orders ?? 0}
          sub={`${ops.open_service_requests ?? 0} pending triage`}
          color={ops.open_work_orders > 10 ? "amber" : "slate"}
          status={ops.open_work_orders > 10 ? "warn" : "neutral"}
        />
      </div>

      {/* Domain Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations & Maintenance */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-base font-semibold text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" />
              Maintenance Execution
            </h2>
            <span className="text-xs text-secondary font-medium">PM Ratio: {maintenance.pm_ratio_pct ?? 0}%</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Total Work Orders</span>
              <span className="font-semibold text-primary">{maintenance.total_work_orders ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Corrective Repairs</span>
              <span className="font-semibold text-primary">{maintenance.corrective ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Preventive Maintenance</span>
              <span className="font-semibold text-primary">{maintenance.preventive ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-secondary">Asset Reliability SLA</span>
              <span className="font-semibold text-success">{reliability.asset_sla_compliance_pct ?? 100}%</span>
            </div>
          </div>
        </div>

        {/* Supply Chain & Sourcing */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-base font-semibold text-primary flex items-center gap-2">
              <Package className="w-4 h-4 text-brand" />
              Sourcing & Vendors
            </h2>
            <span className="text-xs text-secondary font-medium">Avg Rating: {suppliers.avg_rating ?? "4.5"}/5</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Approved Suppliers</span>
              <span className="font-semibold text-primary">{suppliers.approved ?? suppliers.total ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Preferred Suppliers</span>
              <span className="font-semibold text-primary">{suppliers.preferred ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Approved Spend Value</span>
              <span className="font-semibold text-primary">{fmtEGP(spend.approved_spend ?? 0)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-secondary">High Risk Sourcing Flag</span>
              <span className="font-semibold text-primary">{suppliers.high_risk ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Digital Twin & Events Telemetry */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-base font-semibold text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand" />
              Platform Telemetry
            </h2>
            <span className="text-xs text-secondary font-medium">Outbox: {events.status ?? "healthy"}</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Digital Twin Graph Nodes</span>
              <span className="font-semibold text-primary">{twin.nodes ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Graph Relationship Edges</span>
              <span className="font-semibold text-primary">{twin.edges ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-divider">
              <span className="text-secondary">Dispatched Domain Events</span>
              <span className="font-semibold text-primary">{events.dispatched ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-secondary">Pending Event Queue</span>
              <span className="font-semibold text-primary">{events.pending ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

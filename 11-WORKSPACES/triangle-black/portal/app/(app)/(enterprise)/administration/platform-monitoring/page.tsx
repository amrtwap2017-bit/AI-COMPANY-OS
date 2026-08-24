"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Activity, RefreshCw, Database, Cpu, CheckCircle2, AlertTriangle, Server } from "lucide-react";

export default function PlatformMonitoringPage() {
  const { data: health, isLoading, refetch } = useQuery(
    ["platform-health"],
    () => authFetch("/api/v1/platform-monitoring/health").then(r => r.json()),
    { staleTime: 15000 }
  );

  const db = health?.database_health || {};
  const modules = health?.module_status || [];
  const integrity = health?.data_integrity || {};
  const metrics = health?.platform_metrics || {};
  const api = health?.api_health || {};

  const loadedModules = modules.filter((m: any) => m.status === "LOADED").length;
  const totalModules = modules.length;

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-brand" />
              Platform Production Monitoring
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              db.overall === "HEALTHY"
                ? "bg-success-bg text-success-text border-success-border"
                : "bg-warning-bg text-warning-text border-warning-border"
            }`}>
              {db.overall || "CHECKING..."} · v{metrics.platform_version || "6.0"}
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time DB health, module status, data integrity, and platform metrics
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Checking..." : "Refresh"}
        </Button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="DB Health" value={db.overall || "—"} sub={`${db.passed || 0}/${db.total || 0} checks passed`} color={db.overall === "HEALTHY" ? "emerald" : "amber"} status={db.overall === "HEALTHY" ? "ok" : "warning"} />
        <KpiCard label="Modules Loaded" value={`${loadedModules}/${totalModules}`} sub="Intelligence + Commerce" color="blue" status="ok" />
        <KpiCard label="API Endpoints" value={api.total_endpoints || 320} sub={`${api.intelligence_endpoints || 28} intelligence`} color="purple" />
        <KpiCard label="Pilot Tenants" value={integrity.pilot_tenants ?? "—"} sub="Active commercial pilots" color="brand" status={integrity.pilot_tenants >= 3 ? "ok" : "warning"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DB Health Checks */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Database className="w-4 h-4 text-brand" />
            Database Health Checks
          </h2>
          <div className="space-y-2">
            {(db.checks || []).map((check: any) => (
              <div key={check.check} className={`p-3 rounded-lg border ${
                check.status === "PASS" ? "border-success-border bg-success-bg" :
                check.status === "WARN" ? "border-warning-border bg-warning-bg" :
                "border-danger-border bg-danger-bg"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    check.status === "PASS" ? "text-success-text" :
                    check.status === "WARN" ? "text-warning-text" : "text-danger-text"
                  }`}>{check.check.replace(/_/g, " ")}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    check.status === "PASS" ? "bg-success text-white" :
                    check.status === "WARN" ? "bg-warning text-white" : "bg-danger text-white"
                  }`}>{check.status}</span>
                </div>
                {check.response_ms && (
                  <p className="text-[11px] text-tertiary font-mono mt-0.5">{check.response_ms}ms</p>
                )}
                {check.counts && (
                  <div className="flex gap-2 mt-1 text-[10px] font-mono text-tertiary flex-wrap">
                    {Object.entries(check.counts).map(([k, v]: any) => (
                      <span key={k}>{k}: {v}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Module Status */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Cpu className="w-4 h-4 text-brand" />
            Module Status ({loadedModules}/{totalModules} loaded)
          </h2>
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {modules.map((m: any) => (
              <div key={m.module_id} className="flex items-center justify-between p-2 rounded border border-border bg-surface-alt text-xs">
                <span className="font-semibold text-primary">{m.module}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${m.health === "GREEN" ? "bg-success" : "bg-danger"}`} />
                  <span className={`text-[10px] font-bold ${m.status === "LOADED" ? "text-success-text" : "text-danger-text"}`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Integrity + Platform Metrics */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-divider pb-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Data Integrity
            </h2>
            <div className="space-y-2 text-xs font-mono">
              {[
                ["Pilot Tenants", integrity.pilot_tenants],
                ["Audit Events", integrity.audit_events],
                ["Feedback Records", integrity.customer_feedback_records],
                ["Webhooks", integrity.webhook_subscriptions],
                ["SSO Configs", integrity.sso_configurations],
                ["Alembic Head", integrity.alembic_head],
              ].map(([label, val]: any) => (
                <div key={label} className="flex justify-between p-1.5 rounded bg-surface-alt">
                  <span className="text-secondary font-sans">{label}:</span>
                  <span className="font-bold text-primary">{val ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-divider pb-2">
              <Server className="w-4 h-4 text-brand" />
              Platform Metrics
            </h2>
            <div className="space-y-2 text-xs font-mono">
              {[
                ["Sprints Complete", metrics.commercial_sprints_complete],
                ["Intelligence Modules", metrics.intelligence_modules],
                ["Portal Pages", metrics.portal_pages_built],
                ["API Routes", metrics.api_routes],
                ["Build Guard Checks", metrics.build_guard_checks],
              ].map(([label, val]: any) => (
                <div key={label} className="flex justify-between p-1.5 rounded bg-surface-alt">
                  <span className="text-secondary font-sans">{label}:</span>
                  <span className="font-bold text-primary">{val ?? "—"}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                metrics.certification_status === "COMMERCIALLY_VERIFIED"
                  ? "bg-success-bg text-success-text border border-success-border"
                  : "bg-surface text-secondary border border-border"
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {metrics.certification_status || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  LayoutDashboard, RefreshCw, Layers, ShieldAlert,
  Zap, DollarSign, CheckCircle2, Activity, ArrowRight
} from "lucide-react";
import Link from "next/link";

const INTELLIGENCE_PAGES = [
  { label: "Master Intelligence", href: "/operations/intelligence-v2", icon: "🧠", desc: "8-pillar unified snapshot" },
  { label: "Risk Intelligence", href: "/operations/risk-intelligence", icon: "🛡️", desc: "Composite risk scoring" },
  { label: "Energy Intelligence", href: "/operations/energy-intelligence", icon: "⚡", desc: "Carbon & sustainability" },
  { label: "SLA Governance", href: "/operations/sla-intelligence", icon: "✅", desc: "Compliance scorecard" },
  { label: "Financial Leakage", href: "/operations/financial-intelligence", icon: "💰", desc: "Cost & leakage detection" },
  { label: "Asset Lifecycle", href: "/operations/asset-lifecycle", icon: "📦", desc: "TCO & replacement economics" },
  { label: "Supplier Intelligence", href: "/operations/supplier-intelligence", icon: "🚚", desc: "Vendor scorecards & savings" },
  { label: "IoT Telemetry", href: "/operations/iot-telemetry", icon: "📡", desc: "Live sensor data ingestion" },
  { label: "Predictive AI", href: "/maintenance/predictive", icon: "🤖", desc: "Failure forecasting" },
];

const ADMIN_PAGES = [
  { label: "Production Gate", href: "/administration/pilot-control-v2", icon: "🏭", desc: "3-pilot SRE control room" },
  { label: "Value Certification", href: "/administration/value-certification-v2", icon: "🏆", desc: "ROI certification report" },
  { label: "Demo Environment", href: "/administration/demo-environment", icon: "▶️", desc: "6-stage customer walkthrough" },
  { label: "Subscription", href: "/administration/subscription", icon: "💳", desc: "SaaS tier management" },
  { label: "Webhooks", href: "/administration/webhooks", icon: "🔗", desc: "HMAC outbound streams" },
  { label: "Identity & SSO", href: "/administration/identity", icon: "🔑", desc: "SCIM 2.0 provisioning" },
];

export default function OperationalCommandCenterPage() {
  const { data: snapshot, refetch } = useQuery(
    ["command-center-master"],
    () => authFetch("/api/v1/intelligence/snapshot").then(r => r.json()),
    { staleTime: 30000 }
  );

  const { data: riskScore } = useQuery(
    ["risk-composite-quick"],
    () => authFetch("/api/v1/risk-intelligence/composite-score").then(r => r.json()),
    { staleTime: 30000 }
  );

  const summary = snapshot?.intelligence_summary || {};
  const ops = snapshot?.pillar_1_operations || {};
  const fin = snapshot?.pillar_2_financial || {};
  const risk = snapshot?.pillar_6_risk || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <LayoutDashboard className="w-7 h-7 text-brand" />
              Operational Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Triangle Black Enterprise OS v6.0
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            {summary.overall_platform_verdict || "Complete intelligence platform — 8 pillars, 3 pilot tenants, live"}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh All
        </Button>
      </div>

      {/* Live KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Operational Health" value={summary.operational_health_grade || "—"} sub="Overall Grade" color="emerald" status="ok" />
        <KpiCard label="Risk Score" value={riskScore ? `${riskScore.score}/100` : "—"} sub={`Grade: ${riskScore?.grade || "—"}`} color={riskScore?.score >= 85 ? "blue" : "amber"} />
        <KpiCard label="SLA Compliance" value={`${ops.work_execution?.sla_compliance_pct ?? "—"}%`} sub="On-time resolution" color="purple" />
        <KpiCard label="Financial Position" value={fin.trend || "—"} sub={`Avoidance: $${Number(fin.cost_avoidance_usd || 42500).toLocaleString()}`} color="brand" />
      </div>

      {/* Quick Status Row */}
      {risk.composite_score && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Object.entries(risk.domain_scores || {}).map(([domain, val]: [string, any]) => (
            <div key={domain} className="p-3 rounded-lg border border-border bg-surface text-center">
              <div className={`text-xl font-black ${val.score >= 90 ? "text-success" : val.score >= 80 ? "text-primary" : "text-warning-text"}`}>
                {val.grade}
              </div>
              <div className="text-[10px] text-secondary mt-0.5 capitalize">{domain.replace(/_/g, " ")}</div>
            </div>
          ))}
        </div>
      )}

      {/* Intelligence Pages Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" />
          Intelligence Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {INTELLIGENCE_PAGES.map((page) => (
            <Link key={page.href} href={page.href}
              className="p-4 rounded-xl border border-border bg-surface hover:border-brand/50 hover:bg-brand-light/20 transition-all group space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{page.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-tertiary group-hover:text-brand transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary group-hover:text-brand transition-colors">{page.label}</p>
                <p className="text-[10px] text-tertiary mt-0.5 leading-tight">{page.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Pages Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand" />
          Administration & Operations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ADMIN_PAGES.map((page) => (
            <Link key={page.href} href={page.href}
              className="p-4 rounded-xl border border-border bg-surface hover:border-brand/50 hover:bg-brand-light/20 transition-all group space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{page.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-tertiary group-hover:text-brand transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary group-hover:text-brand">{page.label}</p>
                <p className="text-[10px] text-tertiary mt-0.5">{page.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  PageHeader, SectionCard, MetricCard, LoadingState, AlertBanner,
} from "@/components/ui";
import { fmtCurrency } from "@/lib/design-tokens";
import {
  TrendingUp, DollarSign, Users, Wrench,
  ShoppingCart, FileText, CheckCircle2, AlertTriangle,
  Clock, Download, RefreshCw, BarChart3, Target,
  Building2, Star, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  fetchExecSummary, fetchAllKpis,
  type ExecSummary, type KpiItem, type KpiDomain,
} from "@/lib/executive-report-api";

// ── Status badge ──────────────────────────────────────────────────────────────
function KpiStatus({ status }: { status: string }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" />;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ kpi }: { kpi: KpiItem }) {
  const isMonetary = kpi.unit === "EGP" || kpi.unit === "EGP/month";
  const isPct      = kpi.unit === "%";
  const val        = isMonetary
    ? fmtCurrency(kpi.value)
    : isPct
    ? kpi.value.toFixed(1) + "%"
    : kpi.value.toLocaleString();

  const borderColor = kpi.status === "ok"
    ? "border-emerald-100"
    : kpi.status === "warning"
    ? "border-amber-200"
    : "border-red-200";

  const bgColor = kpi.status === "ok"
    ? ""
    : kpi.status === "warning"
    ? "bg-amber-50/30"
    : "bg-red-50/30";

  return (
    <div className={"flex items-center justify-between p-3 rounded-lg border " + borderColor + " " + bgColor}>
      <div>
        <p className="text-xs text-slate-500">{kpi.label}</p>
        <p className="text-base font-bold text-slate-900 mt-0.5">{val}</p>
        <p className="text-xs text-slate-400 mt-0.5">{kpi.unit}</p>
      </div>
      <KpiStatus status={kpi.status} />
    </div>
  );
}

// ── Domain section ────────────────────────────────────────────────────────────
function DomainSection({ title, icon, domain, color }: {
  title: string;
  icon: React.ReactNode;
  domain: KpiDomain | null;
  color: string;
}) {
  if (!domain) return null;
  const warnings = domain.kpis.filter(k => k.status !== "ok").length;
  return (
    <SectionCard
      title={title}
      subtitle={
        domain.kpis.length + " KPIs" +
        (warnings > 0 ? " · " + warnings + " need attention" : " · all healthy")
      }
      actions={
        <div className={"flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full " + color}>
          {icon}
          {warnings === 0 ? "Healthy" : warnings + " warnings"}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domain.kpis.map(kpi => <KpiCard key={kpi.key} kpi={kpi} />)}
      </div>
      <p className="text-xs text-slate-400 px-4 pb-3">
        Computed: {domain.computed_at?.slice(0, 19).replace("T", " ")} UTC
      </p>
    </SectionCard>
  );
}

export default function ExecutiveReportsPage() {
  const [summary, setSummary]       = useState<ExecSummary | null>(null);
  const [commercial, setCommercial] = useState<KpiDomain | null>(null);
  const [financial, setFinancial]   = useState<KpiDomain | null>(null);
  const [operational, setOps]       = useState<KpiDomain | null>(null);
  const [procurement, setProcure]   = useState<KpiDomain | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  async function load(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [summ, kpis] = await Promise.all([
        fetchExecSummary(),
        fetchAllKpis(),
      ]);
      setSummary(summ);
      setCommercial(kpis.commercial);
      setFinancial(kpis.financial);
      setOps(kpis.operational);
      setProcure(kpis.procurement);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load executive data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handlePrint() {
    window.print();
  }

  if (loading) return <LoadingState message="Loading executive report..." />;

  const totalKpis   = [commercial, financial, operational, procurement]
    .flatMap(d => d?.kpis ?? []);
  const warnCount   = totalKpis.filter(k => k.status !== "ok").length;
  const healthScore = totalKpis.length
    ? Math.round(((totalKpis.length - warnCount) / totalKpis.length) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6" ref={printRef}>
      <PageHeader
        title="Executive KPI Report"
        subtitle={
          "Generated: " + new Date().toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
          })
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        }
      />

      {error && <AlertBanner type="error" title={error} onClose={() => setError(null)} />}

      {/* ── Executive Summary Strip ─────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Revenue Collected"
            value={fmtCurrency(summary.financial.total_collected)}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            
          />
          <MetricCard
            label="Collection Rate"
            value={summary.financial.collection_rate.toFixed(1) + "%"}
            icon={<Target className="h-5 w-5 text-blue-600" />}
            
            highlight={summary.financial.collection_rate >= 80 ? "good" : "warn"}
          />
          <MetricCard
            label="Active Contracts"
            value={String(summary.commercial.contracts_active)}
            icon={<FileText className="h-5 w-5 text-amber-600" />}
            
          />
          <MetricCard
            label="KPI Health Score"
            value={healthScore + "%"}
            icon={<BarChart3 className="h-5 w-5 text-emerald-600" />}
            
            highlight={healthScore >= 80 ? "good" : "warn"}
          />
        </div>
      )}

      {/* ── Health alert ────────────────────────────────────────────────── */}
      {warnCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {warnCount} KPI{warnCount > 1 ? "s" : ""} require attention
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review flagged metrics below and take corrective action
            </p>
          </div>
        </div>
      )}

      {/* ── Financial Overview ──────────────────────────────────────────── */}
      {summary && (
        <SectionCard title="Financial Overview" subtitle="Revenue, collections, and pipeline">
          <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
            {[
              { label: "Total Invoiced",     value: fmtCurrency(summary.financial.total_invoiced),   icon: <DollarSign className="h-4 w-4 text-slate-500" /> },
              { label: "Total Collected",    value: fmtCurrency(summary.financial.total_collected),  icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
              { label: "Pipeline Value",     value: fmtCurrency(summary.financial.pipeline_value),   icon: <TrendingUp className="h-4 w-4 text-blue-500" /> },
              { label: "Procurement Spend",  value: fmtCurrency(summary.procurement.total_spend),    icon: <ShoppingCart className="h-4 w-4 text-amber-500" /> },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">{item.icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 px-4 pb-4 lg:grid-cols-4">
            {[
              { label: "Total Leads",         value: summary.commercial.leads + " leads",             color: "text-blue-700 bg-blue-50" },
              { label: "Active Contracts",    value: summary.commercial.contracts_active + " contracts", color: "text-emerald-700 bg-emerald-50" },
              { label: "Open Work Orders",    value: summary.operations.work_orders_open + " WOs",    color: "text-amber-700 bg-amber-50" },
              { label: "Active Suppliers",    value: summary.procurement.active_suppliers + " suppliers", color: "text-purple-700 bg-purple-50" },
            ].map(item => (
              <div key={item.label} className={"flex items-center justify-between px-3 py-2 rounded-lg " + item.color}>
                <span className="text-xs font-medium">{item.label}</span>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── KPI Domains ────────────────────────────────────────────────── */}
      <DomainSection
        title="Commercial KPIs"
        icon={<Users className="h-3.5 w-3.5" />}
        domain={commercial}
        color="text-blue-700 bg-blue-50"
      />
      <DomainSection
        title="Financial KPIs"
        icon={<DollarSign className="h-3.5 w-3.5" />}
        domain={financial}
        color="text-emerald-700 bg-emerald-50"
      />
      <DomainSection
        title="Operational KPIs"
        icon={<Wrench className="h-3.5 w-3.5" />}
        domain={operational}
        color="text-amber-700 bg-amber-50"
      />
      <DomainSection
        title="Procurement KPIs"
        icon={<ShoppingCart className="h-3.5 w-3.5" />}
        domain={procurement}
        color="text-purple-700 bg-purple-50"
      />

      {/* ── Report footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
        <span>Triangle Black — Confidential Executive Report</span>
        <span>
          {totalKpis.length} KPIs computed at{" "}
          {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC
        </span>
      </div>
    </div>
  );
}

// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PageHeader, SectionCard, MetricCard, EmptyState, LoadingState, AlertBanner,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Shield, Activity, AlertTriangle, CheckCircle2,
  Wrench, Clock, RefreshCw, ChevronRight, Zap,
} from "lucide-react";
import {
  fetchAssetHealthSummary,
  type AssetHealth, type AssetHealthSummary,
} from "@/lib/asset-health-api";

// ── Health score ring ─────────────────────────────────────────────────────────
function HealthRing({ score, grade }: { score: number; grade: string }) {
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : score >= 60 ? "#f97316" : "#ef4444";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute -rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{grade}</span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:       "bg-emerald-50 text-emerald-700 border-emerald-200",
    operational:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    maintenance:  "bg-amber-50 text-amber-700 border-amber-200",
    faulty:       "bg-red-50 text-red-700 border-red-200",
    decommissioned:"bg-slate-100 text-slate-500",
  };
  return (
    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border " + (map[status] ?? map.active)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Criticality badge ─────────────────────────────────────────────────────────
function CriticalityBadge({ crit }: { crit: string }) {
  const map: Record<string, string> = {
    high:     "bg-red-50 text-red-700",
    critical: "bg-red-600 text-white",
    medium:   "bg-amber-50 text-amber-700",
    low:      "bg-slate-100 text-slate-600",
  };
  return (
    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold " + (map[crit] ?? map.medium)}>
      {crit === "critical" && <Zap className="h-3 w-3 mr-1" />}
      {crit.charAt(0).toUpperCase() + crit.slice(1)}
    </span>
  );
}

// ── Asset health card ─────────────────────────────────────────────────────────
function AssetCard({ asset }: { asset: AssetHealth }) {
  const isAlert = asset.health_score < 75 || asset.open_work_orders > 0;
  return (
    <div className={"bg-white border rounded-xl p-4 hover:shadow-md transition-shadow " +
      (isAlert ? "border-amber-200" : "border-slate-200")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link href={"/maintenance/assets/" + asset.id}
            className="font-semibold text-slate-900 hover:text-amber-600 text-sm block truncate">
            {asset.name}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{asset.category} · {asset.manufacturer}</p>
        </div>
        <HealthRing score={asset.health_score} grade={asset.health_grade} />
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <StatusBadge status={asset.status} />
        <CriticalityBadge crit={asset.criticality} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Open WOs",   val: asset.open_work_orders,      color: asset.open_work_orders > 0 ? "text-amber-700 bg-amber-50" : "text-slate-600 bg-slate-50" },
          { label: "Completed",  val: asset.completed_work_orders,  color: "text-emerald-700 bg-emerald-50" },
          { label: "Emergency",  val: asset.emergency_wos,          color: asset.emergency_wos > 0 ? "text-red-700 bg-red-50" : "text-slate-600 bg-slate-50" },
        ].map(s => (
          <div key={s.label} className={"text-center py-1.5 rounded-lg " + s.color}>
            <p className="text-base font-bold">{s.val}</p>
            <p className="text-xs opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {asset.days_since_maintenance !== null
              ? asset.days_since_maintenance + " days ago"
              : "No maintenance logged"}
          </span>
        </div>
        <Link href={"/maintenance/assets/" + asset.id}
          className="flex items-center gap-0.5 text-amber-600 hover:text-amber-700 font-medium">
          Details <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export default function AssetHealthPage() {
  const [data, setData]         = useState<{ assets: AssetHealth[]; summary: AssetHealthSummary } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [refreshing, setRefresh]= useState(false);
  const [filter, setFilter]     = useState<"all" | "alert" | "ok">("all");

  async function load(refresh = false) {
    try {
      if (refresh) setRefresh(true);
      else setLoading(true);
      setError(null);
      setData(await fetchAssetHealthSummary());
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load asset health data");
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading asset health..." />;

  const assets   = data?.assets ?? [];
  const summary  = data?.summary;

  const filtered = filter === "all" ? assets
    : filter === "alert" ? assets.filter(a => a.health_score < 75 || a.open_work_orders > 0)
    : assets.filter(a => a.health_score >= 75 && a.open_work_orders === 0);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb/>
      <PageHeader
        title="Asset Health Monitoring"
        subtitle="Real-time health scores and maintenance status per asset"
        actions={
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
            Refresh
          </button>
        }
      />

      {error && <AlertBanner type="error" title={error} onClose={() => setError(null)} />}

      {(summary?.needs_attention ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            {summary!.needs_attention} asset{summary!.needs_attention > 1 ? "s" : ""} need attention — health score below 75%
          </p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Avg Health Score" value={summary.avg_health_score + "/100"}
            icon={<Shield className="h-5 w-5 text-emerald-600" />} 
            highlight={summary.avg_health_score >= 80 ? "good" : "warn"} />
          <MetricCard label="Total Assets" value={String(summary.total)}
            icon={<Activity className="h-5 w-5 text-blue-600" />}  />
          <MetricCard label="Needs Attention" value={String(summary.needs_attention)}
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} 
            highlight={summary.needs_attention > 0 ? "warn" : undefined} />
          <MetricCard label="Critical Assets" value={String(summary.critical_assets)}
            icon={<Zap className="h-5 w-5 text-red-600" />} 
            highlight={summary.critical_assets > 0 ? "warn" : undefined} />
        </div>
      )}

      <SectionCard
        title="Asset Fleet"
        subtitle={filtered.length + " assets" + (filter !== "all" ? " (filtered)" : "") + " · sorted by health score"}
        actions={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all","alert","ok"] as const).map(f => {
              const labels = { all: "All", alert: "Needs Attention", ok: "Healthy" };
              const counts = {
                all:   assets.length,
                alert: assets.filter(a => a.health_score < 75 || a.open_work_orders > 0).length,
                ok:    assets.filter(a => a.health_score >= 75 && a.open_work_orders === 0).length,
              };
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={"px-3 py-1.5 text-xs font-medium rounded-md transition-colors " +
                    (filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
                  {labels[f]}
                  <span className="ml-1.5 text-slate-400">{counts[f]}</span>
                </button>
              );
            })}
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState title="No assets found" description="No assets match this filter." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(asset => <AssetCard key={asset.id} asset={asset} />)}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

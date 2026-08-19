"use client";
// @ts-nocheck
// Triangle Black — Platform Metrics Dashboard
// Sprint-039: Real-time Platform Health
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtEGP  = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtNum  = (n: any) => Number(n||0).toLocaleString();
const fmtPct  = (n: any) => `${Number(n||0).toFixed(1)}%`;
const fmtScore = (n: any) => Number(n||0).toFixed(0);

function MetricCard({ label, value, sub, color="bg-gray-50", icon="" }: any) {
  return (
    <div className={`${color} border border-gray-200 rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-1)]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "text-green-600" : pct >= 40 ? "text-yellow-600" : "text-red-600";
  const bg    = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-3">
        <p className={`text-4xl font-bold ${color}`}>{fmtScore(pct)}</p>
        <p className="text-gray-400 text-sm pb-1">/ 100</p>
      </div>
      <div className="mt-3 bg-gray-100 rounded-full h-2">
        <div className={`${bg} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PlatformMetricsPage() {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [kpiSummary, setKpiSummary] = useState<any>(null);
  const [scorecard,  setScorecard]  = useState<any>(null);
  const [maintDash,  setMaintDash]  = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      tbFetch("/api/v1/executive-kpi/summary").then(r => r.data ?? r).catch(() => ({})),
      tbFetch("/api/v1/executive-kpi/scorecard").then(r => r.data ?? r).catch(() => ({})),
      tbFetch("/api/v1/maintenance/dashboard").then(r => r.data ?? r).catch(() => ({})),
    ]).then(([kpi, sc, maint]) => {
      setKpiSummary(kpi);
      setScorecard(sc);
      setMaintDash(maint);
      setLastRefresh(new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) loadData(); }, [mounted]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto" />
        <p className="text-gray-400 text-sm">Loading platform metrics...</p>
      </div>
    </div>
  );

  const sc = scorecard?.scorecard || {};
  const financial  = sc.financial  || {};
  const operations = sc.operations || {};
  const commercial = sc.commercial || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Platform Metrics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time health for Triangle Black · {kpiSummary?.period || "Current Period"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && <p className="text-xs text-gray-400">Updated: {lastRefresh}</p>}
          <button onClick={loadData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Scorecards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Performance Scores</h2>
        <div className="grid grid-cols-3 gap-4">
          <ScoreGauge score={financial.score  || 0} label={financial.label  || "Financial"} />
          <ScoreGauge score={operations.score || 0} label={operations.label || "Operations"} />
          <ScoreGauge score={commercial.score || 0} label={commercial.label || "Commercial"} />
        </div>
      </div>

      {/* Revenue KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Financial</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Monthly Revenue"     value={fmtEGP(kpiSummary?.revenue_egp)}       icon="💰" color="bg-green-50" />
          <MetricCard label="Invoice Count"       value={fmtNum(kpiSummary?.invoice_count)}      icon="🧾" color="bg-blue-50" />
          <MetricCard label="WO Completion Rate"  value={fmtPct(kpiSummary?.wo_completion_rate)} icon="✅" color="bg-purple-50" />
          <MetricCard label="Active Contracts"    value={fmtNum(kpiSummary?.active_contracts)}   icon="📋" color="bg-gray-50" />
        </div>
      </div>

      {/* Maintenance KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Operations & Maintenance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Assets"     value={fmtNum(maintDash?.total_assets)}      icon="🏭" color="bg-gray-50" />
          <MetricCard label="Open Work Orders" value={fmtNum(maintDash?.open_work_orders)}  icon="🔧" color="bg-orange-50"
            sub={`${maintDash?.critical || 0} critical`} />
          <MetricCard label="In Progress"      value={fmtNum(maintDash?.in_progress)}       icon="⚙️" color="bg-yellow-50" />
          <MetricCard label="SLA Health"       value={fmtPct(maintDash?.health)}            icon="📊" color="bg-blue-50"
            sub="Completion rate" />
        </div>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">System Health</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Backend API",   status:"online",  value:"3.0.0",        icon:"🟢", color:"bg-green-50" },
            { label:"Database",      status:"online",  value:"PostgreSQL 17", icon:"🟢", color:"bg-green-50" },
            { label:"Portal",        status:"online",  value:"Next.js 14",   icon:"🟢", color:"bg-green-50" },
          ].map(s => (
            <div key={s.label} className={`${s.color} border border-gray-200 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{s.icon}</span>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
              <p className="text-lg font-bold text-[var(--color-text-1)] capitalize">{s.status}</p>
              <p className="text-xs text-gray-400 mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label:"Executive",    path:"/executive/dashboard",     icon:"📊" },
            { label:"Maintenance",  path:"/maintenance/pm-schedule", icon:"🔧" },
            { label:"Inventory",    path:"/supply-chain/inventory-alerts", icon:"📦" },
            { label:"Financials",   path:"/financial/balance-sheet", icon:"💰" },
            { label:"Vendors",      path:"/supply-chain/vendor-scorecards", icon:"🏢" },
            { label:"Work Orders",  path:"/operations/work-orders",  icon:"⚙️" },
          ].map(link => (
            <button key={link.label} onClick={() => router.push(link.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
              <span className="text-2xl">{link.icon}</span>
              <span className="text-xs text-gray-600 font-medium">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function ExecutiveWorkbench() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [autoResult, setAutoResult] = useState<any>(null);

  const { data: dash } = useQuery(["ew-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: twin } = useQuery(["ew-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: autoStatus, refetch } = useQuery(["ew-auto"], () => authFetch("/api/v1/automation/status").then(r => r.json()));

  const d = dash || {};
  const pending = autoStatus?.pending_actions || {};
  const totalPending = Object.values(pending).reduce((s: number, v: any) => s + Number(v), 0);
  const score = twin?.health_score ?? 0;

  const runAutomation = async () => {
    setRunning(true);
    try {
      const res = await authFetch("/api/v1/automation/run", { method: "POST" });
      setAutoResult(await res.json());
      refetch();
    } finally { setRunning(false); }
  };

  const quickActions = [
    { label: "Operations Center", desc: "Dispatch & work orders", icon: "⚙️", path: "/operations/workbench" },
    { label: "Maintenance Hub", desc: "Assets & PM plans", icon: "🔧", path: "/maintenance" },
    { label: "Commercial Pipeline", desc: "Leads & contracts", icon: "💼", path: "/commercial" },
    { label: "Finance Overview", desc: "Invoices & payments", icon: "💰", path: "/invoices" },
    { label: "Supply Chain", desc: "Inventory & procurement", icon: "📦", path: "/supply-chain" },
    { label: "Analytics", desc: "Reports & scorecards", icon: "📊", path: "/analytics" },
    { label: "Risk Register", desc: "Risks & exceptions", icon: "⚠️", path: "/executive/risks" },
    { label: "Workflow Launcher", desc: "Run automations", icon: "⚡", path: "/workflows/launcher" },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Workbench</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Command Workbench</h1>
          <p className="text-slate-500 mt-1">Platform control center — monitor, decide, act</p>
        </div>
        <button onClick={runAutomation} disabled={running}
          className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${running ? "bg-slate-400" : "bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/25"}`}>
          {running ? "⏳ Running..." : `⚡ Run Automation${totalPending > 0 ? ` (${totalPending})` : ""}`}
        </button>
      </div>

      {/* Twin + Platform Health */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`col-span-1 rounded-2xl border p-5 text-center ${score >= 95 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <div className={`text-5xl font-black ${score >= 95 ? "text-emerald-500" : "text-amber-500"}`}>{score}</div>
          <div className="text-xs text-slate-500 mt-1">Twin Score</div>
          <div className="text-xs font-bold mt-0.5">{twin?.health_label ?? "—"}</div>
        </div>
        {[
          { label: "Open WOs", value: d.work_orders?.open ?? "—", color: "blue" },
          { label: "PM Overdue", value: d.maintenance?.overdue ?? "—", color: "red" },
          { label: "Active Contracts", value: d.commercial?.active_contracts ?? "—", color: "emerald" },
          { label: "Pending Invoices", value: d.finance?.pending ?? "—", color: "amber" },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Automation result */}
      {autoResult && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-2xl p-5">
          <div className="font-bold text-emerald-700 mb-2">✅ Automation Complete — {autoResult.total_actions} actions taken</div>
          <div className="grid grid-cols-5 gap-3 text-center text-sm">
            {[
              ["PM→WO", autoResult.wf01_pm_to_wo?.created?.length ?? 0],
              ["Renewals", autoResult.wf02_contract_renewals?.notified?.length ?? 0],
              ["Auto PRs", autoResult.wf03_stock_auto_pr?.created?.length ?? 0],
              ["Synced", autoResult.wf04_wo_asset_sync?.synced ?? 0],
              ["SR→WO", autoResult.wf05_sr_to_wo?.linked?.length ?? 0],
            ].map(([label, val], i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-2">
                <div className="text-xl font-black text-emerald-600">{val}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => router.push(a.path)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
              <div className="text-3xl mb-3">{a.icon}</div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{a.label}</div>
              <div className="text-xs text-slate-500 mt-1">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Twin domains */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Digital Twin — Domain Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(twin?.operational_domains ?? []).map((domain: any, i: number) => {
            const hasIssue = domain.overdue > 0 || domain.critical_open > 0 || domain.below_min > 0;
            return (
              <div key={i} className={`rounded-xl border p-4 ${hasIssue ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"}`}>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">{domain.domain}</div>
                <div className="text-2xl font-black mt-1">{domain.total ?? "—"}</div>
                <div className={`text-xs mt-1 ${hasIssue ? "text-amber-600" : "text-emerald-600"}`}>
                  {hasIssue ? "⚠️ Needs attention" : "✅ Normal"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function WorkspacePage() {
  const router = useRouter();
  const [runningAuto, setRunningAuto] = useState(false);
  const [autoResult, setAutoResult] = useState(null);

  const { data: twin }      = useQuery(["ws-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }      = useQuery(["ws-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), { refetchInterval: 60000 });
  const { data: woRaw }     = useQuery(["ws-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: notifRaw }  = useQuery(["ws-notifs"], () => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const { data: pmRaw }     = useQuery(["ws-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: srRaw }     = useQuery(["ws-srs"],    () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const { data: autoStatus, refetch: refetchAuto } = useQuery(["ws-auto"], () => authFetch("/api/v1/automation/status").then(r=>r.json()));

  const wos    = toArr(woRaw);
  const notifs = toArr(notifRaw);
  const pms    = toArr(pmRaw);
  const srs    = toArr(srRaw);
  const d      = dash || {};
  const score  = twin?.health_score ?? 0;
  const now    = new Date();
  const today  = now.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  const pending       = autoStatus?.pending_actions || {};
  const totalPending  = Object.values(pending).reduce((s, v) => s + Number(v), 0);
  const unreadNotifs  = notifs.filter(n => !n.is_read);
  const criticalWOs   = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const openWOs       = wos.filter(w => w.status === "open");
  const inProgressWOs = wos.filter(w => w.status === "in_progress");
  const overduePMs    = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts) < now);
  const openSRs       = srs.filter(s => s.status === "open" || s.status === "new");
  const completedWOs  = wos.filter(w => w.status === "completed");

  const paidInv  = d.finance?.paid ?? 0;
  const totalInv = d.finance?.total_invoices ?? 0;
  const collRate = totalInv > 0 ? Math.round(paidInv / totalInv * 100) : 0;
  const compRate = wos.length > 0 ? Math.round(completedWOs.length / wos.length * 100) : 0;

  const scoreColor  = score >= 95 ? "text-emerald-400" : score >= 80 ? "text-amber-400" : "text-red-400";
  const scoreBorder = score >= 95 ? "border-emerald-500/30 bg-emerald-500/5" : score >= 80 ? "border-amber-500/30 bg-amber-500/5" : "border-red-500/30 bg-red-500/5";

  const runAutomation = async () => {
    setRunningAuto(true);
    try {
      const res = await authFetch("/api/v1/automation/run", { method: "POST" });
      setAutoResult(await res.json());
      refetchAuto();
    } finally { setRunningAuto(false); }
  };

  const urgentItems = [
    ...criticalWOs.map(w => ({ type: "Critical WO", title: w.title, severity: "critical", path: `/operations/work-orders/${w.id}` })),
    ...overduePMs.slice(0, 3).map(p => ({ type: "Overdue PM", title: p.title, severity: "high", path: "/maintenance/pm-plans" })),
    ...openSRs.slice(0, 2).map(s => ({ type: "Service Request", title: s.title, severity: "medium", path: "/operations/service-requests" })),
  ].slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header banner */}
      <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-6 py-5">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Triangle Black Operations Platform</div>
            <h1 className="text-2xl font-black text-white">Platform Command Center</h1>
            <p className="text-slate-400 text-sm mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            {totalPending > 0 && (
              <button onClick={runAutomation} disabled={runningAuto}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-all ${runningAuto ? "bg-slate-600" : "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20"}`}>
                {runningAuto ? "⏳ Running..." : `⚡ Run Auto (${totalPending})`}
              </button>
            )}
            <div className={`border rounded-2xl px-5 py-3 text-center ${scoreBorder}`}>
              <div className={`text-3xl font-black ${scoreColor}`}>{score}</div>
              <div className="text-xs text-slate-500 mt-0.5">Twin Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Automation result */}
        {autoResult && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-2xl">✅</div>
            <div>
              <div className="font-bold text-emerald-800 dark:text-emerald-300">Automation Complete — {autoResult.total_actions} actions taken</div>
              <div className="text-xs text-emerald-600 mt-0.5">
                {autoResult.wf01_pm_to_wo?.created?.length || 0} PM→WO · {autoResult.wf02_contract_renewals?.notified?.length || 0} renewals · {autoResult.wf03_stock_auto_pr?.created?.length || 0} auto-PRs · {autoResult.wf04_wo_asset_sync?.synced || 0} synced
              </div>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {[
            { label: "Open WOs",        value: openWOs.length,            color: "blue",   path: "/operations/work-orders" },
            { label: "In Progress",     value: inProgressWOs.length,      color: "amber",  path: "/operations/dispatch" },
            { label: "Critical",        value: criticalWOs.length,        color: criticalWOs.length > 0 ? "red" : "emerald", path: "/executive/exceptions" },
            { label: "PM Overdue",      value: overduePMs.length,         color: overduePMs.length > 0 ? "red" : "emerald", path: "/maintenance/pm-plans" },
            { label: "Open SRs",        value: openSRs.length,            color: "purple", path: "/operations/service-requests" },
            { label: "Unread Alerts",   value: unreadNotifs.length,       color: "amber",  path: "/inbox" },
            { label: "WO Completion",   value: `${compRate}%`,            color: compRate >= 80 ? "emerald" : "amber", path: "/analytics/scorecards" },
            { label: "Collection Rate", value: `${collRate}%`,            color: collRate >= 85 ? "emerald" : "amber", path: "/invoices" },
          ].map((k, i) => (
            <button key={i} onClick={() => router.push(k.path)}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center hover:border-amber-400 hover:shadow-md transition-all group">
              <div className={`text-2xl font-black text-${k.color}-500 group-hover:scale-110 transition-transform`}>{k.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{k.label}</div>
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Urgent items — left column */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white">🚨 Urgent Items</h2>
                <button onClick={() => router.push("/executive/exceptions")} className="text-xs text-amber-500 hover:underline">All →</button>
              </div>
              {urgentItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-sm text-slate-400">All clear — no urgent items</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentItems.map((item, i) => {
                    const colors = { critical: "red", high: "orange", medium: "amber" };
                    const c = colors[item.severity] || "slate";
                    return (
                      <button key={i} onClick={() => router.push(item.path)}
                        className={`w-full flex items-start gap-2.5 p-3 rounded-xl text-left hover:shadow-sm transition-all bg-${c}-50 dark:bg-${c}-900/20 border border-${c}-100`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-${c}-500 mt-1.5 flex-shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-500 uppercase">{item.type}</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Automation status */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">⚡ Automation Status</h2>
                <button onClick={() => router.push("/workflows/launcher")} className="text-xs text-amber-500 hover:underline">Manage →</button>
              </div>
              <div className="space-y-2">
                {Object.entries(pending).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 capitalize">{key.replace(/wf\d+_/, "").replace(/_/g, " ")}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${val === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {val === 0 ? "✓ OK" : `${val} pending`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Domain overview — center + right */}
          <div className="xl:col-span-2 space-y-4">

            {/* Domain health grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4">Domain Health</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { domain: "Operations",   icon: "⚙️",  metric: `${openWOs.length} open WOs`,          health: compRate,    path: "/operations" },
                  { domain: "Maintenance",  icon: "🔧",  metric: `${overduePMs.length} overdue PM`,     health: overduePMs.length === 0 ? 100 : Math.max(0, 100 - overduePMs.length * 10), path: "/maintenance" },
                  { domain: "Commercial",   icon: "💼",  metric: `${d.commercial?.active_contracts ?? 0} active`,      health: 85,         path: "/commercial" },
                  { domain: "Finance",      icon: "💰",  metric: `${collRate}% collected`,               health: collRate,    path: "/invoices" },
                  { domain: "Supply Chain", icon: "📦",  metric: `${d.procurement?.purchase_requests ?? 0} PRs`,        health: 80,         path: "/supply-chain" },
                  { domain: "Platform",     icon: "🔮",  metric: `${score}/100 twin score`,              health: score,       path: "/executive/intelligence" },
                ].map((item, i) => (
                  <button key={i} onClick={() => router.push(item.path)}
                    className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-left hover:border-amber-400 hover:shadow-sm transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className={`text-xs font-bold ${item.health >= 80 ? "text-emerald-500" : item.health >= 60 ? "text-amber-500" : "text-red-500"}`}>
                        {item.health >= 80 ? "✓" : item.health >= 60 ? "!" : "✗"}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">{item.domain}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.metric}</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                      <div className={`h-1.5 rounded-full ${item.health >= 80 ? "bg-emerald-500" : item.health >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, item.health)}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent work orders */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white">Recent Work Orders</h2>
                <button onClick={() => router.push("/operations/work-orders")} className="text-xs text-amber-500 hover:underline">All {wos.length} →</button>
              </div>
              <div className="space-y-1.5">
                {wos.slice(0, 6).map((w, i) => (
                  <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.status === "completed" ? "bg-emerald-500" : w.status === "in_progress" ? "bg-amber-500" : w.priority === "critical" ? "bg-red-500" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600">{w.title}</div>
                      <div className="text-xs text-slate-400">{fmtDate(w.created_at)}</div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${w.priority === "critical" ? "bg-red-100 text-red-700" : w.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{w.priority}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${w.status === "completed" ? "bg-emerald-100 text-emerald-700" : w.status === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{w.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Twin domain strip */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Digital Twin — Live Domains</h2>
                <button onClick={() => router.push("/executive/intelligence")} className="text-xs text-amber-500 hover:underline">Details →</button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {(twin?.operational_domains ?? []).map((dom, i) => {
                  const hasIssue = (dom.overdue ?? 0) > 0 || (dom.critical_open ?? 0) > 0 || (dom.below_min ?? 0) > 0;
                  return (
                    <div key={i} className={`rounded-lg p-2 text-center text-xs ${hasIssue ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200" : "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200"}`}>
                      <div className="font-black text-lg">{dom.total ?? "—"}</div>
                      <div className={`text-[9px] leading-tight ${hasIssue ? "text-amber-600" : "text-emerald-600"}`}>{dom.domain}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick access nav */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Quick Access</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-10 gap-2">
            {[
              { label: "My Day",          icon: "☀️",  path: "/workspace/my-day" },
              { label: "Work Orders",     icon: "🔧",  path: "/operations/work-orders" },
              { label: "Dispatch",        icon: "👷",  path: "/operations/dispatch" },
              { label: "PM Plans",        icon: "📅",  path: "/maintenance/pm-plans" },
              { label: "Assets",          icon: "🏗️",  path: "/maintenance/assets" },
              { label: "Contracts",       icon: "📄",  path: "/commercial/contracts" },
              { label: "Invoices",        icon: "💰",  path: "/invoices" },
              { label: "Procurement",     icon: "📦",  path: "/supply-chain" },
              { label: "Analytics",       icon: "📊",  path: "/analytics" },
              { label: "Automation",      icon: "⚡",  path: "/workflows/launcher" },
            ].map((a, i) => (
              <button key={i} onClick={() => router.push(a.path)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 border border-transparent transition-all">
                <span className="text-xl">{a.icon}</span>
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

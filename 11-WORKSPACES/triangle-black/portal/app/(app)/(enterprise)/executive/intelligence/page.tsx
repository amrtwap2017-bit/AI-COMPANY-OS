"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmt = (n: any) => Number(n || 0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutiveIntelligence() {
  const router = useRouter();
  const { data: dash } = useQuery(["ei-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: twin } = useQuery(["ei-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: woRaw } = useQuery(["ei-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: notifRaw } = useQuery(["ei-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));

  const wos = toArr(woRaw);
  const notifs = toArr(notifRaw);
  const d = dash || {};
  const score = twin?.health_score ?? 0;

  const critical = wos.filter((w: any) => w.priority === "critical" && w.status !== "completed");
  const overdue = wos.filter((w: any) => w.due_date && new Date(w.due_date) < new Date() && w.status !== "completed");
  const recentNotifs = notifs.filter((n: any) => !n.is_read).slice(0, 8);

  const scoreColor = score >= 95 ? "text-emerald-400" : score >= 80 ? "text-amber-400" : "text-red-400";
  const scoreBg = score >= 95 ? "bg-emerald-500/10 border-emerald-500/20" : score >= 80 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="tb-page">
      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Intelligence</div>
          <h1 className="text-3xl font-black text-primary">Platform Command Center</h1>
          <p className="text-secondary mt-1">Real-time operational intelligence across all domains</p>
        </div>
        <div className={`border rounded-2xl px-6 py-4 text-center ${scoreBg}`}>
          <div className={`text-5xl font-black ${scoreColor}`}>{score}</div>
          <div className="text-xs text-secondary mt-1">Digital Twin Score</div>
          <div className={`text-xs font-bold mt-1 ${scoreColor}`}>{twin?.health_label || "—"}</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Work Orders", value: d.work_orders?.open ?? "—", sub: `${d.work_orders?.in_progress ?? 0} in progress`, color: "blue", path: "/operations/work-orders" },
          { label: "Critical Alerts", value: critical.length, sub: `${overdue.length} overdue`, color: "red", path: "/executive/exceptions" },
          { label: "Active Contracts", value: d.commercial?.active_contracts ?? "—", sub: `${d.commercial?.expiring_30d ?? 0} expiring soon`, color: "amber", path: "/commercial/contracts" },
          { label: "Revenue Collected", value: `${fmt(d.finance?.paid ?? 0)}`, sub: `${d.finance?.pending ?? 0} pending`, color: "emerald", path: "/invoices" },
        ].map((k, i) => (
          <button key={i} onClick={() => router.push(k.path)}
            className={`bg-surface border border-border rounded-2xl p-5 text-left hover:border-${k.color}-400 hover:shadow-lg transition-all group`}>
            <div className="text-xs text-secondary mb-2 font-medium">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500 group-hover:scale-105 transition-transform`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>

      {/* Domain Health */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold text-primary mb-4">Domain Health Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { domain: "Operations", value: `${d.work_orders?.completed ?? 0}/${d.work_orders?.total ?? 0}`, label: "WOs completed", health: (d.work_orders?.completed ?? 0) / Math.max(d.work_orders?.total ?? 1, 1) * 100 },
            { domain: "Maintenance", value: `${d.maintenance?.pm_plans ?? 0} plans`, label: `${d.maintenance?.overdue ?? 0} overdue`, health: 100 - (d.maintenance?.overdue ?? 0) * 10 },
            { domain: "Finance", value: `${d.finance?.paid ?? 0}/${d.finance?.total_invoices ?? 0}`, label: "invoices paid", health: (d.finance?.paid ?? 0) / Math.max(d.finance?.total_invoices ?? 1, 1) * 100 },
            { domain: "Procurement", value: `${d.procurement?.purchase_requests ?? 0} PRs`, label: `${d.procurement?.pending_pos ?? 0} pending POs`, health: 80 },
          ].map((item, i) => (
            <div key={i} className="bg-base-alt dark:bg-surface-alt rounded-xl p-4">
              <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{item.domain}</div>
              <div className="text-xl font-black text-primary">{item.value}</div>
              <div className="text-xs text-secondary mb-3">{item.label}</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${item.health >= 80 ? "bg-emerald-500" : item.health >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.health))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Issues + Recent Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Critical Work Orders</h2>
            <button onClick={() => router.push("/operations/work-orders")} className="text-xs text-amber-500 hover:underline">View all →</button>
          </div>
          {critical.length === 0 ? (
            <div className="text-center py-8 text-tertiary">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm">No critical issues</div>
            </div>
          ) : (
            <div className="space-y-2">
              {critical.slice(0, 6).map((w: any, i: number) => (
                <button key={w.id || i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                  className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors text-left">
                  <div>
                    <div className="text-sm font-semibold text-red-900 dark:text-red-300 truncate">{w.title}</div>
                    <div className="text-xs text-red-500 mt-0.5">{w.status} · {fmtDate(w.due_date)}</div>
                  </div>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-bold">CRITICAL</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Unread Alerts</h2>
            <button onClick={() => router.push("/inbox")} className="text-xs text-amber-500 hover:underline">View all →</button>
          </div>
          {recentNotifs.length === 0 ? (
            <div className="text-center py-8 text-tertiary">
              <div className="text-3xl mb-2">🔔</div>
              <div className="text-sm">All caught up</div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotifs.map((n: any, i: number) => (
                <div key={n.id || i} className="flex items-start gap-3 p-3 bg-base-alt dark:bg-surface-alt rounded-xl">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-primary truncate">{n.title}</div>
                    <div className="text-xs text-secondary truncate">{n.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

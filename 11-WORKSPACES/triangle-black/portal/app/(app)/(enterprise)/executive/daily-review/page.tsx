"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutiveDailyReview() {
  const router = useRouter();
  const { data: dash } = useQuery(["dr-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: woRaw } = useQuery(["dr-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: pmRaw } = useQuery(["dr-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: notifRaw } = useQuery(["dr-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));
  const { data: twin } = useQuery(["dr-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));

  const wos = toArr(woRaw);
  const pms = toArr(pmRaw);
  const notifs = toArr(notifRaw);
  const d = dash || {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const completedToday = wos.filter((w: any) => w.completed_at && new Date(w.completed_at) >= today);
  const openCritical = wos.filter((w: any) => w.priority === "critical" && w.status !== "completed");
  const dueSoon = pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in7);
  const unreadNotifs = notifs.filter((n: any) => !n.is_read).slice(0, 6);

  const today_str = now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Daily Executive Review</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Good Morning</h1>
        <p className="text-slate-500 mt-1">{today_str}</p>
      </div>

      {/* Today's Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Completed Today", value: completedToday.length, sub: "work orders closed", color: "emerald", icon: "✅" },
          { label: "Still Open", value: d.work_orders?.open ?? "—", sub: "need attention", color: "blue", icon: "📋" },
          { label: "Critical Open", value: openCritical.length, sub: "urgent response needed", color: "red", icon: "🚨" },
          { label: "Twin Score", value: `${twin?.health_score ?? "—"}/100`, sub: twin?.health_label ?? "—", color: "amber", icon: "🔮" },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-xs text-slate-500 mb-1">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical items */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">🚨 Needs Action Today</h2>
          {openCritical.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">Nothing critical today ✅</div>
          ) : openCritical.slice(0, 5).map((w: any, i: number) => (
            <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
              className="w-full text-left p-3 mb-2 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors">
              <div className="text-sm font-semibold text-red-800 dark:text-red-300 truncate">{w.title}</div>
              <div className="text-xs text-red-500 mt-0.5">Due {fmtDate(w.due_date)}</div>
            </button>
          ))}
        </div>

        {/* PM due this week */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">📅 PM Due This Week</h2>
          {dueSoon.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">No PM plans due this week ✅</div>
          ) : dueSoon.slice(0, 5).map((p: any, i: number) => (
            <div key={i} className="p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300 truncate">{p.title}</div>
              <div className="text-xs text-amber-500 mt-0.5">Due {fmtDate(p.next_due_ts)}</div>
            </div>
          ))}
        </div>

        {/* Recent notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">🔔 Unread Alerts</h2>
          {unreadNotifs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">All caught up ✅</div>
          ) : unreadNotifs.map((n: any, i: number) => (
            <div key={i} className="p-3 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</div>
              <div className="text-xs text-slate-500 truncate">{n.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Platform at a Glance</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          {[
            { label: "Work Orders", value: d.work_orders?.total ?? "—", path: "/operations/work-orders" },
            { label: "Technicians", value: d.platform?.technicians ?? "—", path: "/operations/technicians" },
            { label: "PM Plans", value: d.maintenance?.pm_plans ?? "—", path: "/maintenance/pm-plans" },
            { label: "Active Contracts", value: d.commercial?.active_contracts ?? "—", path: "/commercial/contracts" },
            { label: "Invoices", value: d.finance?.total_invoices ?? "—", path: "/invoices" },
            { label: "Projects", value: d.platform?.projects ?? "—", path: "/projects-center" },
          ].map((item, i) => (
            <button key={i} onClick={() => router.push(item.path)}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</div>
              <div className="text-xs text-slate-500 mt-1">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function OperationsHub() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["ops-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: techRaw } = useQuery(["ops-techs"], () => authFetch("/api/v1/technicians/").then(r => r.json()));
  const { data: srRaw } = useQuery(["ops-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: dash } = useQuery(["ops-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));

  const wos = toArr(woRaw);
  const techs = toArr(techRaw);
  const srs = toArr(srRaw);
  const d = dash || {};

  const now = new Date();
  const openWOs = wos.filter((w: any) => w.status === "open");
  const inProgressWOs = wos.filter((w: any) => w.status === "in_progress");
  const criticalWOs = wos.filter((w: any) => w.priority === "critical" && w.status !== "completed");
  const completedWOs = wos.filter((w: any) => w.status === "completed");
  const overdueWOs = wos.filter((w: any) => w.due_date && new Date(w.due_date) < now && w.status !== "completed");
  const activeTechs = techs.filter((t: any) => t.is_active);
  const busyTechs = techs.filter((t: any) => (t.current_work_orders ?? 0) > 0);
  const openSRs = srs.filter((s: any) => s.status === "open" || s.status === "new");

  const completionRate = wos.length > 0 ? Math.round(completedWOs.length / wos.length * 100) : 0;

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Operations Center</div>
        <h1 className="text-3xl font-black text-primary">Operations Dashboard</h1>
        <p className="text-secondary mt-1">Work orders, technicians, and service delivery</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open WOs", value: openWOs.length, sub: `${inProgressWOs.length} in progress`, color: "blue", path: "/operations/work-orders" },
          { label: "Critical Alerts", value: criticalWOs.length, sub: `${overdueWOs.length} overdue`, color: criticalWOs.length > 0 ? "red" : "emerald", path: "/executive/exceptions" },
          { label: "Active Technicians", value: activeTechs.length, sub: `${busyTechs.length} on duty`, color: "amber", path: "/operations/technicians" },
          { label: "Completion Rate", value: `${completionRate}%`, sub: `${completedWOs.length} of ${wos.length} done`, color: completionRate >= 80 ? "emerald" : "amber", path: "/analytics/scorecards" },
        ].map((k, i) => (
          <button key={i} onClick={() => router.push(k.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Work Orders by Priority</h2>
            <button onClick={() => router.push("/operations/work-orders")} className="text-xs text-amber-500 hover:underline">All WOs →</button>
          </div>
          <div className="space-y-3">
            {[
              { label: "Critical", count: wos.filter((w: any) => w.priority === "critical").length, open: wos.filter((w: any) => w.priority === "critical" && w.status !== "completed").length, color: "red" },
              { label: "High", count: wos.filter((w: any) => w.priority === "high").length, open: wos.filter((w: any) => w.priority === "high" && w.status !== "completed").length, color: "orange" },
              { label: "Medium", count: wos.filter((w: any) => w.priority === "medium").length, open: wos.filter((w: any) => w.priority === "medium" && w.status !== "completed").length, color: "amber" },
              { label: "Low", count: wos.filter((w: any) => w.priority === "low").length, open: wos.filter((w: any) => w.priority === "low" && w.status !== "completed").length, color: "slate" },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">{p.label}</span>
                  <span className="font-bold"><span className={`text-${p.color}-500`}>{p.open} open</span> / {p.count} total</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full bg-${p.color}-500`} style={{ width: `${(p.count / Math.max(wos.length, 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technician utilization */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Technician Status</h2>
            <button onClick={() => router.push("/operations/dispatch")} className="text-xs text-amber-500 hover:underline">Dispatch →</button>
          </div>
          <div className="space-y-2">
            {techs.slice(0, 8).map((t: any, i: number) => {
              const load = Math.min((t.current_work_orders ?? 0) / Math.max(t.max_work_orders ?? 5, 1) * 100, 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-black">{(t.name || "?")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-slate-700 dark:text-tertiary truncate">{t.name}</span>
                      <span className="text-tertiary ml-2 flex-shrink-0">{t.current_work_orders ?? 0}/{t.max_work_orders ?? 5}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${load >= 90 ? "bg-red-500" : load >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${load}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {techs.length > 8 && <div className="text-xs text-tertiary text-center pt-1">+{techs.length - 8} more technicians</div>}
          </div>
        </div>
      </div>

      {/* Open SRs */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Open Service Requests</h2>
          <button onClick={() => router.push("/operations/service-requests")} className="text-xs text-amber-500 hover:underline">All SRs →</button>
        </div>
        {openSRs.length === 0 ? (
          <div className="text-center py-8 text-tertiary text-sm">✅ No open service requests</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {openSRs.slice(0, 6).map((sr: any, i: number) => (
              <button key={i} onClick={() => router.push(`/operations/service-requests/${sr.id}`)}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left">
                <div className="text-sm font-semibold text-primary truncate">{sr.title}</div>
                <div className="text-xs text-secondary mt-1">{sr.status} · {sr.urgency || "normal"}</div>
                <div className="text-xs text-tertiary mt-1">{fmtDate(sr.created_at)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Work Orders", icon: "🔧", path: "/operations/work-orders" },
          { label: "Dispatch", icon: "👷", path: "/operations/dispatch" },
          { label: "Schedule", icon: "📅", path: "/operations/schedule" },
          { label: "SLA Review", icon: "⏱️", path: "/analytics/sla" },
        ].map((a, i) => (
          <button key={i} onClick={() => router.push(a.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-center hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-primary">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

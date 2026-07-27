"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function AnalyticsSLA() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["sla-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srRaw } = useQuery(["sla-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: techRaw } = useQuery(["sla-techs"], () => authFetch("/api/v1/technicians/").then(r => r.json()));

  const wos = toArr(woRaw);
  const srs = toArr(srRaw);
  const techs = toArr(techRaw);
  const now = new Date();

  // SLA computation from real data
  const slaTargets: any = { critical: 4, high: 8, medium: 24, low: 72 };

  const slaData = (["critical", "high", "medium", "low"] as const).map(priority => {
    const group = wos.filter((w: any) => w.priority === priority);
    const completed = group.filter((w: any) => w.status === "completed");
    const breached = group.filter((w: any) => {
      if (w.status === "completed" || !w.due_date) return false;
      return new Date(w.due_date) < now;
    });
    const withinSla = completed.filter((w: any) => {
      if (!w.created_at || !w.completed_at) return true;
      const hrs = (new Date(w.completed_at).getTime() - new Date(w.created_at).getTime()) / 3600000;
      return hrs <= slaTargets[priority];
    });
    const compliance = completed.length > 0 ? Math.round(withinSla.length / completed.length * 100) : 100;
    return { priority, total: group.length, completed: completed.length, breached: breached.length, compliance, target: slaTargets[priority] };
  });

  const overallCompliance = Math.round(slaData.reduce((s, r) => s + r.compliance, 0) / slaData.length);

  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Analytics</div>
          <h1 className="text-page-title text-primary">SLA Performance</h1>
          <p className="text-secondary mt-1">Service level agreement compliance by priority</p>
        </div>
        <div className={`rounded-2xl border px-8 py-4 text-center ${overallCompliance >= 90 ? "bg-emerald-50 border-emerald-200" : overallCompliance >= 75 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
          <div className={`text-5xl font-black ${overallCompliance >= 90 ? "text-emerald-500" : overallCompliance >= 75 ? "text-amber-500" : "text-red-500"}`}>{overallCompliance}%</div>
          <div className="text-xs text-secondary mt-1">Overall SLA Compliance</div>
        </div>
      </div>

      {/* SLA by priority */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slaData.map((row, i) => {
          const c = row.compliance >= 90 ? "emerald" : row.compliance >= 75 ? "amber" : "red";
          return (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${row.priority === "critical" ? "bg-red-100 text-red-700" : row.priority === "high" ? "bg-orange-100 text-orange-700" : row.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-secondary"}`}>
                  {row.priority}
                </span>
                <span className="text-xs text-tertiary">Target: {row.target}h</span>
              </div>
              <div className={`text-4xl font-black text-${c}-500`}>{row.compliance}%</div>
              <div className="text-xs text-secondary mt-1">SLA compliance</div>
              <div className="w-full bg-base-alt rounded-full h-2 mt-3">
                <div className={`h-2 rounded-full bg-${c}-500`} style={{ width: `${row.compliance}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-1 mt-3 text-center text-xs">
                <div><div className="font-bold text-slate-700 dark:text-tertiary">{row.total}</div><div className="text-tertiary">Total</div></div>
                <div><div className="font-bold text-emerald-600">{row.completed}</div><div className="text-tertiary">Done</div></div>
                <div><div className="font-bold text-red-500">{row.breached}</div><div className="text-tertiary">Breached</div></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Breached WOs */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">SLA Breached Work Orders</h2>
          <button onClick={() => router.push("/operations/work-orders")} className="text-xs text-amber-500 hover:underline">View all →</button>
        </div>
        {(() => {
          const breached = wos.filter((w: any) => w.due_date && new Date(w.due_date) < now && w.status !== "completed");
          if (breached.length === 0) return <div className="text-center py-8 text-tertiary text-sm">✅ No SLA breaches</div>;
          return (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-divider">
                <th className="text-left pb-2 text-secondary font-medium">Work Order</th>
                <th className="text-left pb-2 text-secondary font-medium">Priority</th>
                <th className="text-left pb-2 text-secondary font-medium">Status</th>
                <th className="text-left pb-2 text-secondary font-medium">Due Date</th>
                <th className="text-left pb-2 text-secondary font-medium">Overdue By</th>
              </tr></thead>
              <tbody className="divide-y divide-y-border">
                {breached.slice(0, 10).map((w: any, i: number) => {
                  const daysOver = Math.floor((now.getTime() - new Date(w.due_date).getTime()) / 86400000);
                  return (
                    <tr key={i} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                      <td className="py-3 font-medium text-primary truncate max-w-[200px]">{w.title}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${w.priority === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{w.priority}</span></td>
                      <td className="py-3 text-secondary">{w.status}</td>
                      <td className="py-3 text-red-500">{w.due_date?.slice(0, 10) || "—"}</td>
                      <td className="py-3 font-bold text-red-600">{daysOver}d</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );
}

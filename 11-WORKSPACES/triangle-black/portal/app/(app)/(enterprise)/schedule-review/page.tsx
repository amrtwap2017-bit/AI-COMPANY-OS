"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0, 10); }
};

export default function ScheduleReview() {
  const { data: woData, isLoading: l1 } = useQuery(["sched-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: pmData, isLoading: l2 } = useQuery(["sched-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));

  const wos = toArr(woData);
  const pms = toArr(pmData);

  const openWOs = wos.filter((w: any) => w.status === "open" || w.status === "in_progress");
  const overdueP = pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < new Date());
  const upcoming = pms.filter((p: any) => {
    if (!p.next_due_ts) return false;
    const d = new Date(p.next_due_ts);
    const now = new Date();
    return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
  });

  if (l1 || l2) return <div className="p-6 text-gray-400">Loading schedule...</div>;

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Schedule Review</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Open WOs</div>
          <div className="text-3xl font-bold">{openWOs.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-red-200">
          <div className="text-sm text-red-500">Overdue PM</div>
          <div className="text-3xl font-bold text-red-600">{overdueP.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-amber-200">
          <div className="text-sm text-amber-500">Due This Week</div>
          <div className="text-3xl font-bold text-amber-600">{upcoming.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">{wos.filter((w: any) => w.status === "in_progress").length}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <h2 className="font-semibold mb-3">Open Work Orders</h2>
          {openWOs.slice(0, 15).map((w: any, i: number) => (
            <div key={w.id || i} className="flex justify-between py-1.5 border-b text-sm">
              <span>{w.title || w.description || w.id}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${w.priority === "critical" ? "bg-red-100 text-red-700" : w.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-gray-100"}`}>{w.priority || "medium"}</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <h2 className="font-semibold mb-3">Upcoming PM Plans</h2>
          {[...overdueP, ...upcoming].slice(0, 15).map((p: any, i: number) => {
            const isOverdue = p.next_due_ts && new Date(p.next_due_ts) < new Date();
            return (
              <div key={p.id || i} className="flex justify-between py-1.5 border-b text-sm">
                <span>{p.title}</span>
                <span className={`text-xs ${isOverdue ? "text-red-600" : "text-amber-600"}`}>{fmtDate(p.next_due_ts)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

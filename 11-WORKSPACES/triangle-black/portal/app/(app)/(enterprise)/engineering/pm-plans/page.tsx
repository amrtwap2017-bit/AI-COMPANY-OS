"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0, 10); }
};

export default function EngineeringPMPlans() {
  const { data, isLoading } = useQuery(
    ["eng-pm-plans"],
    () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json())
  );
  const plans = toArr(data);
  const overdue = plans.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < new Date());
  const dueSoon = plans.filter((p: any) => {
    if (!p.next_due_ts) return false;
    const d = new Date(p.next_due_ts);
    const now = new Date();
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
  });

  if (isLoading) return <div className="p-6 text-gray-400">Loading PM Plans...</div>;

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Preventive Maintenance Plans</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Plans</div>
          <div className="text-3xl font-bold">{plans.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-red-200">
          <div className="text-sm text-red-500">Overdue</div>
          <div className="text-3xl font-bold text-red-600">{overdue.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-amber-200">
          <div className="text-sm text-amber-500">Due Within 30 Days</div>
          <div className="text-3xl font-bold text-amber-600">{dueSoon.length}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Frequency</th>
              <th className="text-left p-3">Next Due</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p: any, i: number) => {
              const isOverdue = p.next_due_ts && new Date(p.next_due_ts) < new Date();
              return (
                <tr key={p.id || i} className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="p-3 font-medium">{p.title || "—"}</td>
                  <td className="p-3">{p.plan_type || "—"}</td>
                  <td className="p-3">{p.frequency || "—"}</td>
                  <td className={`p-3 ${isOverdue ? "text-red-600 font-semibold" : ""}`}>
                    {fmtDate(p.next_due_ts || p.next_due_date)}
                    {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">OVERDUE</span>}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">{p.status || "—"}</span>
                  </td>
                  <td className="p-3 text-gray-500">{p.owner || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

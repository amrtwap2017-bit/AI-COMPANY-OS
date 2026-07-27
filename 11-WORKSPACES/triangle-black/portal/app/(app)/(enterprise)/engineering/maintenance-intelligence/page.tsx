"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function MaintenanceIntelligence() {
  const { data: planData, isLoading: l1 } = useQuery(["mi-plans"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: assetData, isLoading: l2 } = useQuery(["mi-assets"], () => authFetch("/api/v1/assets/").then(r => r.json()));
  const { data: woData, isLoading: l3 } = useQuery(["mi-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));

  const plans = toArr(planData);
  const assets = toArr(assetData);
  const wos = toArr(woData);

  const overdue = plans.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < new Date());
  const openWOs = wos.filter((w: any) => w.status === "open" || w.status === "in_progress");
  const criticalWOs = wos.filter((w: any) => w.priority === "critical" && w.status !== "completed");
  const completedThisMonth = wos.filter((w: any) => {
    if (w.status !== "completed" || !w.completed_at) return false;
    const d = new Date(w.completed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (l1 || l2 || l3) return <div className="p-6 text-gray-400">Loading intelligence...</div>;

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Maintenance Intelligence</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Assets</div>
          <div className="text-3xl font-bold">{assets.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-red-200">
          <div className="text-sm text-red-500">Overdue PM Plans</div>
          <div className="text-3xl font-bold text-red-600">{overdue.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-amber-200">
          <div className="text-sm text-amber-500">Open Work Orders</div>
          <div className="text-3xl font-bold text-amber-600">{openWOs.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-green-200">
          <div className="text-sm text-green-500">Completed This Month</div>
          <div className="text-3xl font-bold text-green-600">{completedThisMonth.length}</div>
        </div>
      </div>
      {criticalWOs.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4">
          <h2 className="font-semibold text-red-700 mb-2">⚠️ Critical Work Orders Requiring Attention</h2>
          {criticalWOs.map((w: any, i: number) => (
            <div key={w.id || i} className="flex justify-between py-1 text-sm">
              <span>{w.title || w.description || w.id}</span>
              <span className="text-red-600">{w.status}</span>
            </div>
          ))}
        </div>
      )}
      {overdue.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg p-4">
          <h2 className="font-semibold text-amber-700 mb-2">🔧 Overdue Maintenance Plans</h2>
          {overdue.map((p: any, i: number) => (
            <div key={p.id || i} className="flex justify-between py-1 text-sm">
              <span>{p.title}</span>
              <span className="text-amber-600">{p.frequency} — was due {new Date(p.next_due_ts).toLocaleDateString("en-GB")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

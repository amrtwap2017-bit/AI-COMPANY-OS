"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0, 10); }
};

export default function TasksPage() {
  const { data: woData, isLoading: l1 } = useQuery(["tasks-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srData, isLoading: l2 } = useQuery(["tasks-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));

  const wos = toArr(woData).filter((w: any) => w.status === "open" || w.status === "in_progress");
  const srs = toArr(srData).filter((s: any) => s.status === "open" || s.status === "new");

  const allTasks = [
    ...wos.map((w: any) => ({ ...w, _type: "Work Order" })),
    ...srs.map((s: any) => ({ ...s, _type: "Service Request" })),
  ].sort((a: any, b: any) => {
    const prio: any = { critical: 0, high: 1, medium: 2, low: 3 };
    return (prio[a.priority] ?? 2) - (prio[b.priority] ?? 2);
  });

  if (l1 || l2) return <div className="p-6 text-gray-400">Loading tasks...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Active Tasks</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Active</div>
          <div className="text-3xl font-bold">{allTasks.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-blue-500">Open Work Orders</div>
          <div className="text-3xl font-bold text-blue-600">{wos.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-purple-500">Open Service Requests</div>
          <div className="text-3xl font-bold text-purple-600">{srs.length}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Priority</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {allTasks.map((t: any, i: number) => (
              <tr key={t.id || i} className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800">
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${t._type === "Work Order" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{t._type}</span></td>
                <td className="p-3 font-medium">{t.title || t.description || t.subject || t.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${t.priority === "critical" ? "bg-red-100 text-red-700" : t.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    {t.priority || "medium"}
                  </span>
                </td>
                <td className="p-3">{t.status}</td>
                <td className="p-3 text-gray-400">{fmtDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function NotificationRules() {
  const { data, isLoading } = useQuery(["notif-rules"], () => authFetch("/api/v1/notifications/").then(r => r.json()));
  const notifications = toArr(data);

  const types = notifications.reduce((acc: any, n: any) => {
    const t = n.type || n.category || "general";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) return <div className="p-6 text-gray-400">Loading notification rules...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notification Rules</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Notifications</div>
          <div className="text-3xl font-bold">{notifications.length}</div>
        </div>
        {Object.entries(types).slice(0, 3).map(([type, count]: [string, any]) => (
          <div key={type} className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
            <div className="text-sm text-gray-500 capitalize">{type}</div>
            <div className="text-3xl font-bold">{count}</div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Active Rules by Type</h2>
        {Object.entries(types).map(([type, count]: [string, any]) => (
          <div key={type} className="flex justify-between py-2 border-b text-sm">
            <span className="capitalize">{type.replace(/_/g, " ")}</span>
            <span className="font-mono">{count} notifications</span>
          </div>
        ))}
      </div>
    </div>
  );
}

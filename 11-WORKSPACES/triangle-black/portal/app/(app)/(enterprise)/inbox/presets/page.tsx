"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function InboxPresets() {
  const { data, isLoading } = useQuery(["inbox-presets"], () => authFetch("/api/v1/notifications/").then(r => r.json()));
  const notifications = toArr(data);
  const unread = notifications.filter((n: any) => !n.read && !n.is_read);
  const critical = notifications.filter((n: any) => n.priority === "critical" || n.severity === "critical");

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;

  const presets = [
    { name: "All Notifications", count: notifications.length, filter: "all" },
    { name: "Unread", count: unread.length, filter: "unread" },
    { name: "Critical Alerts", count: critical.length, filter: "critical" },
    { name: "Maintenance", count: notifications.filter((n: any) => (n.type || n.category || "").includes("maintenance")).length, filter: "maintenance" },
    { name: "Operations", count: notifications.filter((n: any) => (n.type || n.category || "").includes("work_order") || (n.type || n.category || "").includes("operations")).length, filter: "operations" },
    { name: "Commercial", count: notifications.filter((n: any) => (n.type || n.category || "").includes("contract") || (n.type || n.category || "").includes("lead")).length, filter: "commercial" },
  ];

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Inbox Presets</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {presets.map((p) => (
          <div key={p.filter} className="bg-white dark:bg-zinc-900 rounded-lg border p-4 hover:border-blue-400 cursor-pointer transition-colors">
            <div className="text-sm text-gray-500">{p.name}</div>
            <div className="text-3xl font-bold">{p.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

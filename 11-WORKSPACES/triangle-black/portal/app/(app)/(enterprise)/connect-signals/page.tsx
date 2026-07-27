"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || d?.signals || [];

export default function ConnectSignals() {
  const { data, isLoading } = useQuery(
    ["connect-signals"],
    () => authFetch("/api/v1/ai/signals").then(r => r.json())
  );
  const signals = toArr(data);

  if (isLoading) return <div className="p-6 text-gray-400">Loading signals...</div>;

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Connected Signals</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Signals</div>
          <div className="text-3xl font-bold">{signals.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-red-200">
          <div className="text-sm text-red-500">Critical</div>
          <div className="text-3xl font-bold text-red-600">{signals.filter((s: any) => s.severity === "critical" || s.priority === "critical").length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 border-amber-200">
          <div className="text-sm text-amber-500">Warnings</div>
          <div className="text-3xl font-bold text-amber-600">{signals.filter((s: any) => s.severity === "warning" || s.priority === "high").length}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="text-left p-3">Signal</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Severity</th>
              <th className="text-left p-3">Domain</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s: any, i: number) => (
              <tr key={s.id || i} className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800">
                <td className="p-3 font-medium">{s.message || s.title || s.description || "—"}</td>
                <td className="p-3 text-gray-500">{s.type || s.signal_type || "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    (s.severity || s.priority) === "critical" ? "bg-red-100 text-red-700" :
                    (s.severity || s.priority) === "high" || (s.severity || s.priority) === "warning" ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{s.severity || s.priority || "info"}</span>
                </td>
                <td className="p-3 text-gray-500">{s.domain || s.category || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

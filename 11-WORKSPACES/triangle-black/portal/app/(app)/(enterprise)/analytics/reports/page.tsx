"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

export default function AnalyticsReports() {
  const { data, isLoading } = useQuery(
    ["analytics-reports"],
    () => authFetch("/api/v1/dashboard/summary").then(r => r.json())
  );

  if (isLoading) return <div className="p-6 text-gray-400">Loading reports...</div>;
  if (!data || typeof data !== "object") return <div className="p-6 text-gray-400">No data available</div>;

  const sections = Object.entries(data).filter(([, v]) => typeof v === "object" && v !== null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Platform Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(([key, value]: [string, any]) => (
          <div key={key} className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">
              {key.replace(/_/g, " ")}
            </h3>
            {Object.entries(value).map(([k, v]: [string, any]) => (
              <div key={k} className="flex justify-between py-1 text-sm border-b last:border-0">
                <span className="text-gray-600">{k.replace(/_/g, " ")}</span>
                <span className="font-mono font-medium">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

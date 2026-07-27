"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || d?.signals || [];

export default function EngineeringAI() {
  const { data: health } = useQuery(["eng-ai-health"], () => authFetch("/api/v1/ai/health").then(r => r.json()));
  const { data: signalData } = useQuery(["eng-ai-signals"], () => authFetch("/api/v1/ai/signals").then(r => r.json()));
  const { data: twinData } = useQuery(["eng-ai-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));

  const signals = toArr(signalData);

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Engineering AI Hub</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">AI Status</div>
          <div className="text-xl font-bold text-green-600">{health?.status || health?.model || "Loading..."}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Digital Twin Score</div>
          <div className="text-3xl font-bold">{twinData?.health_score ?? "—"}<span className="text-lg text-gray-400">/100</span></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Active Signals</div>
          <div className="text-3xl font-bold">{signals.length}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Latest AI Signals</h2>
        {signals.length === 0 ? (
          <p className="text-gray-400 text-sm">No signals detected</p>
        ) : (
          signals.slice(0, 20).map((s: any, i: number) => (
            <div key={s.id || i} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{s.message || s.title || s.description || "—"}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                (s.severity || s.priority) === "critical" ? "bg-red-100 text-red-700" :
                (s.severity || s.priority) === "warning" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-600"
              }`}>{s.severity || s.priority || "info"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

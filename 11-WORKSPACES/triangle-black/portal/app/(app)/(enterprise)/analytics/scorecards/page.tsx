// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/analytics-api";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

function ScoreCard({ label, value, unit, status, target }: any) {
  const colors: Record<string, string> = {
    ok: "border-l-emerald-500 bg-emerald-50",
    warning: "border-l-amber-500 bg-amber-50",
    critical: "border-l-red-500 bg-red-50",
  };
  const textColors: Record<string, string> = {
    ok: "text-emerald-700",
    warning: "text-amber-700",
    critical: "text-red-700",
  };
  return (
    <div className={`border-l-4 rounded-r-xl p-4 ${colors[status] || "border-l-gray-300 bg-gray-50"}`}>
      <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      <div className={`text-2xl font-bold ${textColors[status] || "text-gray-900"}`}>
        {typeof value === "number" && value > 10000 ? `${(value/1000).toFixed(0)}K` : value ?? "—"}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </div>
      {target && <div className="text-xs text-gray-400 mt-1">Target: {target}</div>}
    </div>
  );
}

export default function ScorecardsPage() {
  const allQ = useQuery({ queryKey: ["analytics-all"], queryFn: () => analyticsApi.allKpis() });
  const domains = (allQ.data as any)?.domains || {};
  const meta = (allQ.data as any)?.meta || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/analytics" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Scorecards</h1>
          <p className="text-sm text-gray-500">{meta.total_kpis || 0} KPIs · {meta.critical || 0} critical · {meta.warnings || 0} warnings</p>
        </div>
      </div>

      {Object.entries(domains).map(([domain, data]: [string, any]) => (
        <div key={domain} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900 capitalize">{domain} KPIs</h2>
          </div>
          <div className="p-4 grid grid-cols-4 gap-4">
            {(data?.kpis || []).map((kpi: any) => (
              <ScoreCard key={kpi.key} label={kpi.label} value={kpi.value} unit={kpi.unit} status={kpi.status} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

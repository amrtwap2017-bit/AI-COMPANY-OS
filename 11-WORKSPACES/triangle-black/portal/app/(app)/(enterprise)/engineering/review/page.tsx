"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
const ENG_TYPES = ["hvac", "electrical", "mechanical", "corrective", "plumbing"];

async function fetchWOs() {
  try {  
    const r = await fetch(`${BACK
  } catch { return []; }
}/api/v1/work-orders`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchAssets() {
  try {  
    const r = await fetch(`${BACK
  } catch { return []; }
}/api/v1/assets`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

export default function EngineeringReviewPage() {
  const { data: wos = [], isLoading: w1 } = useQuery({
    queryKey: ["eng-wos"], queryFn: fetchWOs, refetchInterval: 300000,
  });
  const { data: assets = [], isLoading: a1 } = useQuery({
    queryKey: ["eng-assets"], queryFn: fetchAssets, refetchInterval: 300000,
  });

  const isLoading = w1 || a1;

  const engWOs = (wos || []).filter((w: any) => ENG_TYPES.includes(w.type));
  const completed = engWOs.filter((w: any) => w.status === "completed");
  const criticalOpen = engWOs.filter((w: any) => w.priority === "critical" && w.status === "open");
  const faultAssets = (assets || []).filter((a: any) => a.status === "fault" || a.status === "breakdown");
  const overallRate = engWOs.length > 0 ? Math.round((completed.length / engWOs.length) * 100) : 0;

  const byType = ENG_TYPES.reduce((acc: any, t: any) => {
    const total = engWOs.filter((w: any) => w.type === t).length;
    const done  = engWOs.filter((w: any) => w.type === t && w.status === "completed").length;
    if (total > 0) acc[t] = { total, done, rate: Math.round(done / total * 100) };
    return acc;
  }, {});

  const byCriticality = ["critical", "high", "medium"].reduce((acc: any, c: any) => {
    acc[c] = {
      total: (assets || []).filter((a: any) => a.criticality === c).length,
      fault: (assets || []).filter((a: any) => a.criticality === c && (a.status === "fault" || a.status === "breakdown")).length,
    };
    return acc;
  }, {});

  if (isLoading) return <LoadingState message="Loading engineering review..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Engineering Review"
        subtitle="Engineering performance metrics and asset health"
        badge={`${overallRate}% Completion`}
      />

      <MetricStrip metrics={([
        { label: "Engineering WOs",  value: engWOs.length ) || []},
        { label: "Completion Rate",  value: `${overallRate}%`, color: overallRate >= 80 ? "green" as const : overallRate >= 50 ? "amber" as const : "red" as const },
        { label: "Critical Open",    value: criticalOpen.length, color: criticalOpen.length > 0 ? "red" as const : "slate" as const },
        { label: "Assets in Fault",  value: faultAssets.length, color: faultAssets.length > 0 ? "red" as const : "slate" as const },
      ]} />

      <SectionCard title="WO Completion by Type">
        {Object.keys(byType).length === 0 ? (
          <EmptyState title="No data" description="No engineering work orders found" />
        ) : (
          <div className="space-y-3">
            {Object.entries(byType).map(([type, data]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-slate-700 capitalize">{type}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${data.rate >= 80 ? "bg-green-500" : data.rate >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${data.rate}%` }}
                  />
                </div>
                <div className="w-28 text-xs text-slate-500 text-right">
                  {data.done}/{data.total} ({data.rate}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Asset Criticality Health">
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(byCriticality).map(([crit, data]) => (
            <div key={crit} className={`px-4 py-3 rounded-lg border ${
              crit === "critical" ? "border-red-200 bg-red-50" :
              crit === "high" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"
            }`}>
              <p className="text-xs font-semibold text-slate-600 uppercase">{crit}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{data.total}</p>
              {data.fault > 0 && (
                <p className="text-xs text-red-600 mt-0.5">{data.fault} in fault</p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
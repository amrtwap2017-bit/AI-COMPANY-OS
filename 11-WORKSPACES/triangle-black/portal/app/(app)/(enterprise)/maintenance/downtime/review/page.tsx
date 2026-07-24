"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchWOs() {
  const r = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

async function fetchAssets() {
  const r = await fetch(`${BACK}/api/v1/assets`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

export default function DowntimeReviewPage() {
  const { data: wos = [], isLoading: woLoading } = useQuery({
    queryKey: ["downtime-wos"],
    queryFn: fetchWOs,
    refetchInterval: 300000,
  });
  const { data: assets = [], isLoading: assetLoading } = useQuery({
    queryKey: ["downtime-assets"],
    queryFn: fetchAssets,
    refetchInterval: 300000,
  });

  const isLoading = woLoading || assetLoading;

  const corrective = (wos || []).filter(
    (w) => w.type === "corrective" &&
           w.status === "completed" &&
           w.started_at &&
           w.completed_at
  );

  const withHours = corrective.map((w: any) => {
    const hours = (new Date(w.completed_at) - new Date(w.started_at)) / 3600000;
    const asset = (assets || []).find((a: any) => a.id === w.asset_id);
    return { ...w, hours, assetName: asset?.name || "Unknown", category: asset?.category || "General" };
  }).filter((w: any) => w.hours > 0);

  const avgMTTR = withHours.length > 0
    ? (withHours.reduce((s: any, w: any) => s + w.hours, 0) / withHours.length).toFixed(1)
    : 0;

  const maxRepair = withHours.length > 0
    ? Math.max(...withHours.map((w: any) => w.hours)).toFixed(1)
    : 0;

  const uniqueAssets = new Set(withHours.map((w: any) => w.asset_id)).size;
  const mttrOk = Number(avgMTTR) < 8;

  const byCategory = withHours.reduce((acc: any, w: any) => {
    if (!acc[w.category]) acc[w.category] = { count: 0, totalHours: 0 };
    acc[w.category].count += 1;
    acc[w.category].totalHours += w.hours;
    return acc;
  }, {});

  const top5 = [...withHours].sort((a: any, b: any) => b.hours - a.hours).slice(0, 5);

  if (isLoading) return <LoadingState message="Loading downtime data..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Downtime Review"
        subtitle="Asset downtime and mean time to repair analysis"
        badge={mttrOk ? "On Target" : "Exceeds Target"}
      />

      <MetricStrip metrics={[
        { label: "Corrective WOs",  value: corrective.length },
        { label: "Avg MTTR (hrs)",  value: avgMTTR, color: mttrOk ? "green" as const : "red" as const },
        { label: "Longest Repair",  value: `${maxRepair}h` },
        { label: "Assets Affected", value: uniqueAssets },
      ]} />

      <SectionCard title={`MTTR Status — Target: under 8 hours`}>
        <div className={`px-4 py-3 rounded-lg border ${
          mttrOk ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}>
          <p className={`text-sm font-bold ${mttrOk ? "text-green-700" : "text-red-700"}`}>
            {mttrOk
              ? `MTTR within target — avg ${avgMTTR}h (target < 8h)`
              : `MTTR exceeds target — avg ${avgMTTR}h (target < 8h)`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on {corrective.length} completed corrective work orders
          </p>
        </div>
      </SectionCard>

      <SectionCard title="MTTR by Asset Category">
        {Object.keys(byCategory).length === 0 ? (
          <EmptyState title="No data" description="No completed corrective work orders with timing data" />
        ) : (
          <div className="space-y-2">
            {Object.entries(byCategory).map(([cat, data]) => (
              <div key={cat} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{cat}</p>
                  <p className="text-xs text-slate-500">{data.count} repairs</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">
                    {(data.totalHours / data.count).toFixed(1)}h avg
                  </p>
                  <p className="text-xs text-slate-400">max: {Math.max(...withHours.filter(w => w.category === cat).map(w => w.hours)).toFixed(1)}h</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Top 5 Longest Repairs">
        {top5.length === 0 ? (
          <EmptyState title="No repairs recorded" description="No completed corrective WOs with timing found" />
        ) : (
          <div className="space-y-2">
            {top5.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between px-4 py-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">{w.title}</p>
                  <p className="text-xs text-slate-500">{w.assetName} · {w.completed_at?.slice(0, 10)}</p>
                </div>
                <span className="text-sm font-bold text-amber-700">{(Number(w.hours) || 0).toFixed(1)}h</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchVendors() {
  const r = await fetch(`${BACK}/api/v1/inventory/vendors`, { credentials: "include" });
  if (!r.ok) {
    const r2 = await fetch(`${BACK}/api/v1/supply-chain/vendors`, { credentials: "include" });
    if (!r2.ok) return [];
    const d = await r2.json();
    return Array.isArray(d) ? d : [];
  }
  const d = await r.json();
  return Array.isArray(d) ? d : [];
}

async function fetchPOs() {
  const r = await fetch(`${BACK}/api/v1/inventory/purchase-orders/`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : [];
}

export default function ComparisonPage() {
  const { data: vendors = [], isLoading: v1 } = useQuery({
    queryKey: ["comp-vendors"], queryFn: fetchVendors, refetchInterval: 300000,
  });
  const { data: pos = [], isLoading: p1 } = useQuery({
    queryKey: ["comp-pos"], queryFn: fetchPOs, refetchInterval: 300000,
  });

  const isLoading = v1 || p1;

  const vendorScores = vendors.slice(0, 5).map((v) => {
    const poCount = pos.filter((p) => p.vendor_id === v.id).length;
    const leadScore = v.lead_time_days ? Math.max(0, 40 - v.lead_time_days * 2) : 20;
    const maxPO = Math.max(...vendors.map((x) => pos.filter((p) => p.vendor_id === x.id).length), 1);
    const poScore = Math.round((poCount / maxPO) * 60);
    return { ...v, poCount, score: leadScore + poScore };
  }).sort((a, b) => b.score - a.score);

  const best = vendorScores[0];
  const fastestDelivery = vendors.length > 0
    ? vendors.reduce((a, b) => (a.lead_time_days || 999) < (b.lead_time_days || 999) ? a : b)
    : null;

  if (isLoading) return <LoadingState message="Loading vendor comparison..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Vendor Comparison"
        subtitle="Side-by-side vendor scoring and evaluation"
        badge="AI Scored"
      />

      <MetricStrip metrics={[
        { label: "Total Vendors",     value: vendors.length },
        { label: "Recommended",       value: best?.name?.split(" ")[0] || "—" },
        { label: "Fastest Delivery",  value: fastestDelivery ? `${fastestDelivery.lead_time_days}d` : "—" },
        { label: "Active POs",        value: pos.filter((p) => p.status !== "cancelled").length },
      ]} />

      <SectionCard title="Vendor Scoring Matrix">
        {vendorScores.length === 0 ? (
          <EmptyState title="No vendors" description="No vendor data available" />
        ) : (
          <div className="space-y-3">
            {vendorScores.map((v, i) => (
              <div key={v.id} className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${
                i === 0 ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{v.name}</p>
                    {i === 0 && <StatusBadge status="recommended" label="Recommended" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {v.category} · Lead time: {v.lead_time_days || "?"}d · {v.poCount} POs
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-700">{v.score}</p>
                  <p className="text-xs text-slate-400">score</p>
                </div>
                <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${v.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="RFQ Comparison">
        <EmptyState
          title="Submit RFQs to compare quotes"
          description="Create RFQs from Supply Chain Workbench and send to multiple vendors to compare responses here."
        />
      </SectionCard>
    </PageWrapper>
  );
}
"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchVendors() {
  const r = await fetch(`${BACK}/api/v1/inventory/vendors`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchPOs() {
  const r = await fetch(`${BACK}/api/v1/inventory/purchase-orders/`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchRFQs() {
  const r = await fetch(`${BACK}/api/v1/rfqs`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

export default function VendorAnalyticsPage() {
  const { data: vendors = [], isLoading: v1 } = useQuery({
    queryKey: ["va-vendors"], queryFn: fetchVendors, refetchInterval: 300000,
  });
  const { data: pos = [], isLoading: v2 } = useQuery({
    queryKey: ["va-pos"], queryFn: fetchPOs, refetchInterval: 300000,
  });
  const { data: rfqs = [], isLoading: v3 } = useQuery({
    queryKey: ["va-rfqs"], queryFn: fetchRFQs, refetchInterval: 300000,
  });

  const isLoading = v1 || v2 || v3;

  const vendorScores = vendors.map((v) => {
    const vendorPOs   = pos.filter((p) => p.vendor_id === v.id);
    const poCount     = vendorPOs.length;
    const totalSpend  = vendorPOs.reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
    const leadScore   = v.lead_time_days ? Math.max(0, 40 - v.lead_time_days * 2) : 20;
    const maxPOs      = Math.max(...vendors.map((x) => pos.filter((p) => p.vendor_id === x.id).length), 1);
    const poScore     = Math.round((poCount / maxPOs) * 50);
    const score       = Math.min(100, 10 + leadScore + poScore);
    return { ...v, poCount, totalSpend, score };
  }).sort((a, b) => b.score - a.score);

  const totalSpend      = pos.reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
  const activeVendors   = vendorScores.filter((v) => v.poCount > 0).length;
  const avgLead         = vendors.length > 0
    ? Math.round(vendors.reduce((s, v) => s + (v.lead_time_days || 0), 0) / vendors.length)
    : 0;
  const rfqResponded    = rfqs.filter((r) => r.status === "received").length;
  const responseRate    = rfqs.length > 0 ? Math.round((rfqResponded / rfqs.length) * 100) : 0;
  const maxSpend        = Math.max(...vendorScores.map((v) => v.totalSpend), 1);

  if (isLoading) return <LoadingState message="Loading vendor analytics..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Vendor Analytics"
        subtitle="Supplier performance scorecard and spend analysis"
        badge="AI Scored"
      />

      <MetricStrip metrics={[
        { label: "Total Vendors",  value: vendors.length },
        { label: "Active",         value: activeVendors,               color: "green" as const },
        { label: "Total Spend",    value: `${totalSpend.toLocaleString()} EGP` },
        { label: "Avg Lead Time",  value: `${avgLead}d` },
      ]} />

      <SectionCard title="Vendor Performance Scorecard">
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
                    {i === 0 && <StatusBadge status="recommended" label="Top Vendor" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {v.category} · Lead: {v.lead_time_days || "?"}d · {v.poCount} POs · {v.payment_terms || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{v.score}/100</p>
                  <p className="text-xs text-slate-400">{v.totalSpend.toLocaleString()} EGP</p>
                </div>
                <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${v.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Spend Distribution (Top 5)">
        <div className="space-y-3">
          {vendorScores.slice(0, 5).map((v) => (
            <div key={v.id} className="flex items-center gap-3">
              <div className="w-32 text-xs font-medium text-slate-700 truncate">{v.name}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-blue-500 rounded-full"
                  style={{ width: `${(v.totalSpend / maxSpend) * 100}%` }}
                />
              </div>
              <div className="w-36 text-xs text-slate-500 text-right">
                {v.totalSpend.toLocaleString()} EGP
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="RFQ Response Analysis">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center px-4 py-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{rfqs.length}</p>
            <p className="text-xs text-slate-500">Total RFQs</p>
          </div>
          <div className="text-center px-4 py-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{rfqResponded}</p>
            <p className="text-xs text-slate-500">Responded</p>
          </div>
          <div className="text-center px-4 py-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{responseRate}%</p>
            <p className="text-xs text-slate-500">Response Rate</p>
          </div>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}

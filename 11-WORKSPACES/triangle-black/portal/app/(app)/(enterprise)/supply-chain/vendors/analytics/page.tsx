// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchVendors() {
  try {
    const r = await authFetch(`/api/v1/inventory/vendors`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.items ?? []);
  } catch { return []; }
}
async function fetchPOs() {
  try {
    const r = await authFetch(`/api/v1/purchase-orders/`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.items ?? []);
  } catch { return []; }
}
async function fetchRFQs() {
  try {
    const r = await authFetch(`/api/v1/rfqs`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.items ?? []);
  } catch { return []; }
}

export default function VendorAnalyticsPage() {
  const { data: vendors = [], isLoading: v1 } = useQuery({ queryKey: ["va-vendors"], queryFn: fetchVendors, refetchInterval: 300000 });
  const { data: pos = [], isLoading: v2 } = useQuery({ queryKey: ["va-pos"], queryFn: fetchPOs, refetchInterval: 300000 });
  const { data: rfqs = [], isLoading: v3 } = useQuery({ queryKey: ["va-rfqs"], queryFn: fetchRFQs, refetchInterval: 300000 });

  const isLoading = v1 || v2 || v3;

  const vendorScores = toArr(vendors).map((v) => {
    const vendorPOs  = toArr(pos).filter((p) => p.vendor_id === v.id);
    const poCount    = vendorPOs.length;
    const totalSpend = toArr(vendorPOs).reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
    const leadScore  = v.lead_time_days ? Math.max(0, 40 - v.lead_time_days * 2) : 20;
    const maxPOs     = Math.max(...toArr(vendors).map((x) => toArr(pos).filter((p) => p.vendor_id === x.id).length), 1);
    const poScore    = Math.round((poCount / maxPOs) * 50);
    return { ...v, poCount, totalSpend, score: Math.min(100, 10 + leadScore + poScore) };
  }).sort((a, b) => b.score - a.score);

  const totalSpend    = toArr(pos).reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
  const activeVendors = toArr(vendorScores).filter((v) => v.poCount > 0).length;
  const avgLead       = vendors.length > 0 ? Math.round(toArr(vendors).reduce((s, v) => s + (v.lead_time_days || 0), 0) / (vendors.length || 1)) : 0;
  const rfqResponded  = toArr(rfqs).filter((r) => r.status === "received").length;
  const maxSpend      = Math.max(...toArr(vendorScores).map((v) => v.totalSpend), 1);

  if (isLoading) return <LoadingState message="Loading vendor analytics..." />;

  return (
    <PageWrapper>
      <PageHeader title="Vendor Analytics" subtitle="Supplier performance scorecard" badge="AI Scored" />
      <MetricStrip metrics={[
        { label: "Total Vendors",  value: vendors.length },
        { label: "Active",         value: activeVendors,               color: "green" as const },
        { label: "Total Spend",    value: `${totalSpend.toLocaleString()} EGP` },
        { label: "Avg Lead Time",  value: `${avgLead}d` },
      ]} />

      <SectionCard title="Vendor Performance Scorecard">
        {vendorScores.length === 0 ? <EmptyState title="No vendors" description="No vendor data available" /> : (
          <div className="space-y-3">
            {toArr(vendorScores).map((v, i) => (
              <div key={v.id} className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${i === 0 ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{v.name}</p>
                    {i === 0 && <StatusBadge status="recommended" label="Top Vendor" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{v.category} · Lead: {v.lead_time_days || "?"}d · {v.poCount} POs</p>
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
          {(vendorScores || []).slice(0, 5).map((v) => (
            <div key={v.id} className="flex items-center gap-3">
              <div className="w-32 text-xs font-medium text-slate-700 truncate">{v.name}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-blue-500 rounded-full" style={{ width: `${(maxSpend ? (v.totalSpend / maxSpend) * 100 : 0)}%` }} />
              </div>
              <div className="w-36 text-xs text-slate-500 text-right">{v.totalSpend.toLocaleString()} EGP</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="RFQ Response Analysis">
        <div className="grid grid-cols-3 gap-4">
          {[{label:"Total RFQs", val:rfqs.length, bg:"bg-slate-50"},{label:"Responded", val:rfqResponded, bg:"bg-green-50"},{label:"Response Rate", val:`${rfqs.length>0?Math.round(rfqResponded/rfqs.length*100):0}%`, bg:"bg-blue-50"}].map((item) => (
            <div key={item.label} className={`text-center px-4 py-3 ${item.bg} rounded-lg`}>
              <p className="text-2xl font-bold text-slate-800">{item.val}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}

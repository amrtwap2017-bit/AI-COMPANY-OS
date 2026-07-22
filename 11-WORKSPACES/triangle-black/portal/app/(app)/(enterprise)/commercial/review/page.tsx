"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchLeads() {
  const r = await fetch(`${BACK}/api/v1/leads`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

async function fetchContracts() {
  const r = await fetch(`${BACK}/api/v1/contracts`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

export default function CommercialReviewPage() {
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["leads-review"],
    queryFn: fetchLeads,
    refetchInterval: 300000,
  });
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts-review"],
    queryFn: fetchContracts,
    refetchInterval: 300000,
  });

  const isLoading = leadsLoading || contractsLoading;

  const won    = leads.filter((l) => l.status === "won").length;
  const lost   = leads.filter((l) => l.status === "lost").length;
  const active = leads.filter((l) => !["won","lost","converted"].includes(l.status)).length;
  const convRate = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;

  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const totalValue = contracts.reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0);

  if (isLoading) return <LoadingState message="Loading commercial data..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Commercial Review"
        subtitle="Pipeline health and contract performance"
        badge="Live"
      />
      <MetricStrip metrics={[
        { label: "Total Leads",       value: leads.length },
        { label: "Active Pipeline",   value: active,        color: "blue"  as const },
        { label: "Won",               value: won,           color: "green" as const },
        { label: "Conversion Rate",   value: `${convRate}%` },
        { label: "Active Contracts",  value: activeContracts },
        { label: "Total Value EGP",   value: totalValue.toLocaleString() },
      ]} />

      <SectionCard title="Lead Status Breakdown">
        {leads.length === 0 ? (
          <EmptyState title="No leads" description="No leads in the system yet" />
        ) : (
          <div className="space-y-2">
            {["new","qualified","negotiation","won","lost","converted","assigned"].map((status) => {
              const count = leads.filter((l) => l.status === status).length;
              if (count === 0) return null;
              const pct = Math.round((count / leads.length) * 100);
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-slate-600 capitalize">{status}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${
                        status === "won" ? "bg-green-500" :
                        status === "lost" ? "bg-red-400" :
                        status === "negotiation" ? "bg-amber-400" :
                        "bg-blue-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm font-medium text-slate-700 text-right">
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Active Contracts">
        {contracts.length === 0 ? (
          <EmptyState title="No contracts" description="No contracts found" />
        ) : (
          <div className="space-y-2">
            {contracts.filter((c) => c.status === "active").slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.client_name || c.name || "Contract"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.start_date?.slice(0, 10)} → {c.end_date?.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {Number(c.contract_value || 0).toLocaleString()} EGP
                  </span>
                  <StatusBadge status={c.status || "active"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchContracts() {
  const r = await fetch(`${BACK}/api/v1/contracts`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchInvoices() {
  const r = await fetch(`${BACK}/api/v1/invoices`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchWOs() {
  const r = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

export default function CustomerDetailPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const name         = searchParams.get("name") || decodeURIComponent(String(params?.id || ""));

  const { data: contracts = [], isLoading: c1 } = useQuery({
    queryKey: ["cust-contracts"], queryFn: fetchContracts, refetchInterval: 300000,
  });
  const { data: invoices  = [], isLoading: c2 } = useQuery({
    queryKey: ["cust-invoices"],  queryFn: fetchInvoices,  refetchInterval: 300000,
  });
  const { data: wos       = [], isLoading: c3 } = useQuery({
    queryKey: ["cust-wos"],       queryFn: fetchWOs,       refetchInterval: 300000,
  });

  const isLoading = c1 || c2 || c3;

  const custContracts = (contracts || []).filter(
    (c) => c.client_name?.toLowerCase().includes(name.toLowerCase())
  );
  const contractIds   = new Set(custContracts.map((c) => c.id));
  const custInvoices  = invoices.filter((i) => contractIds.has(i.contract_id));
  const custWOs       = (wos || []).filter((w) => contractIds.has(w.contract_id));
  const activeCount   = custContracts.filter((c) => c.status === "active").length;
  const totalValue    = custContracts.reduce((s, c) => s + (Number(c.contract_value) || 0), 0);

  if (isLoading) return <LoadingState message="Loading customer..." />;

  if (custContracts.length === 0) {
    return (
      <PageWrapper>
        <PageHeader title="Customer Not Found" />
        <EmptyState
          title="No customer data found"
          description={`No contracts found for "${name}"`}
        />
        <div className="px-6">
          <Link href="/customers" className="text-sm text-blue-600 underline">
            Back to Customers
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title={name}
        subtitle={`${custContracts.length} contract${custContracts.length !== 1 ? "s" : ""}`}
        badge="Customer"
      />

      <MetricStrip metrics={[
        { label: "Active Contracts", value: activeCount,                        color: "green" as const },
        { label: "Total Value EGP",  value: totalValue.toLocaleString() },
        { label: "Work Orders",      value: custWOs.length,                     color: "blue" as const },
        { label: "Invoices",         value: custInvoices.length },
      ]} />

      <SectionCard title="Contracts">
        <div className="space-y-2">
          {custContracts.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {c.client_name}
                </p>
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
      </SectionCard>

      {custWOs.length > 0 && (
        <SectionCard title="Work Orders">
          <div className="space-y-2">
            {custWOs.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-800">{w.title}</p>
                <div className="flex gap-2">
                  <StatusBadge status={w.priority || "medium"} />
                  <StatusBadge status={w.status || "open"} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="px-1">
        <Link href="/customers" className="text-sm text-blue-600 underline">
          Back to Customers
        </Link>
      </div>
    </PageWrapper>
  );
}

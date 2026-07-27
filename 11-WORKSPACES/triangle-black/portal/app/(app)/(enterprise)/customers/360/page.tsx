"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, SearchInput } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

const Customer360Page = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery(
    ["customer-360-list"],
    () => authFetch("/api/v1/customer-360/").then(r => r.json()),
    { refetchInterval: 300000 }
  );

  const { data: detail, isLoading: detailLoading } = useQuery(
    ["customer-360-detail", selected],
    () => authFetch(`/api/v1/customer-360/${selected}`).then(r => r.json()),
    { enabled: !!selected, refetchInterval: 300000 }
  );

  if (isLoading) return <LoadingState />;
  const list = toArr(customers).filter((c: any) =>
    !search || c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <PageHeader title="Customer 360" subtitle={`${list.length} customers`} badge="CS" />
      <div className="grid grid-cols-3 gap-4">
        {/* Customer List */}
        <div className="col-span-1">
          <SectionCard title="Customers">
            <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
            <div className="space-y-2 mt-3 max-h-[600px] overflow-y-auto">
              {list.length === 0 ? <EmptyState /> : list.map((c: any) => (
                <div
                  key={c.company}
                  onClick={() => setSelected(c.company)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${
                    selected === c.company
                      ? "bg-amber-50 border-amber-300"
                      : "bg-slate-50 border-transparent hover:border-slate-200"
                  }`}
                >
                  <p className="font-medium text-sm text-slate-800">{c.company}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-secondary">{c.total_contracts} contracts</span>
                    <span className="text-xs text-secondary">{fmtEGP(c.total_value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Customer Detail */}
        <div className="col-span-2">
          {!selected ? (
            <SectionCard title="Select a customer">
              <EmptyState />
            </SectionCard>
          ) : detailLoading ? <LoadingState /> : detail ? (
            <div className="space-y-4">
              {/* Summary */}
              <MetricStrip metrics={[
                { label: "Contracts",   value: detail?.summary?.total || detail?.summary?.count || 0?.total_contracts || 0 },
                { label: "Active",      value: detail?.summary?.total || detail?.summary?.count || 0?.active_contracts || 0, color: "green" },
                { label: "Work Orders", value: detail?.summary?.total || detail?.summary?.count || 0?.total_work_orders || 0 },
                { label: "Open WOs",    value: detail?.summary?.total || detail?.summary?.count || 0?.open_work_orders || 0, color: "amber" },
                { label: "Invoiced",    value: fmtEGP(detail.summary?.total_invoiced), color: "blue" },
                { label: "CS Score",    value: `${detail.summary?.health_score || 0}/100`, color: "green" },
              ]} />

              {/* Contracts */}
              <SectionCard title="Contracts">
                <div className="space-y-2">
                  {toArr(detail?.contracts).slice(0,5).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.title || c.contract_number}</p>
                        <p className="text-xs text-secondary">{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-amber-700">{fmtEGP(c.total_value)}</span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ))}
                  {toArr(detail?.contracts).length === 0 && <EmptyState />}
                </div>
              </SectionCard>

              {/* Work Orders */}
              <SectionCard title="Work Orders">
                <div className="space-y-2">
                  {toArr(detail?.work_orders).slice(0,5).map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{w.title}</p>
                        <p className="text-xs text-secondary">{fmtDate(w.created_at)}</p>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                  ))}
                  {toArr(detail?.work_orders).length === 0 && <p className="text-sm text-tertiary">No work orders linked</p>}
                </div>
              </SectionCard>

              {/* Invoices */}
              <SectionCard title="Invoices">
                <div className="space-y-2">
                  {toArr(detail?.invoices).slice(0,5).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{inv.invoice_number}</p>
                        <p className="text-xs text-secondary">{fmtDate(inv.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{fmtEGP(inv.amount)}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))}
                  {toArr(detail?.invoices).length === 0 && <p className="text-sm text-tertiary">No invoices found</p>}
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Customer360Page;

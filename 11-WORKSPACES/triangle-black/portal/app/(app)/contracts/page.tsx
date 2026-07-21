"use client";
// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageHeader, PageWrapper, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { contractsApi } from "@/lib/api";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";
import { ChevronRight, FileCheck, RefreshCw } from "lucide-react";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending_signature: { label: "Pending Signature", cls: "bg-amber-50 text-amber-700" },
  active:            { label: "Active",            cls: "bg-emerald-50 text-emerald-700" },
  renewed:           { label: "Renewed",           cls: "bg-blue-50 text-blue-700" },
  expired:           { label: "Expired",           cls: "bg-slate-100 text-slate-500" },
  cancelled:         { label: "Cancelled",         cls: "bg-red-50 text-red-600" },
};

const FILTERS = [
  { value: "",                   label: "All" },
  { value: "pending_signature",  label: "Pending" },
  { value: "active",             label: "Active" },
  { value: "renewed",            label: "Renewed" },
  { value: "expired",            label: "Expired" },
];

export default function ContractsPage() {
  const [filter, setFilter] = useState("");
  const router = useRouter();

  const { data: contracts = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["contracts", filter],
    queryFn: () => contractsApi.list(filter || undefined).then((r: any) => Array.isArray(r) ? r : r?.data || r?.items || []),
    staleTime: 30_000,
  });

  const activeValue = contracts
    .filter((c: any) => ["active", "renewed"].includes(c.status))
    .reduce((s: number, c: any) => s + (c.total_value || 0), 0);

  const kpis = [
    { label: "Total",   value: contracts.length },
    { label: "Active",  value: contracts.filter((c: any) => c.status === "active").length },
    { label: "Pending", value: contracts.filter((c: any) => c.status === "pending_signature").length },
    { label: "Renewed", value: contracts.filter((c: any) => c.status === "renewed").length },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Contracts"
        subtitle={contracts.length + " contracts · " + fmtCurrency(activeValue) + " active value"}
        badge="CONTRACT"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />}

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (filter === f.value ? "bg-amber-600 text-white" : "text-slate-500 hover:bg-slate-100")}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingState type="table" rows={5} />
      ) : contracts.length === 0 ? (
        <EmptyState icon="📄" title="No contracts" description="Contracts are created when quotes are approved" />
      ) : (
        <div className="space-y-2">
          {contracts.map((c: any) => {
            const st = STATUS[c.status] || { label: c.status, cls: "bg-slate-100 text-slate-600" };
            return (
              <button key={c.id} onClick={() => router.push("/contracts/" + c.id)}
                className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700 truncate">{c.title}</p>
                      <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold " + st.cls}>{st.label}</span>
                      {c.renewal_count > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                          Renewed x{c.renewal_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {c.duration_months} months · {fmtCurrency(c.monthly_value || 0)}/mo · {fmtDate(c.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{fmtCurrency(c.total_value || 0)}</p>
                      <p className="text-[10px] text-slate-400">annual</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

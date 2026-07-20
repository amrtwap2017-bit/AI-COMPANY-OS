// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { customerSuccessApi } from "@/lib/api/enterprise";
import { PageHeader, LoadingState, EmptyState, AlertBanner, DataTable } from "@/components/ui";
import { PageWrapper } from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { RefreshCw, Users, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["customers-list"],
    queryFn:  () => customerSuccessApi.list({ limit: 100 }),
    refetchInterval: 60_000,
  });

  const customers: any[] = data?.data?.customers || [];
  const { query, setQuery, filtered } = useSearch(customers, ["company_name","email","phone"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);

  const columns = [
    { key:"company_name", label:"Customer",
      render:(row:any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
            {(row.company_name || row.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{row.company_name || "—"}</p>
            <p className="text-xs text-slate-400">{row.email || "—"}</p>
          </div>
        </div>
      )},
    { key:"phone", label:"Phone",
      render:(row:any) => <span className="text-sm text-slate-600">{row.phone || "—"}</span> },
    { key:"lead_count", label:"Leads",
      render:(row:any) => <span className="text-sm font-bold text-slate-900">{row.lead_count || 0}</span> },
    { key:"status", label:"Status",
      render:(row:any) => (
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 capitalize">
          {row.status || "active"}
        </span>
      )},
    { key:"action", label:"",
      render:(row:any) => (
        <Link href="/customers/360"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors">
          360 <ChevronRight className="w-3 h-3" />
        </Link>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Customer Success"
        subtitle={customers.length + " customers from pipeline"}
        badge="CS"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search customers..." }}
        resultCount={filtered.length} totalCount={customers.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8} /> :
         items.length === 0 ? (
          <EmptyState icon="👥" title="No customers yet" description="Customers are derived from won and qualified leads" />
         ) : <DataTable columns={columns} data={items} />}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
    </PageWrapper>
  );
}

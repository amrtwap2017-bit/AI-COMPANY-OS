// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, StatusPill, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { customersApi } from "@/lib/api";
import { fmtDate } from "@/lib/design-tokens";

export default function CustomersPage() {
  const { data=[], isLoading, isError, error } = useQuery({
    queryKey: ["customers"],
    queryFn:  () => customersApi.list({ limit: 200 }),
    staleTime: 30_000,
  });
  const { query, setQuery, filtered } = useSearch(data, ["name","email","phone"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"name",       label:"Customer",  render:(r:any)=>(<p className="font-semibold text-sm">{r.name}</p>)},
    { key:"email",      label:"Email",     render:(r:any)=>(<span className="text-sm text-slate-600">{r.email||"—"}</span>)},
    { key:"phone",      label:"Phone",     render:(r:any)=>(<span className="text-sm">{r.phone||"—"}</span>)},
    { key:"status",     label:"Status",    render:(r:any)=>(<StatusPill status={r.status||"active"}/>)},
    { key:"created_at", label:"Since",     render:(r:any)=>(<span className="text-xs text-slate-400">{fmtDate(r.created_at)}</span>)},
  ];
  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Customers" subtitle={`${data.length} customers`} badge="CX"/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load customers"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="👥" title="No customers" description={isError?"API unavailable":"No customers found"}/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </div>
  );
}

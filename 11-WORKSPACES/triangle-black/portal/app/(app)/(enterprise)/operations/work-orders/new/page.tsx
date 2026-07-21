// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw } from "lucide-react";

export default function Page() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["-api-v1-actions-dashboard-stats"],
    queryFn:  () => authFetchJSON("/api/v1/actions/dashboard/stats"),
    staleTime: 30_000, retry: 1,
  });
  const items = Array.isArray(data)?data:data?.items||data?.data||data?.results||data?.queue||data?.records||data?.schedule||data?.actions||data?.agents||data?.technicians||data?.rfqs||[];
  const { filtered } = useSearch(items, ["title","name","status","type","description"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"metric", label:"Metric", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["metric"]??"—")}</span>) },
    { key:"value", label:"Value", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["value"]??"—")}</span>) },
    { key:"status", label:"Status", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["status"]??"—")}</span>) },
    { key:"updated", label:"Updated", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["updated"]??"—")}</span>) },
  ];
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="New" subtitle={`${items.length} records`} badge="PG"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📋" title="No data" description="No records available"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

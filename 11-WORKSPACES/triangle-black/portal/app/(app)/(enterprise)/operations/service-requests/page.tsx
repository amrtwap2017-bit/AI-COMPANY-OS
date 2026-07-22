"use client"; // @ts-nocheck
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw } from "lucide-react";

export default function Page() {
  const { authFetchJSON } = useAuthFetch();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["operations-service-requests"],
    queryFn:  () => authFetchJSON("/api/v1/service-requests"),
    staleTime: 30_000, retry: 2,
  });

  const items = Array.isArray(data) ? data : data?.items || data?.data || data?.results || data?.queue || [];
  const { query, setQuery, filtered } = useSearch(items, ["title","name","status","type"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const columns = [
    { key:"title", label:"Title", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["title"]??"—")}</span>) },
    { key:"priority", label:"Priority", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["priority"]??"—")}</span>) },
    { key:"status", label:"Status", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["status"]??"—")}</span>) },
    { key:"created_at", label:"Date", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["created_at"]??"—")}</span>) },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Service Requests" subtitle={`${items.length} records`} badge="SR"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📊" title="No data" description="No records found"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

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
    queryKey: ["(app)-inventory-warehouses"],
    queryFn:  () => authFetchJSON("/api/v1/inventory/warehouses"),
    staleTime: 30_000,
  });
  const items = Array.isArray(data)?data:data?.items||data?.data||data?.results||[];
  const { query, setQuery, filtered } = useSearch(items, ["name","title","status"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"name", label:"Warehouse", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["name"]??"—")}</span>) },
    { key:"location", label:"Location", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["location"]??"—")}</span>) },
    { key:"capacity", label:"Capacity", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["capacity"]??"—")}</span>) },
// @ts-ignore
    { key:"items_count", label:"Items", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["items_count"]??"—")}</span>) },
// @ts-ignore
  ];
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Warehouses" subtitle={`${(items || []).length} records`} badge="WH"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="🏭" title="No data"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { AlertBanner, Breadcrumb, DataTable, EmptyState, LoadingState, PageHeader, PageWrapper } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw } from "lucide-react";

export default function Page() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["(app)-inventory-purchase-orders"],
    queryFn:  () => authFetchJSON("/api/v1/inventory/purchase-orders"),
    staleTime: 30_000,
  });
  const items = Array.isArray(data)?data:data?.items||data?.data||data?.results||[];
  const { query, setQuery, filtered } = useSearch(items, ["name","title","status"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"po_number", label:"PO #", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["po_number"]??"—")}</span>) },
    { key:"supplier", label:"Supplier", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["supplier"]??"—")}</span>) },
    { key:"total_amount", label:"Amount", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["total_amount"]??"—")}</span>) },
    { key:"status", label:"Status", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["status"]??"—")}</span>) },
  ];
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Purchase Orders" subtitle={`${(items || []).length} records`} badge="PO"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-secondary hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📋" title="No data"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

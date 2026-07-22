"use client"; // @ts-nocheck
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetch, authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw } from "lucide-react";

export default function Page() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["supply-chain-agreements"],
    queryFn:  () => authFetchJSON("/api/v1/contracts"),
    staleTime: 30_000, retry: 2,
  });
  const items = Array.isArray(data)?data:data?.items||data?.data||data?.results||data?.queue||data?.records||data?.rfqs||data?.leads||data?.suppliers||data?.purchase_orders||data?.purchase_requests||[];
  const { query, setQuery, filtered } = useSearch(items, ["title","name","status","type","description"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"contract_number", label:"Agreement #", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["contract_number"]??"—")}</span>) },
    { key:"vendor", label:"Vendor", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["vendor"]??"—")}</span>) },
    { key:"value", label:"Value", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["value"]??"—")}</span>) },
    { key:"status", label:"Status", render:(r:any)=>(<span className="text-sm text-slate-700">{String(r["status"]??"—")}</span>) },
  ];
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Framework Agreements" subtitle={`${items.length} records`} badge="AGR"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📋" title="No data" description="No records found"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, StatusPill, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageWrapper } from "@/components/ui";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { assetsApi } from "@/lib/api";
import { RefreshCw, Package, Search } from "lucide-react";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["assets"],
    queryFn: () => assetsApi.list({ limit: 200 }),
    staleTime: 30_000,
  });
  const { filtered } = useSearch(data, ["name","asset_type","location","serial_number"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"name", label:"Asset",
      render:(row:any)=>(
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.serial_number||"—"}</p>
        </div>)},
    { key:"asset_type", label:"Type",
      render:(row:any)=>(
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{row.asset_type||"—"}</span>)},
    { key:"location", label:"Location",
      render:(row:any)=>(<span className="text-sm text-slate-600">{row.location||"—"}</span>)},
    { key:"status", label:"Status",
      render:(row:any)=>(<StatusPill status={row.status||"active"}/>)},
    { key:"model", label:"Model",
      render:(row:any)=>(<span className="text-xs text-slate-400">{row.model||row.manufacturer||"—"}</span>)},
  ];
  return (
    <PageWrapper>
      <PageHeader title="Assets" subtitle={`${data.length} assets tracked`} badge="ASSET"
        actions={<button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>}/>
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value)}}
            placeholder="Search assets..."
            className="w-full sm:w-80 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm"/>
        </div>
      </div>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="📦" title="No assets" description="No assets found"/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

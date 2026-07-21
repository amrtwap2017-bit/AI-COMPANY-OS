// @ts-nocheck
"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { RefreshCw, Download } from "lucide-react";

export default function AssetsPage() {
  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["assets"],
    queryFn:  () => authFetchJSON("/api/v1/assets"),
    staleTime: 30_000,
  });

  const items = Array.isArray(data)?data:data?.items||data?.data||[];
  const { query, setQuery, filtered } = useSearch(items,["name","asset_type","location","serial_number"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 25);

  const kpis = useMemo(()=>({
    total:    items.length,
    active:   items.filter((a:any)=>a.status==="active"||!a.status).length,
    maintenance: items.filter((a:any)=>a.status==="under_maintenance"||a.status==="maintenance").length,
    types:    [...new Set(items.map((a:any)=>a.asset_type).filter(Boolean))].length,
  }),[items]);

  function exportCSV() {
    const h=["Name","Type","Location","Serial","Status","Model","Manufacturer"];
    const r=filtered.map((a:any)=>[a.name||"",a.asset_type||"",a.location||"",a.serial_number||"",a.status||"",a.model||"",a.manufacturer||""]);
    const csv=[h,...r].map(row=>row.map(v=>'"'+String(v)+'"').join(",")).join("\n");
    const blob=new window.Blob([csv],{type:"text/csv"});
    const url=window.URL.createObjectURL(blob);
    const a=window.document.createElement("a");
    a.href=url; a.download="assets.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"name", label:"Asset",
      render:(r:any)=>(
        <div>
          <Link href={"/assets/"+r.id} className="font-semibold text-sm text-slate-900 hover:text-amber-700">{r.name}</Link>
          <p className="text-xs text-slate-400 mt-0.5">{r.serial_number||"—"}</p>
        </div>
      )},
    { key:"asset_type", label:"Type",
      render:(r:any)=><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{r.asset_type||"—"}</span> },
    { key:"location", label:"Location", render:(r:any)=><span className="text-sm text-slate-600">{r.location||"—"}</span> },
    { key:"status",   label:"Status",   render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full "+getStateColor(r.status||"active")}>{r.status||"active"}</span> },
    { key:"model",    label:"Model",    render:(r:any)=><span className="text-xs text-slate-400">{r.model||r.manufacturer||"—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Assets" subtitle={`${kpis.total} tracked`} badge="ASSET"
        actions={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> Export
            </button>
            <button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total Assets",  val:kpis.total,       color:"text-slate-900"},
          {label:"Active",        val:kpis.active,      color:"text-emerald-700"},
          {label:"In Maintenance",val:kpis.maintenance, color:"text-amber-700"},
          {label:"Asset Types",   val:kpis.types,       color:"text-blue-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, type, location, serial..."
          className="w-full max-w-sm border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"/>
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📦" title="No assets" description="No assets tracked"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

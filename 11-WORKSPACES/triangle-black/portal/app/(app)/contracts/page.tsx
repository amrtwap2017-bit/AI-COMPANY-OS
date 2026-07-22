"use client";
// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Download, AlertTriangle, Eye } from "lucide-react";

export default function ContractsPage() {
  const [tab, setTab] = useState("all");

  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["contracts"],
    queryFn:  () => authFetchJSON("/api/v1/contracts"),
    staleTime: 30_000,
  });

  const items = Array.isArray(data) ? data : data?.items || [];

  const now = new Date();
  const in30 = new Date(now.getTime() + 30*24*60*60*1000);

  const filtered1 = useMemo(()=>{
    if (tab==="all") return items;
    if (tab==="expiring") return items.filter((c:any)=>{
      const end = c.end_date ? new Date(c.end_date) : null;
      return end && end <= in30 && end >= now;
    });
    return items.filter((c:any)=>c.status===tab);
  },[items,tab]);

  const { query, setQuery, filtered } = useSearch(filtered1,["contract_number","client_name","contract_type"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(()=>({
    total:    items.length,
    active:   items.filter((c:any)=>c.status==="active").length,
    expiring: items.filter((c:any)=>{
      const end = c.end_date ? new Date(c.end_date) : null;
      return end && end <= in30 && end >= now;
    }).length,
    expired:  items.filter((c:any)=>c.status==="expired").length,
    value:    items.reduce((s:number,c:any)=>s+(c.total_value||0),0),
  }),[items]);

  function exportCSV() {
    const h=["Contract #","Client","Type","Value","Status","Start","End"];
    const nl=String.fromCharCode(10);
    const r=filtered.map((c:any)=>[c.contract_number||"",c.client_name||"",c.contract_type||"",c.total_value||0,c.status||"",c.start_date||"",c.end_date||""]);
    const csv=[h,...r].map(row=>row.map(v=>'"'+String(v)+'"').join(",")).join(nl);
    const blob=new window.Blob([csv],{type:"text/csv"});
    const url=window.URL.createObjectURL(blob);
    const a=window.document.createElement("a");
    a.href=url; a.download="contracts.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"contract_number", label:"Contract",
      render:(r:any)=>(
        <div>
          <Link href={"/contracts/"+r.id} className="font-mono text-sm font-bold text-amber-700 hover:underline">{r.contract_number||r.id?.slice(0,8)}</Link>
          <p className="text-xs text-slate-500 mt-0.5">{r.client_name}</p>
        </div>
      )},
    { key:"contract_type", label:"Type",
      render:(r:any)=><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg capitalize">{(r.contract_type||"maintenance").replace("_"," ")}</span> },
    { key:"total_value", label:"Value",
      render:(r:any)=><span className="text-sm font-bold text-slate-900">{"EGP "+(r.total_value||0).toLocaleString()}</span> },
    { key:"status", label:"Status",
      render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full capitalize "+getStateColor(r.status)}>{r.status}</span> },
    { key:"end_date", label:"Expires",
      render:(r:any)=>{
        if (!r.end_date) return <span className="text-xs text-slate-400">—</span>;
        const end=new Date(r.end_date);
        const expiring=end<=in30&&end>=now;
        return <span className={"text-xs font-medium "+(expiring?"text-red-600 font-bold":"text-slate-500")}>{fmtDate(r.end_date)}{expiring?" ⚠️":""}</span>;
      }},
    { key:"view", label:"",
      render:(r:any)=>(
        <Link href={"/contracts/"+r.id} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 inline-flex">
          <Eye className="w-4 h-4"/>
        </Link>
      )},
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Contracts" subtitle={`${kpis.total} contracts · EGP ${(kpis.value/1000000).toFixed(1)}M ARR`} badge="CTR"
        actions={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> CSV
            </button>
            <button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:"Total",    val:kpis.total,    color:"text-slate-900", tab:"all"},
          {label:"Active",   val:kpis.active,   color:"text-emerald-700", tab:"active"},
          {label:"Expiring", val:kpis.expiring, color:"text-red-600",    tab:"expiring"},
          {label:"Expired",  val:kpis.expired,  color:"text-slate-400",  tab:"expired"},
          {label:"ARR (M)",  val:"EGP "+(kpis.value/1000000).toFixed(1), color:"text-blue-700", tab:"all"},
        ].map(k=>(
          <button key={k.label} onClick={()=>setTab(k.tab)}
            className={`bg-white rounded-2xl border p-4 text-left hover:border-amber-300 transition-colors ${tab===k.tab&&k.tab!=="all"?"border-amber-400 shadow-sm":"border-slate-200"}`}>
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {kpis.expiring>0&&(
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0"/>
          <p className="text-sm font-semibold text-red-800">{kpis.expiring} contract(s) expiring within 30 days — schedule renewal</p>
          <button onClick={()=>setTab("expiring")} className="ml-auto text-xs font-bold text-red-700 hover:underline">View →</button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        {["all","active","expiring","expired"].map(s=>(
          <button key={s} onClick={()=>setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search contracts..."
          className="ml-auto border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none w-60"/>
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📜" title="No contracts" description="No contracts found"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

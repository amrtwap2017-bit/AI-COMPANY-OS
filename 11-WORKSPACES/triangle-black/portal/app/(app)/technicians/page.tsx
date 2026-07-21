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
import { RefreshCw, Download } from "lucide-react";

export default function TechniciansPage() {
  const [activeFilter, setActiveFilter] = useState<"all"|"active"|"inactive">("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["technicians"],
    queryFn:  () => authFetchJSON("/api/v1/technicians"),
    staleTime: 30_000,
  });

  const items = Array.isArray(data) ? data : data?.items || data?.data || [];
  const filtered1 = activeFilter==="all" ? items :
    activeFilter==="active" ? items.filter((t:any)=>t.is_active) :
    items.filter((t:any)=>!t.is_active);

  const { query, setQuery, filtered } = useSearch(filtered1, ["name","email","phone"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(()=>({
    total:    items.length,
    active:   items.filter((t:any)=>t.is_active).length,
    inactive: items.filter((t:any)=>!t.is_active).length,
    busy:     items.filter((t:any)=>(t.current_work_orders||t.current_assignments||0)>0).length,
  }),[items]);

  function exportCSV() {
    const headers = ["Name","Email","Phone","Specialization","Active","Current Jobs"];
    const csv_rows = filtered.map((t:any)=>[
      t.name||"", t.email||"", t.phone||"",
      Array.isArray(t.specializations)?t.specializations.join(";"):(t.specializations||t.role||""),
      t.is_active?"Yes":"No",
      t.current_work_orders||t.current_assignments||0,
    ]);
    const csv=[headers,...csv_rows].map(r=>r.map(v=>'"'+String(v)+'"').join(",")).join("\n");
    const blob=new window.Blob([csv],{type:"text/csv"});
    const url=window.URL.createObjectURL(blob);
    const a=window.document.createElement("a");
    a.href=url; a.download="technicians.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"name", label:"Technician",
      render:(r:any)=>(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
            {(r.name||"?").charAt(0).toUpperCase()}
          </div>
          <div>
            <Link href={"/technicians/"+r.id} className="font-semibold text-sm text-slate-900 hover:text-amber-700">{r.name}</Link>
            <p className="text-xs text-slate-400">{r.email||"—"}</p>
          </div>
        </div>
      )},
    { key:"specializations", label:"Specialization",
      render:(r:any)=><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{Array.isArray(r.specializations)?r.specializations[0]:(r.specializations||r.role||"Technician")}</span> },
    { key:"phone", label:"Phone", render:(r:any)=><span className="text-sm text-slate-600">{r.phone||"—"}</span> },
    { key:"is_active", label:"Status",
      render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full "+getStateColor(r.is_active?"active":"inactive")}>{r.is_active?"Active":"Inactive"}</span> },
    { key:"current_work_orders", label:"Active Jobs",
      render:(r:any)=>{
        const n=r.current_work_orders||r.current_assignments||0;
        return <span className={`text-sm font-bold ${n>3?"text-red-600":n>0?"text-amber-600":"text-emerald-600"}`}>{n}</span>;
      }},
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Technicians" subtitle={`${kpis.active} active of ${kpis.total}`} badge="TECH"
        actions={
          <div className="flex items-center gap-2">
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
          {label:"Total",    val:kpis.total,    color:"text-slate-900"},
          {label:"Active",   val:kpis.active,   color:"text-emerald-700"},
          {label:"Inactive", val:kpis.inactive, color:"text-slate-400"},
          {label:"On Job",   val:kpis.busy,     color:"text-amber-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
        <div className="flex gap-2">
          {(["all","active","inactive"] as const).map(f=>(
            <button key={f} onClick={()=>setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeFilter===f?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search technicians..."
          className="flex-1 max-w-sm border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"/>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="👷" title="No technicians" description="No field team members found"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

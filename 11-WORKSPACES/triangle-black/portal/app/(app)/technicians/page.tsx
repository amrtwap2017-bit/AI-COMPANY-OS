// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, DataTable, StatusPill, LoadingState, EmptyState, AlertBanner,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageWrapper } from "@/components/ui";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { techniciansApi, type Technician } from "@/lib";
import { RefreshCw, UserCheck, Users } from "lucide-react";

export default function TechniciansPage() {
  const [activeFilter, setActiveFilter] = useState<"all"|"active"|"inactive">("all");

  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["technicians"],
    queryFn: () => techniciansApi.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const filtered1 = useMemo(() => {
    if (activeFilter==="active")   return data.filter((t:any)=>t.is_active);
    if (activeFilter==="inactive") return data.filter((t:any)=>!t.is_active);
    return data;
  }, [data, activeFilter]);

  const { query, setQuery, filtered } = useSearch(filtered1,["name","role","phone","specializations"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(()=>({
    total:    data.length,
    active:   data.filter((t:any)=>t.is_active).length,
    inactive: data.filter((t:any)=>!t.is_active).length,
  }),[data]);

  const columns = [
    { key:"name", label:"Technician",
      render:(row:Technician)=>(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm flex-shrink-0">
            {row.name?.charAt(0)||"?"}</div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email||"—"}</p>
          </div>
        </div>
      )},
    { key:"role", label:"Specialization",
      render:(row:any)=>(
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
          {Array.isArray(row.specializations)?row.specializations[0]:row.role||"Technician"}</span>
      )},
    { key:"phone", label:"Phone",
      render:(row:Technician)=>(<span className="text-sm text-slate-600">{row.phone||"—"}</span>)},
    { key:"is_active", label:"Status",
      render:(row:Technician)=>(<StatusPill status={row.is_active?"active":"inactive"}/>)},
    { key:"current_work_orders", label:"Active Jobs",
      render:(row:any)=>(
        <span className={`text-sm font-bold ${(row.current_work_orders||0)>3?"text-red-600":"text-slate-900"}`}>
          {row.current_work_orders||row.current_assignments||0}</span>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader title="Technicians" subtitle={`${kpis.active} active of ${kpis.total} total`} badge="TECH"
        actions={
          <button onClick={()=>refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>
        }/>

      <div className="grid grid-cols-3 gap-3">
        {[{label:"Total",val:kpis.total,f:"all"},{label:"Active",val:kpis.active,f:"active",color:"text-emerald-600"},{label:"Inactive",val:kpis.inactive,f:"inactive",color:"text-slate-400"}].map(k=>(
          <button key={k.label} onClick={()=>setActiveFilter(k.f as any)}
            className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-amber-300 transition-colors">
            <div className={`text-2xl font-bold ${k.color||"text-slate-900"}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}

      <ActionBar
        search={{value:query,onChange:setQuery,placeholder:"Search technicians..."}}
        resultCount={filtered.length} totalCount={data.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="👷" title="No technicians" description="No field team members found"/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

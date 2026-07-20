// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, DataTable, LoadingState, EmptyState, AlertBanner,
} from "@/components/ui"
import { PageWrapper } from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { workOrdersApi } from "@/lib/api";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus, Wrench } from "lucide-react";

const STATUS_FILTERS = ["all","open","in_progress","completed","cancelled"] as const;
const PRIORITY_COLORS: Record<string,string> = {
  low:       "bg-slate-100 text-slate-600",
  medium:    "bg-blue-100  text-blue-700",
  high:      "bg-amber-100 text-amber-700",
  critical:  "bg-red-100   text-red-700",
  emergency: "bg-red-200   text-red-800 font-bold",
};
const STATUS_COLORS: Record<string,string> = {
  open:        "bg-blue-100  text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed:   "bg-emerald-100 text-emerald-700",
  cancelled:   "bg-slate-100 text-slate-500",
  planning:    "bg-purple-100 text-purple-700",
};

export default function WorkOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["work-orders"],
    queryFn:  () => workOrdersApi.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const filtered1 = useMemo(() => {
    let r = data;
    if (statusFilter !== "all")   r = r.filter((w:any) => w.status === statusFilter);
    if (priorityFilter !== "all") r = r.filter((w:any) => w.priority === priorityFilter);
    return r;
  }, [data, statusFilter, priorityFilter]);

  const { query, setQuery, filtered } = useSearch(filtered1,["title","type","location"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 15);

  const kpis = useMemo(() => ({
    total:      data.length,
    open:       data.filter((w:any)=>w.status==="open").length,
    inProgress: data.filter((w:any)=>w.status==="in_progress").length,
    critical:   data.filter((w:any)=>w.priority==="critical"||w.priority==="emergency").length,
    completed:  data.filter((w:any)=>w.status==="completed").length,
  }), [data]);

  const columns = [
    { key:"title", label:"Work Order",
      render:(row:any)=>(
        <div>
          <Link href={`/work-orders/${row.id}`}
            className="font-semibold text-sm text-slate-900 hover:text-amber-700">{row.title}</Link>
          <p className="text-xs text-slate-500 mt-0.5">{row.type||row.category||"—"}</p>
        </div>
      )},
    { key:"priority", label:"Priority",
      render:(row:any)=>(
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize
          ${PRIORITY_COLORS[row.priority]||"bg-slate-100 text-slate-600"}`}>{row.priority}</span>
      )},
    { key:"status", label:"Status",
      render:(row:any)=>(
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
          ${STATUS_COLORS[row.status]||"bg-slate-100 text-slate-600"}`}>
          {(row.status||"open").replace("_"," ")}</span>
      )},
    { key:"location", label:"Location",
      render:(row:any)=>(<span className="text-xs text-slate-500">{row.location||row.site||"—"}</span>)},
    { key:"created_at", label:"Created",
      render:(row:any)=>(<span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span>)},
  ];

  return (
    <PageWrapper>
      <PageHeader title="Work Orders" subtitle={`${kpis.total} total work orders`} badge="WO"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={()=>refetch()} disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/></button>
            <Link href="/operations/work-orders/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
              <Plus className="w-4 h-4"/>New WO</Link>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:"Total",     val:kpis.total,      f:"all"},
          {label:"Open",      val:kpis.open,       f:"open"},
          {label:"In Progress",val:kpis.inProgress,f:"in_progress"},
          {label:"Critical",  val:kpis.critical,   f:"all",color:"text-red-600"},
          {label:"Completed", val:kpis.completed,  f:"completed"},
        ].map(k=>(
          <button key={k.label} onClick={()=>setStatusFilter(k.f)}
            className="bg-white rounded-xl border border-slate-200 p-3 text-left hover:border-amber-300 transition-colors">
            <div className={`text-2xl font-bold ${k.color||"text-slate-900"}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load"}/>}

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s==="all"?"All":s.replace("_"," ").replace(/\w/g,c=>c.toUpperCase())}</button>
        ))}
        <span className="mx-2 text-slate-300">|</span>
        {["all","high","critical","medium","low"].map(p=>(
          <button key={p} onClick={()=>setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              priorityFilter===p?"bg-slate-700 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {p==="all"?"Any Priority":p.charAt(0).toUpperCase()+p.slice(1)}</button>
        ))}
      </div>

      <ActionBar
        search={{value:query,onChange:setQuery,placeholder:"Search work orders..."}}
        resultCount={filtered.length} totalCount={data.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="🔧" title={query?"No results":"No work orders"}
           description={query?"Try different search":"Create your first work order"}
           action={!query&&<Link href="/operations/work-orders/new"
             className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg">Create WO</Link>}/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

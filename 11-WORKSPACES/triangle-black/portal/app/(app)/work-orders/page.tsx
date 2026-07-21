// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner, SearchInput } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus, Download } from "lucide-react";

const STATUS_TABS = ["all","open","in_progress","waiting_parts","inspection","completed","closed"];
const PRIORITY_TABS = ["all","critical","high","medium","low"];

export default function WorkOrdersPage() {
  const [statusTab,   setStatusTab]   = useState("all");
  const [priorityTab, setPriorityTab] = useState("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["work-orders"],
    queryFn:  () => authFetchJSON("/api/v1/work-orders"),
    staleTime: 30_000, retry: 2,
  });

  const items = Array.isArray(data) ? data : data?.items || data?.data || [];

  const filtered1 = useMemo(() => {
    let r = items;
    if (statusTab   !== "all") r = r.filter((w:any) => w.status   === statusTab);
    if (priorityTab !== "all") r = r.filter((w:any) => w.priority === priorityTab);
    return r;
  }, [items, statusTab, priorityTab]);

  const { query, setQuery, filtered } = useSearch(filtered1, ["title","type","description"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(() => ({
    total:       items.length,
    open:        items.filter((w:any) => w.status === "open").length,
    in_progress: items.filter((w:any) => w.status === "in_progress").length,
    critical:    items.filter((w:any) => w.priority === "critical" || w.priority === "emergency").length,
    completed:   items.filter((w:any) => w.status === "completed").length,
  }), [items]);

  function exportCSV() {
    if (!filtered.length) return;
    const headers = ["Title","Type","Priority","Status","Due Date","Created"];
    const rowsCSV = filtered.map((w:any) => [
      w.title||"", w.type||"", w.priority||"", w.status||"",
      w.due_date ? new Date(w.due_date).toLocaleDateString() : "",
      w.created_at ? new Date(w.created_at).toLocaleDateString() : "",
    ]);
    const csv = [headers,...rowsCSV].map(r=>r.map(v=>'"'+String(v).replace(/"/g,\'\'\'\'')+'"').join(",")).join("\n");
    const blob = new window.Blob([csv],{type:"text/csv"});
    const url  = window.URL.createObjectURL(blob);
    const a    = window.document.createElement("a");
    a.href=url; a.download="work-orders-"+new Date().toISOString().slice(0,10)+".csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"title", label:"Work Order",
      render:(r:any)=>(
        <div>
          <Link href={"/operations/work-orders/"+r.id} className="font-semibold text-sm text-slate-900 hover:text-amber-700">{r.title}</Link>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{r.type||"—"}</p>
        </div>
      )},
    { key:"priority", label:"Priority",
      render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full capitalize "+getStateColor(r.priority)}>{r.priority}</span> },
    { key:"status", label:"Status",
      render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full "+getStateColor(r.status)}>{(r.status||"").replace(/_/g," ")}</span> },
    { key:"due_date", label:"Due",
      render:(r:any)=><span className="text-xs text-slate-500">{r.due_date?fmtDate(r.due_date):"—"}</span> },
    { key:"created_at", label:"Created",
      render:(r:any)=><span className="text-xs text-slate-400">{fmtDate(r.created_at)}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Work Orders" subtitle={`${kpis.total} total`} badge="WO"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> Export
            </button>
            <button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
            <Link href="/operations/work-orders/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
              <Plus className="w-4 h-4"/> New WO
            </Link>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:"Total",      val:kpis.total,       tab:"all",         color:"text-slate-900"},
          {label:"Open",       val:kpis.open,         tab:"open",        color:"text-blue-700"},
          {label:"In Progress",val:kpis.in_progress,  tab:"in_progress", color:"text-amber-700"},
          {label:"Critical",   val:kpis.critical,     tab:"all",         color:"text-red-600"},
          {label:"Completed",  val:kpis.completed,    tab:"completed",   color:"text-emerald-700"},
        ].map(k=>(
          <button key={k.tab+k.label} onClick={()=>setStatusTab(k.tab)}
            className={`bg-white rounded-2xl border p-4 text-left hover:border-amber-300 transition-colors ${statusTab===k.tab&&k.tab!=="all"?"border-amber-400 shadow-sm":"border-slate-200"}`}>
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(s=>(
          <button key={s} onClick={()=>setStatusTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusTab===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s==="all"?"All":s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
          </button>
        ))}
        <span className="text-slate-200 mx-1">|</span>
        {PRIORITY_TABS.map(p=>(
          <button key={p} onClick={()=>setPriorityTab(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${priorityTab===p?"bg-slate-700 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {p==="all"?"Any Priority":p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
        <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search work orders..." className="flex-1 max-w-sm"/>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load"}/>}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> :
         rows.length===0 ? <EmptyState icon="🔧" title={query?"No results":"No work orders"}
           description={query?"Try different search":"Create your first work order"}
           action={!query&&<Link href="/operations/work-orders/new" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg">New Work Order</Link>}/> :
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

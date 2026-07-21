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
import { fmtDate } from "@/lib/design-tokens";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { RefreshCw, Plus, Download } from "lucide-react";

const STATUS_TABS = ["all","new","qualified","negotiation","won","lost"];

export default function LeadsPage() {
  const [tab, setTab] = useState("all");
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["leads", tab],
    queryFn:  () => authFetchJSON("/api/v1/leads"),
    staleTime: 30_000, retry: 2,
  });

  const items = Array.isArray(data) ? data : data?.leads || data?.items || data?.results || [];
  const filtered1 = tab === "all" ? items : items.filter((l:any) => l.status === tab);
  const { query, setQuery, filtered } = useSearch(filtered1, ["company_name","contact_name","email","phone"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(() => ({
    total:       items.length,
    new:         items.filter((l:any)=>l.status==="new").length,
    qualified:   items.filter((l:any)=>l.status==="qualified").length,
    negotiation: items.filter((l:any)=>l.status==="negotiation").length,
    won:         items.filter((l:any)=>l.status==="won").length,
  }), [items]);

  function exportCSV() {
    if (!filtered.length) return;
    const headers = ["Company","Contact","Email","Phone","Status","Source","Created"];
    const rows_csv = filtered.map((l:any) => [
      l.company_name||"",l.contact_name||"",l.email||"",
      l.phone||"",l.status||"",l.source||"",
      l.created_at ? new Date(l.created_at).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows_csv].map(r => r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join(String.fromCharCode(10));
    const blob = new window.Blob([csv], {type:"text/csv"});
    const url  = window.URL.createObjectURL(blob);
    const a    = window.document.createElement("a");
    a.href=url; a.download="leads-"+new Date().toISOString().slice(0,10)+".csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"company_name", label:"Company",
      render:(r:any)=>(
        <div>
          <Link href={"/leads/"+r.id} className="font-semibold text-sm text-slate-900 hover:text-amber-700 transition-colors">{r.company_name}</Link>
          <p className="text-xs text-slate-400 mt-0.5">{r.contact_name}</p>
        </div>
      )},
    { key:"email",   label:"Email",  render:(r:any)=><span className="text-sm text-slate-600">{r.email||"—"}</span> },
    { key:"status",  label:"Status", render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full "+getStateColor(r.status)}>{r.status}</span> },
    { key:"source",  label:"Source", render:(r:any)=><span className="text-xs text-slate-500 capitalize">{r.source||"—"}</span> },
    { key:"created_at", label:"Created", render:(r:any)=><span className="text-xs text-slate-400">{fmtDate(r.created_at)}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Leads" subtitle={`${kpis.total} total in pipeline`} badge="CRM"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> Export
            </button>
            <button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
            <Link href="/leads/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
              <Plus className="w-4 h-4"/> New Lead
            </Link>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:"Total",       val:kpis.total,       tab:"all",         color:"text-slate-900"},
          {label:"New",         val:kpis.new,         tab:"new",         color:"text-purple-700"},
          {label:"Qualified",   val:kpis.qualified,   tab:"qualified",   color:"text-blue-700"},
          {label:"Negotiation", val:kpis.negotiation, tab:"negotiation", color:"text-amber-700"},
          {label:"Won",         val:kpis.won,         tab:"won",         color:"text-emerald-700"},
        ].map(k=>(
          <button key={k.tab} onClick={()=>setTab(k.tab)}
            className={`bg-white rounded-2xl border p-4 text-left hover:border-amber-300 transition-colors ${tab===k.tab?"border-amber-400 shadow-sm":"border-slate-200"}`}>
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(s=>(
          <button key={s} onClick={()=>setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s==="all"?"All Leads":s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by company, contact, email..." className="flex-1 max-w-sm"/>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
        </div>
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load leads"}/>}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> :
         rows.length===0 ? <EmptyState icon="📋" title={query?"No results found":"No leads yet"}
           description={query?"Try a different search":"Add your first lead"}
           action={!query&&<Link href="/leads/new" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">Add Lead</Link>}/> :
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

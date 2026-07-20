// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { leadsApi } from "@/lib/api/leads";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus } from "lucide-react";

const STATUS_COLORS: any = {
  new:"bg-purple-100 text-purple-700", qualified:"bg-blue-100 text-blue-700",
  negotiation:"bg-amber-100 text-amber-700", won:"bg-emerald-100 text-emerald-700",
  lost:"bg-red-100 text-red-700",
};
const STATUS_FILTERS = ["all","new","qualified","negotiation","won","lost"];

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["leads", statusFilter],
    queryFn:  async () => {
      const r = await leadsApi.list({
        limit: 200,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      return r.data || [];
    },
    staleTime: 30_000,
    retry: 2,
  });

  const { query, setQuery, filtered } = useSearch(data, ["company_name","contact_name","email","phone"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);

  const kpis = {
    total:       data.length,
    new:         data.filter((l:any)=>l.status==="new").length,
    qualified:   data.filter((l:any)=>l.status==="qualified").length,
    negotiation: data.filter((l:any)=>l.status==="negotiation").length,
    won:         data.filter((l:any)=>l.status==="won").length,
  };

  const columns = [
    { key:"company_name", label:"Company",
      render:(row:any)=>(
        <div>
          <Link href={`/leads/${row.id}`} className="font-semibold text-sm text-slate-900 hover:text-amber-700">{row.company_name}</Link>
          <p className="text-xs text-slate-500 mt-0.5">{row.contact_name}</p>
        </div>
      )},
    { key:"email", label:"Contact",
      render:(row:any)=>(
        <div><p className="text-sm text-slate-600">{row.email}</p><p className="text-xs text-slate-400">{row.phone||"—"}</p></div>
      )},
    { key:"status", label:"Status",
      render:(row:any)=>(
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[row.status]||"bg-slate-100 text-slate-600"}`}>{row.status}</span>
      )},
    { key:"source", label:"Source",
      render:(row:any)=><span className="text-xs text-slate-500 capitalize">{row.source||"—"}</span>},
    { key:"created_at", label:"Created",
      render:(row:any)=><span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span>},
  ];

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Leads" subtitle={`${kpis.total} total in pipeline`} badge="CRM"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={()=>refetch()} disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
            <Link href="/leads/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
              <Plus className="w-4 h-4"/> New Lead
            </Link>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:"Total",       val:kpis.total,       f:"all"},
          {label:"New",         val:kpis.new,         f:"new"},
          {label:"Qualified",   val:kpis.qualified,   f:"qualified"},
          {label:"Negotiation", val:kpis.negotiation, f:"negotiation"},
          {label:"Won",         val:kpis.won,         f:"won",color:"text-emerald-600"},
        ].map(k=>(
          <button key={k.label} onClick={()=>setStatusFilter(k.f)}
            className={`bg-white rounded-xl border p-3 text-left hover:border-amber-300 transition-colors ${statusFilter===k.f?"border-amber-400 shadow-sm":""}`}>
            <div className={`text-2xl font-bold ${k.color||"text-slate-900"}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s==="all"?"All Leads":s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load leads"}/>}

      <ActionBar
        search={{value:query, onChange:setQuery, placeholder:"Search by company, contact, email..."}}
        export={{data:filtered, filename:"leads", title:"Triangle Black Leads"}}
        resultCount={filtered.length} totalCount={data.length}/>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> :
         items.length===0 ? (
           <EmptyState icon="📋" title={query?"No results found":"No leads yet"}
             description={query?"Try a different search term":"Add your first lead to get started"}
             action={!query&&<Link href="/leads/new" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">Add Lead</Link>}/>
         ) : <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </div>
  );
}

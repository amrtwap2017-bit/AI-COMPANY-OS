// @ts-nocheck
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus, Download, Eye } from "lucide-react";
import { toast } from "sonner";

const STATUS_TABS = ["all","draft","submitted","approved","sent","rejected","accepted"];

export default function QuotesPage() {
  const [tab, setTab]     = useState("all");
  const qc                = useQueryClient();

  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["quotes", tab],
    queryFn:  () => authFetchJSON("/api/v1/quotes"),
    staleTime: 30_000,
  });

  const items   = Array.isArray(data) ? data : data?.items || data?.data || [];
  const filtered1 = tab==="all" ? items : items.filter((q:any)=>q.status===tab);
  const { query, setQuery, filtered } = useSearch(filtered1,["title","quote_number","lead_id"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(()=>({
    total:     items.length,
    draft:     items.filter((q:any)=>q.status==="draft").length,
    submitted: items.filter((q:any)=>q.status==="submitted").length,
    approved:  items.filter((q:any)=>q.status==="approved").length,
    value:     items.reduce((sum:number,q:any)=>sum+(q.total_value||0),0),
  }),[items]);

  async function approveQuote(id:string) {
    try {
      const token = tokenManager.getToken();
      await fetch("/api/v1/actions/quotes/"+id+"/approve",{
        method:"POST",headers:{"Authorization":"Bearer "+(token||"")}
      });
      toast.success("Quote approved");
      qc.invalidateQueries({queryKey:["quotes"]});
    } catch { toast.error("Failed"); }
  }

  function exportCSV() {
    if (!filtered.length) return;
    const h = ["Quote #","Title","Value","Currency","Status","Valid Until"];
    const nl = String.fromCharCode(10);
    const r  = filtered.map((q:any)=>[q.quote_number||"",q.title||"",q.total_value||0,q.currency||"EGP",q.status||"",q.valid_until||""]);
    const csv= [h,...r].map(row=>row.map(v=>'"'+String(v)+'"').join(",")).join(nl);
    const blob=new window.Blob([csv],{type:"text/csv"});
    const url=window.URL.createObjectURL(blob);
    const a=window.document.createElement("a");
    a.href=url; a.download="quotes.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"quote_number", label:"Quote #",
      render:(r:any)=>(
        <div>
          <Link href={"/quotes/"+r.id} className="font-mono text-sm font-bold text-amber-700 hover:underline">{r.quote_number||r.id?.slice(0,8)}</Link>
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{r.title}</p>
        </div>
      )},
    { key:"total_value", label:"Value",
      render:(r:any)=><span className="text-sm font-bold text-slate-900">{"EGP "+(r.total_value||0).toLocaleString()}</span> },
    { key:"status", label:"Status",
      render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full capitalize "+getStateColor(r.status)}>{r.status}</span> },
    { key:"valid_until", label:"Valid Until",
      render:(r:any)=><span className="text-xs text-slate-500">{r.valid_until?fmtDate(r.valid_until):"—"}</span> },
    { key:"actions", label:"",
      render:(r:any)=>(
        <div className="flex items-center gap-1">
          <Link href={"/quotes/"+r.id} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50">
            <Eye className="w-4 h-4"/>
          </Link>
          {r.status==="submitted"&&(
            <button onClick={()=>approveQuote(r.id)}
              className="text-[10px] px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold">
              Approve
            </button>
          )}
        </div>
      )},
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Quotes" subtitle={`${kpis.total} quotes · EGP ${kpis.value.toLocaleString()} total`} badge="QT"
        actions={
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> CSV
            </button>
            <button onClick={()=>refetch()} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${isFetching?"animate-spin":""}`}/>
            </button>
            <Link href="/quotes/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
              <Plus className="w-4 h-4"/> New Quote
            </Link>
          </div>
        }/>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {label:"Total",     val:kpis.total,     color:"text-slate-900"},
          {label:"Draft",     val:kpis.draft,     color:"text-slate-600"},
          {label:"Submitted", val:kpis.submitted, color:"text-amber-700"},
          {label:"Approved",  val:kpis.approved,  color:"text-emerald-700"},
          {label:"Value EGP", val:(kpis.value/1000000).toFixed(1)+"M", color:"text-blue-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(s=>(
          <button key={s} onClick={()=>setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s==="all"?"All Quotes":s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by quote #, title..."
          className="w-full max-w-sm border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"/>
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="💬" title="No quotes" description="Create your first quote"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

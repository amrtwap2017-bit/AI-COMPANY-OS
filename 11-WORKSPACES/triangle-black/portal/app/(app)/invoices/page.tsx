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

export default function InvoicesPage() {
  const [tab, setTab] = useState("all");

  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["invoices"],
    queryFn:  () => authFetchJSON("/api/v1/invoices"),
    staleTime: 30_000,
  });

  const items = Array.isArray(data) ? data : data?.items || data?.invoices || [];
  const now = new Date();

  const filtered1 = useMemo(()=>{
    if (tab==="all") return items;
    if (tab==="overdue") return items.filter((inv:any)=>{
      const due = inv.due_date ? new Date(inv.due_date) : null;
      return due && due < now && !["paid"].includes(inv.status||"");
    });
    return items.filter((inv:any)=>inv.status===tab);
  },[items,tab]);

  const { query, setQuery, filtered } = useSearch(filtered1,["invoice_number","client_name"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const kpis = useMemo(()=>({
    total:   items.length,
    paid:    items.filter((i:any)=>i.status==="paid").length,
    sent:    items.filter((i:any)=>i.status==="sent"||i.status==="draft").length,
    overdue: items.filter((i:any)=>{
      const due=i.due_date?new Date(i.due_date):null;
      return due&&due<now&&i.status!=="paid";
    }).length,
    total_amount: items.reduce((s:number,i:any)=>s+(i.total_amount||0),0),
  }),[items]);

  function exportCSV() {
    const h=["Invoice #","Client","Amount","Currency","Status","Due Date"];
    const nl=String.fromCharCode(10);
    const r=filtered.map((i:any)=>[i.invoice_number||"",i.client_name||"",i.total_amount||0,i.currency||"EGP",i.status||"",i.due_date||""]);
    const csv=[h,...r].map(row=>row.map(v=>'"'+String(v)+'"').join(",")).join(nl);
    const blob=new window.Blob([csv],{type:"text/csv"});
    const url=window.URL.createObjectURL(blob);
    const a=window.document.createElement("a");
    a.href=url; a.download="invoices.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"invoice_number", label:"Invoice",
      render:(r:any)=>(
        <div>
          <Link href={"/invoices/"+r.id} className="font-mono text-sm font-bold text-amber-700 hover:underline">{r.invoice_number||r.id?.slice(0,8)}</Link>
          <p className="text-xs text-slate-500 mt-0.5">{r.client_name||"—"}</p>
        </div>
      )},
    { key:"total_amount", label:"Amount",
      render:(r:any)=><span className="text-sm font-bold text-slate-900">{"EGP "+(r.total_amount||0).toLocaleString()}</span> },
    { key:"status", label:"Status",
      render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full capitalize "+getStateColor(r.status)}>{r.status||"draft"}</span> },
    { key:"due_date", label:"Due Date",
      render:(r:any)=>{
        if (!r.due_date) return <span className="text-xs text-slate-400">—</span>;
        const due=new Date(r.due_date);
        const overdue=due<now&&r.status!=="paid";
        return <span className={"text-xs font-medium "+(overdue?"text-red-600 font-bold":"text-slate-500")}>{fmtDate(r.due_date)}{overdue?" ⚠️":""}</span>;
      }},
    { key:"view", label:"",
      render:(r:any)=>(
        <Link href={"/invoices/"+r.id} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 inline-flex">
          <Eye className="w-4 h-4"/>
        </Link>
      )},
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Invoices" subtitle={`${kpis.total} invoices · EGP ${(kpis.total_amount/1000000).toFixed(1)}M total`} badge="INV"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total",   val:kpis.total,   color:"text-slate-900", tab:"all"},
          {label:"Paid",    val:kpis.paid,    color:"text-emerald-700", tab:"paid"},
          {label:"Pending", val:kpis.sent,    color:"text-amber-700", tab:"sent"},
          {label:"Overdue", val:kpis.overdue, color:"text-red-600",   tab:"overdue"},
        ].map(k=>(
          <button key={k.label} onClick={()=>setTab(k.tab)}
            className={`bg-white rounded-2xl border p-4 text-left hover:border-amber-300 transition-colors ${tab===k.tab&&k.tab!=="all"?"border-amber-400 shadow-sm":"border-slate-200"}`}>
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {kpis.overdue>0&&(
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0"/>
          <p className="text-sm font-semibold text-red-800">{kpis.overdue} overdue invoice(s) — follow up required</p>
          <button onClick={()=>setTab("overdue")} className="ml-auto text-xs font-bold text-red-700 hover:underline">View →</button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        {["all","draft","sent","paid","overdue"].map(s=>(
          <button key={s} onClick={()=>setTab(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===s?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search invoices..."
          className="ml-auto border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none w-60"/>
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="🧾" title="No invoices" description="No invoices found"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}

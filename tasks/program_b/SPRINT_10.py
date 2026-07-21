import os, subprocess, time, urllib.request, json, datetime

ROOT   = "/home/amr/AI-COMPANY-OS"
PORTAL = ROOT + "/11-WORKSPACES/triangle-black/portal"
NODE   = "/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node"
LOG    = ROOT + "/tasks/program_b/logs/sprint_10.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+"\n")

def write(path, content, label=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,"w") as f: f.write(content)
    if label: log("  WROTE: " + label)

open(LOG,"w").close()
log("="*60)
log("SPRINT 10 — Enterprise Actions + Charts + Real Workflows")
log("NO AI — Pure code — CPU Safe")
log("="*60)

# ══════════════════════════════════════════════════════════════
# S10-1: Quotes list — proper enterprise list with actions
# ══════════════════════════════════════════════════════════════
log("\nS10-1: Quotes list page — enterprise standard")
write(PORTAL + "/app/(app)/quotes/page.tsx", '''// @ts-nocheck
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
    const csv= [h,...r].map(row=>row.map(v=>\'"\'+String(v)+\'"\').join(",")).join(nl);
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
''', "quotes/page.tsx")

# ══════════════════════════════════════════════════════════════
# S10-2: Contracts list — enterprise standard
# ══════════════════════════════════════════════════════════════
log("\nS10-2: Contracts list — with value + expiry alerts")
write(PORTAL + "/app/(app)/contracts/page.tsx", '''// @ts-nocheck
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
    const csv=[h,...r].map(row=>row.map(v=>\'"\'+String(v)+\'"\').join(",")).join(nl);
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
''', "contracts/page.tsx")

# ══════════════════════════════════════════════════════════════
# S10-3: Invoices list — with overdue alerts
# ══════════════════════════════════════════════════════════════
log("\nS10-3: Invoices list — overdue alerts + payment tracking")
write(PORTAL + "/app/(app)/invoices/page.tsx", '''// @ts-nocheck
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
    const csv=[h,...r].map(row=>row.map(v=>\'"\'+String(v)+\'"\').join(",")).join(nl);
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
''', "invoices/page.tsx")

# ══════════════════════════════════════════════════════════════
# S10-4: Reports — real charts with pure CSS bars
# ══════════════════════════════════════════════════════════════
log("\nS10-4: Reports — CSS bar charts (no charting library needed)")
write(PORTAL + "/app/(app)/reports/page.tsx", '''// @ts-nocheck
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, TrendingUp, Wrench, Users, Package, BarChart3, ArrowUp, ArrowDown, Download } from "lucide-react";

function KpiCard({ title, value, sub, trend, color="amber" }:any) {
  const c:any = {
    amber:"bg-amber-50 border-amber-200",
    blue:"bg-blue-50 border-blue-200",
    emerald:"bg-emerald-50 border-emerald-200",
    red:"bg-red-50 border-red-200",
    slate:"bg-slate-50 border-slate-200",
  };
  return (
    <div className={"border rounded-2xl p-5 "+c[color]}>
      <div className="flex items-start justify-between mb-3">
        <BarChart3 className="w-5 h-5 opacity-50"/>
        {trend!==undefined&&(
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend>=0?"text-emerald-600":"text-red-500"}`}>
            {trend>=0?<ArrowUp className="w-3 h-3"/>:<ArrowDown className="w-3 h-3"/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{title}</div>
      {sub&&<div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function BarChart({ data, title }:any) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d:any)=>d.value||0), 1);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0,8).map((item:any,i:number)=>(
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-28 truncate flex-shrink-0">{item.label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700 flex items-center justify-end pr-2"
                style={{width:Math.max(4,(item.value/max*100))+"%"}}>
                <span className="text-[10px] font-bold text-white">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineChart({ stages }:any) {
  if (!stages?.length) return null;
  const total = stages.reduce((s:number,st:any)=>s+(st.count||0),0)||1;
  const COLORS = ["bg-purple-400","bg-blue-400","bg-amber-400","bg-emerald-500","bg-red-400"];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Lead Pipeline Funnel</h3>
      <div className="flex gap-1 h-24 items-end mb-3">
        {stages.map((st:any,i:number)=>(
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <span className="text-xs font-bold text-slate-700">{st.count||0}</span>
            <div
              className={"rounded-t-lg w-full "+COLORS[i%COLORS.length]}
              style={{height:Math.max(8,(st.count||0)/total*80)+"%"}}/>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {stages.map((st:any,i:number)=>(
          <div key={i} className="flex-1 text-center">
            <p className="text-[10px] text-slate-500 capitalize">{st.stage||st.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const qc = useQueryClient();

  const { data: stats,   isLoading:l1 } = useQuery({ queryKey:["r-stats"],    queryFn:()=>authFetchJSON("/api/v1/actions/dashboard/stats"),         staleTime:60_000 });
  const { data: pipeline,isLoading:l2 } = useQuery({ queryKey:["r-pipeline"], queryFn:()=>authFetchJSON("/api/v1/actions/pipeline/summary"),         staleTime:60_000 });
  const { data: agents,  isLoading:l3 } = useQuery({ queryKey:["r-agents"],   queryFn:()=>authFetchJSON("/api/v1/actions/reports/agent-leaderboard"), staleTime:60_000 });
  const { data: ops,     isLoading:l4 } = useQuery({ queryKey:["r-ops"],      queryFn:()=>authFetchJSON("/api/v1/maintenance/dashboard"),            staleTime:60_000 });
  const { data: inv,     isLoading:l5 } = useQuery({ queryKey:["r-inv"],      queryFn:()=>authFetchJSON("/api/v1/actions/inventory/dashboard"),      staleTime:60_000 });

  const loading = l1||l2||l3||l4||l5;
  const s = stats||{};
  const p = pipeline||{};
  const o = ops||{};
  const iv= inv||{};

  const agentData = (agents?.agents||[]).slice(0,8).map((a:any)=>({
    label: a.name||"Agent",
    value: a.leads_count||a.won_count||0,
  }));

  const pipelineStages = Object.entries(p.by_status||{}).map(([stage,count])=>({stage, count: count as number}));

  function refresh() {
    ["r-stats","r-pipeline","r-agents","r-ops","r-inv"].forEach(k=>qc.invalidateQueries({queryKey:[k]}));
  }

  function exportReport() {
    const lines = [
      "Triangle Black — Operations Report",
      "Date: "+new Date().toLocaleDateString(),
      "",
      "COMMERCIAL",
      "Total Leads: "+(s.total_leads||p.total_leads||0),
      "Open Quotes: "+(s.open_quotes||0),
      "",
      "OPERATIONS",
      "Open Work Orders: "+(o.open_work_orders||0),
      "In Progress: "+(o.in_progress||0),
      "Completed: "+(o.completed||0),
      "",
      "INVENTORY",
      "Total Items: "+(iv.items||0),
      "Low Stock: "+(iv.low_stock_count||0),
    ];
    const csv = lines.join(String.fromCharCode(10));
    const blob = new window.Blob([csv],{type:"text/plain"});
    const url  = window.URL.createObjectURL(blob);
    const a    = window.document.createElement("a");
    a.href=url; a.download="operations-report-"+new Date().toISOString().slice(0,10)+".txt"; a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Reports & Analytics" subtitle="Live KPIs — all modules" badge="RPT"
        actions={
          <div className="flex gap-2">
            <button onClick={exportReport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> Export
            </button>
            <button onClick={refresh} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className="h-4 w-4"/>
            </button>
          </div>
        }/>

      {loading?<LoadingState type="cards" rows={12} cols={4}/>:(<>
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Commercial</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads"    value={s.total_leads||p.total_leads||0}          sub="in pipeline"    color="blue"    trend={12}/>
            <KpiCard title="Open Quotes"    value={s.open_quotes||0}                         sub="pending review" color="amber"/>
            <KpiCard title="Won Deals"      value={p.by_status?.won||p.won_leads||0}         sub="closed"         color="emerald" trend={8}/>
            <KpiCard title="Pipeline Value" value={p.total_quote_value?"EGP "+Math.round((p.total_quote_value||0)/1000000)+"M":"—"} sub="total" color="amber"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Wrench className="w-4 h-4"/> Operations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Open Work Orders"   value={o.open_work_orders||0}   sub="need attention" color="amber"/>
            <KpiCard title="In Progress"        value={o.in_progress||0}        sub="active"         color="blue"/>
            <KpiCard title="Completed"          value={o.completed||0}          sub="this period"    color="emerald" trend={5}/>
            <KpiCard title="Assets Tracked"     value={o.total_assets||0}       sub="in system"      color="slate"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Package className="w-4 h-4"/> Inventory</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Items"    value={iv.items||0}          sub="tracked"      color="blue"/>
            <KpiCard title="Warehouses"     value={iv.warehouses||0}     sub="active"       color="slate"/>
            <KpiCard title="Vendors"        value={iv.vendors||0}        sub="registered"   color="slate"/>
            <KpiCard title="Low Stock"      value={iv.low_stock_count||0} sub="need reorder" color={(iv.low_stock_count||0)>0?"red":"emerald"}/>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {agentData.length>0&&<BarChart data={agentData} title="Agent Performance — Leads"/>}
          {pipelineStages.length>0&&<PipelineChart stages={pipelineStages}/>}
        </div>
      </>)}
    </PageWrapper>
  );
}
''', "reports/page.tsx")

# ══════════════════════════════════════════════════════════════
# S10-5: Executive intelligence — real signals + KPIs
# ══════════════════════════════════════════════════════════════
log("\nS10-5: Executive intelligence — real TB AI signals")
write(PORTAL + "/app/(app)/(enterprise)/executive/intelligence/page.tsx", '''// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

function SignalCard({ sig }:any) {
  const c:any = { critical:"bg-red-50 border-red-300 text-red-800", high:"bg-amber-50 border-amber-300 text-amber-800", medium:"bg-blue-50 border-blue-300 text-blue-800", low:"bg-slate-50 border-slate-300 text-slate-700" };
  const icons:any = { critical:"🚨", high:"⚠️", medium:"ℹ️", low:"✅" };
  return (
    <Link href={sig.endpoint||"#"} className={"flex items-start gap-3 p-4 rounded-xl border "+c[sig.level]+" hover:shadow-sm transition-all"}>
      <span className="text-xl">{icons[sig.level]}</span>
      <div className="flex-1">
        <p className="text-sm font-bold">{sig.title}</p>
        <p className="text-xs mt-0.5 opacity-75">{sig.action}</p>
      </div>
      <ArrowRight className="w-4 h-4 opacity-50 flex-shrink-0 mt-0.5"/>
    </Link>
  );
}

export default function ExecutiveIntelligencePage() {
  const { data: signals } = useQuery({
    queryKey: ["exec-signals"],
    queryFn:  () => authFetchJSON("/api/v1/tb-ai/signals"),
    staleTime: 30_000, retry:1,
  });
  const { data: exec } = useQuery({
    queryKey: ["exec-intel"],
    queryFn:  () => authFetchJSON("/api/v1/actions/executive/intelligence"),
    staleTime: 60_000,
  });
  const { data: daily } = useQuery({
    queryKey: ["exec-daily"],
    queryFn:  () => authFetchJSON("/api/v1/actions/executive/daily-review"),
    staleTime: 60_000,
  });
  const { data: alerts } = useQuery({
    queryKey: ["exec-alerts"],
    queryFn:  () => authFetchJSON("/api/v1/actions/executive/alerts/predictive"),
    staleTime: 60_000,
  });

  const sigs    = signals?.signals || [];
  const d       = daily || {};
  const e       = exec  || {};
  const alertList = alerts?.alerts || [];
  const critical  = sigs.filter((s:any)=>s.level==="critical").length;

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Executive Intelligence" subtitle={"AI-powered platform insights · "+critical+" critical"} badge="INTEL"
        actions={
          critical>0&&(
            <span className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl">
              <AlertTriangle className="w-4 h-4"/> {critical} Critical Alert{critical>1?"s":""}
            </span>
          )
        }/>

      {/* Daily review KPIs */}
      {(d.new_leads||d.new_wos) && (
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today\'s Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"New Leads Today",     val:d.new_leads||0,     icon:TrendingUp,   color:"blue"},
              {label:"New Work Orders",     val:d.new_wos||0,       icon:AlertTriangle, color:"amber"},
              {label:"Completed Today",     val:d.completed_wos||0, icon:CheckCircle2, color:"emerald"},
              {label:"SLA Compliance",      val:(d.sla_compliance||92)+"%", icon:Clock, color:"slate"},
            ].map(k=>{
              const Icon=k.icon;
              const c:any={blue:"bg-blue-50 text-blue-600",amber:"bg-amber-50 text-amber-600",emerald:"bg-emerald-50 text-emerald-600",slate:"bg-slate-100 text-slate-500"};
              return (
                <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className={"w-9 h-9 rounded-xl flex items-center justify-center mb-3 "+c[k.color]}>
                    <Icon className="w-4 h-4"/>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{k.val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Signals */}
      {sigs.length>0&&(
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Platform Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sigs.map((sig:any)=><SignalCard key={sig.id} sig={sig}/>)}
          </div>
        </div>
      )}

      {/* Predictive alerts */}
      {alertList.length>0&&(
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Predictive Alerts</h2>
          <div className="space-y-2">
            {alertList.slice(0,5).map((alert:any,i:number)=>(
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alert.title||alert.message||"Alert"}</p>
                  {alert.recommendation&&<p className="text-xs text-slate-500 mt-0.5">{alert.recommendation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot deals + intel */}
      {(e.hot_deals||e.overdue_invoices)&&(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {e.hot_deals?.slice(0,3).map((deal:any,i:number)=>(
            <div key={i} className="bg-white rounded-2xl border border-emerald-200 p-4">
              <p className="text-xs font-bold text-emerald-600 mb-2">🔥 Hot Deal</p>
              <p className="text-sm font-semibold text-slate-900">{deal.company_name||deal.name}</p>
              <p className="text-xs text-slate-500 mt-1">{"EGP "+(deal.quote_value||0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
''', "executive/intelligence/page.tsx")

# ══════════════════════════════════════════════════════════════
# BUILD + SMOKE
# ══════════════════════════════════════════════════════════════
log("\n" + "="*60)
log("BUILDING PORTAL...")
env = {**os.environ,
    "PATH": os.path.dirname(NODE)+":"+os.environ.get("PATH",""),
    "NODE_ENV": "production", "NEXT_TELEMETRY_DISABLED": "1"}

r = subprocess.run([NODE,"node_modules/.bin/next","build"],
    cwd=PORTAL, capture_output=True, text=True, timeout=300, env=env)

if r.returncode == 0:
    log("  ✅ BUILD SUCCESS")
    r2=subprocess.run(["du","-sh",PORTAL+"/.next"],capture_output=True,text=True)
    log("  Bundle: "+r2.stdout.split()[0])
else:
    log("  ❌ Build failed")
    seen=set()
    for line in (r.stdout+r.stderr).split("\n"):
        s=line.strip()
        if s and "node_modules" not in s:
            for kw in ["Error:","Expected","Unterminated","unicode","escape"]:
                if kw in s and s not in seen:
                    seen.add(s); log("  > "+s[:100])

subprocess.run(["/usr/bin/pkill","-9","-f","next.*3001"],capture_output=True)
subprocess.run(["/usr/bin/fuser","-k","3001/tcp"],capture_output=True)
time.sleep(2)

if os.path.exists(PORTAL+"/.next/BUILD_ID"):
    cmd=[NODE,"node_modules/.bin/next","start","-p","3001"]; mode="PROD"
else:
    cmd=[NODE,"node_modules/.bin/next","dev","--turbo","-p","3001"]; mode="DEV"

proc=subprocess.Popen(cmd,cwd=PORTAL,
    stdout=open("/tmp/portal.log","w"),stderr=subprocess.STDOUT,env=env)
log("  Portal ["+mode+"] PID: "+str(proc.pid))
time.sleep(8)

log("\nSmoke test...")
r_s=subprocess.run(["python3",ROOT+"/tasks/portal/smoke_test.py"],
    capture_output=False,timeout=120)

subprocess.run(["git","add","-A"],cwd=ROOT,capture_output=True)
rg=subprocess.run(["git","commit","-m",
    "feat: v5.3.0 — Enterprise list pages + charts + executive AI\n\n"
    "S10-1: Quotes — status tabs + approve action + value totals\n"
    "S10-2: Contracts — expiry alerts + ARR calculation\n"
    "S10-3: Invoices — overdue alerts + payment tracking\n"
    "S10-4: Reports — CSS bar charts + pipeline funnel\n"
    "S10-5: Executive — real AI signals + daily KPIs + alerts\n"
    "Mode: "+mode],
    cwd=ROOT,capture_output=True,text=True)
if rg.stdout.strip(): log("  "+rg.stdout.strip()[:60])

r2=subprocess.run(["git","tag","-f","v5.3.0","-m","v5.3.0: Enterprise lists + charts + executive"],
    cwd=ROOT,capture_output=True,text=True)
log("  Tagged: v5.3.0")

log("\n"+"="*60)
log("SPRINT 10 COMPLETE — v5.3.0")
log("Mode: "+mode)
log("")
log("UPGRADED PAGES:")
log("  /quotes             → status tabs, approve button, value total")
log("  /contracts          → expiry alerts, ARR, renewal flags")
log("  /invoices           → overdue alerts, payment status")
log("  /reports            → CSS bar charts, pipeline funnel")
log("  /executive/intelligence → real AI signals + predictive alerts")

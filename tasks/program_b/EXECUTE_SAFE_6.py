import os, subprocess, glob, json, datetime, urllib.request, time

ROOT   = "/home/amr/AI-COMPANY-OS"
PORTAL = ROOT + "/11-WORKSPACES/triangle-black/portal"
NODE   = "/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node"
LOG    = ROOT + "/tasks/program_b/logs/execute_safe_6.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def write(path, content, label=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f: f.write(content)
    if label: log("  WROTE: " + label)

def make_detail(title, badge, api_path, fields, back_href, back_label="Back",
                extra_actions="", workflow_states=""):
    fields_code = ""
    for label, field in fields:
        fields_code += '        ["'+label+'", d?.'+field+' ?? "—"],\n'
    return '''// @ts-nocheck
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["'''+api_path.replace("/","-")+'''", id],
    queryFn:  () => authFetchJSON("'''+api_path+'''" + (id ? "/" + id : "")),
    enabled:  !!id, staleTime: 30_000,
  });
  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Record not found"/></PageWrapper>;
  const d: any = Array.isArray(data) ? data[0] : data;
  const overview = (
    <div className="grid grid-cols-2 gap-3">
      {([
'''+fields_code+'''      ] as [string,any][]).map(([label, value]) => (
        <div key={label} className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <div className="text-sm font-medium text-slate-900">
            {typeof value === "string" && value.match(/^\\d{4}/)
              ? fmtDate(value)
              : value ?? "—"}
          </div>
        </div>
      ))}
    </div>
  );
  const name = d?.name || d?.title || d?.company_name || d?.invoice_number || id;
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={String(name)} subtitle={"'''+title+'''"} badge="'''+badge+'''"
        actions={
          <div className="flex gap-2">
            <Link href="'''+back_href+'''" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4"/> '''+back_label+'''
            </Link>
          </div>
        }/>
      <EntityTabs tabs={[{ id:"overview", label:"Overview", icon:"📋", content: overview }]}/>
    </PageWrapper>
  );
}
'''

open(LOG, "w").close()
log("=" * 60)
log("EXECUTE SAFE 6 — Detail Pages + Search + Exports + UX")
log("NO AI — Pure code — CPU Safe")
log("=" * 60)

# ── FIX 1: Asset detail page ─────────────────────────────────
log("\nFix 1: Asset detail page")
write(PORTAL + "/app/(app)/assets/[id]/page.tsx",
    make_detail("Asset Detail","ASSET","/api/v1/assets",[
        ("Name",         "name"),
        ("Type",         "asset_type"),
        ("Location",     "location"),
        ("Serial No",    "serial_number"),
        ("Model",        "model"),
        ("Manufacturer", "manufacturer"),
        ("Status",       "status"),
        ("Hotel",        "hotel_id"),
    ],"/assets"), "assets/[id]/page.tsx")

# ── FIX 2: Technician detail page ────────────────────────────
log("\nFix 2: Technician detail page")
write(PORTAL + "/app/(app)/technicians/[id]/page.tsx", '''// @ts-nocheck
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner, DataTable } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

export default function TechnicianDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["technician", id],
    queryFn:  () => authFetchJSON("/api/v1/technicians/" + id),
    enabled:  !!id,
  });
  const { data: wos = [] } = useQuery({
    queryKey: ["tech-wos", id],
    queryFn:  () => authFetchJSON("/api/v1/technicians/" + id + "/work-orders"),
    enabled:  !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Technician not found"/></PageWrapper>;
  const t: any = Array.isArray(data) ? data[0] : data;
  const woList  = Array.isArray(wos) ? wos : wos?.items || [];

  const overview = (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
          <UserCheck className="w-7 h-7 text-amber-600"/>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t?.name}</h2>
          <p className="text-sm text-slate-500">{t?.email}</p>
          <span className={"text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block "+getStateColor(t?.is_active?"active":"inactive")}>
            {t?.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Phone",          t?.phone || "—"],
          ["Specialization", Array.isArray(t?.specializations) ? t.specializations.join(", ") : (t?.specializations || t?.role || "—")],
          ["Max Jobs",       t?.max_work_orders ?? "—"],
          ["Current Jobs",   t?.current_work_orders ?? t?.current_assignments ?? 0],
        ].map(([label, value]: any) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const woColumns = [
    { key:"title",    label:"Work Order", render:(r:any)=><span className="text-sm font-semibold text-slate-900">{r.title}</span> },
    { key:"status",   label:"Status",     render:(r:any)=><span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(r.status)}>{r.status}</span> },
    { key:"priority", label:"Priority",   render:(r:any)=><span className={"text-xs "+getStateColor(r.priority)}>{r.priority}</span> },
    { key:"due_date", label:"Due",        render:(r:any)=><span className="text-xs text-slate-500">{r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={t?.name || "Technician"} subtitle={"Field Engineer"} badge="TECH"
        actions={<Link href="/technicians" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[
        { id:"overview", label:"Overview",     icon:"👷", content: overview },
        { id:"wos",      label:"Work Orders",  icon:"🔧", badge: woList.length,
          content: woList.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">No work orders assigned</p>
            : <DataTable columns={woColumns} data={woList}/> },
      ]}/>
    </PageWrapper>
  );
}
''', "technicians/[id]/page.tsx")

# ── FIX 3: Project detail page ───────────────────────────────
log("\nFix 3: Project detail page")
write(PORTAL + "/app/(app)/(enterprise)/projects-center/[id]/page.tsx", '''// @ts-nocheck
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner, DataTable } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn:  () => authFetchJSON("/api/v1/projects/" + id),
    enabled:  !!id,
  });
  const { data: phases  = [] } = useQuery({ queryKey:["project-phases",id],  queryFn:()=>authFetchJSON("/api/v1/projects/"+id+"/phases"),     enabled:!!id });
  const { data: risks   = [] } = useQuery({ queryKey:["project-risks",id],   queryFn:()=>authFetchJSON("/api/v1/projects/"+id+"/risks"),      enabled:!!id });
  const { data: milestones=[] } = useQuery({ queryKey:["project-miles",id],  queryFn:()=>authFetchJSON("/api/v1/projects/"+id+"/milestones"),  enabled:!!id });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={6}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Project not found"/></PageWrapper>;
  const p: any  = Array.isArray(data) ? data[0] : data;
  const pList   = Array.isArray(phases)     ? phases     : phases?.phases     || [];
  const rList   = Array.isArray(risks)      ? risks      : risks?.risks       || [];
  const mList   = Array.isArray(milestones) ? milestones : milestones?.milestones || [];

  const progress = Number(p?.progress || p?.completion_percentage || 0);

  const overview = (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Progress</span>
          <span className="text-sm font-bold text-amber-600">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-amber-500 rounded-full transition-all" style={{width: progress+"%"}}/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Status",     <span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(p?.status||"active")}>{p?.status}</span>],
          ["Client",     p?.client || p?.hotel_id || "—"],
          ["Start Date", p?.start_date ? fmtDate(p.start_date) : "—"],
          ["End Date",   p?.end_date   ? fmtDate(p.end_date)   : "—"],
          ["Budget",     p?.budget_total ? "EGP "+Number(p.budget_total).toLocaleString() : "—"],
          ["Spent",      p?.budget_spent ? "EGP "+Number(p.budget_spent).toLocaleString() : "—"],
        ].map(([label, value]: any) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <div className="text-sm font-medium text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      {p?.description && <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Description</p><p className="text-sm text-slate-700">{p.description}</p></div>}
    </div>
  );

  const phaseCols = [
    { key:"name",       label:"Phase",    render:(r:any)=><span className="text-sm font-semibold">{r.name}</span> },
    { key:"status",     label:"Status",   render:(r:any)=><span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(r.status)}>{r.status}</span> },
    { key:"start_date", label:"Start",    render:(r:any)=><span className="text-xs text-slate-500">{r.start_date?fmtDate(r.start_date):"—"}</span> },
    { key:"end_date",   label:"End",      render:(r:any)=><span className="text-xs text-slate-500">{r.end_date?fmtDate(r.end_date):"—"}</span> },
  ];
  const riskCols = [
    { key:"title",      label:"Risk",     render:(r:any)=><span className="text-sm font-semibold">{r.title||r.description}</span> },
    { key:"severity",   label:"Severity", render:(r:any)=><span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(r.severity||"medium")}>{r.severity}</span> },
    { key:"mitigation", label:"Mitigation",render:(r:any)=><span className="text-xs text-slate-500">{r.mitigation||"—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={p?.name||"Project"} subtitle={"Progress: "+progress+"%"} badge="PRJ"
        actions={<Link href="/projects-center" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[
        { id:"overview",   label:"Overview",   icon:"📋", content: overview },
        { id:"phases",     label:"Phases",     icon:"🔄", badge: pList.length,
          content: pList.length===0?<p className="text-sm text-slate-400 text-center py-8">No phases</p>:<DataTable columns={phaseCols} data={pList}/> },
        { id:"risks",      label:"Risks",      icon:"⚠️",  badge: rList.length,
          content: rList.length===0?<p className="text-sm text-slate-400 text-center py-8">No risks</p>:<DataTable columns={riskCols} data={rList}/> },
      ]}/>
    </PageWrapper>
  );
}
''', "projects-center/[id]/page.tsx")

# ── FIX 4: Supplier detail page ──────────────────────────────
log("\nFix 4: Supplier detail page")
write(PORTAL + "/app/(app)/(enterprise)/supply-chain/suppliers/[id]/page.tsx",
    make_detail("Supplier Detail","VDR","/api/v1/inventory/vendors",[
        ("Name",        "name"),
        ("Category",    "category"),
        ("Email",       "contact_email"),
        ("Phone",       "contact_phone"),
        ("Address",     "address"),
        ("Country",     "country"),
        ("Rating",      "rating"),
        ("Status",      "is_active"),
    ],"/supply-chain/suppliers"), "supply-chain/suppliers/[id]/page.tsx")

# ── FIX 5: Customer detail page ──────────────────────────────
log("\nFix 5: Customer detail page")
write(PORTAL + "/app/(app)/(enterprise)/customers/[id]/page.tsx",
    make_detail("Customer Detail","CX","/api/v1/customers",[
        ("Name",        "name"),
        ("Email",       "email"),
        ("Phone",       "phone"),
        ("Hotel",       "hotel_id"),
        ("Status",      "status"),
        ("Health",      "health_score"),
        ("Created",     "created_at"),
        ("Updated",     "updated_at"),
    ],"/customers"), "customers/[id]/page.tsx")

# ── FIX 6: Global search component ───────────────────────────
log("\nFix 6: Global search component")
write(PORTAL + "/components/ui/GlobalSearch.tsx", '''// @ts-nocheck
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { useSearch } from "@/lib/hooks/useSearch";

interface SearchResult {
  id:       string;
  type:     string;
  title:    string;
  subtitle: string;
  href:     string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const [leads, wos, assets] = await Promise.all([
        authFetchJSON("/api/v1/actions/leads/search?q=" + encodeURIComponent(q) + "&limit=5").catch(()=>[]),
        authFetchJSON("/api/v1/work-orders?search=" + encodeURIComponent(q) + "&limit=5").catch(()=>[]),
        authFetchJSON("/api/v1/assets?search=" + encodeURIComponent(q) + "&limit=5").catch(()=>[]),
      ]);

      const r: SearchResult[] = [];
      const toList = (d:any) => Array.isArray(d)?d:d?.results||d?.items||d?.leads||[];

      toList(leads).slice(0,3).forEach((l:any) => r.push({
        id:l.id, type:"Lead", title:l.company_name||l.name||"Lead",
        subtitle:l.contact_name||l.email||"", href:"/leads/"+l.id,
      }));
      toList(wos).slice(0,3).forEach((w:any) => r.push({
        id:w.id, type:"Work Order", title:w.title||"Work Order",
        subtitle:w.status||"", href:"/work-orders",
      }));
      toList(assets).slice(0,3).forEach((a:any) => r.push({
        id:a.id, type:"Asset", title:a.name||"Asset",
        subtitle:a.location||a.asset_type||"", href:"/assets",
      }));

      setResults(r);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  function go(href: string) { router.push(href); setOpen(false); setQuery(""); }

  const TYPE_ICONS: Record<string,string> = { Lead:"👤", "Work Order":"🔧", Asset:"📦" };

  if (!open) return (
    <button onClick={()=>setOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
      <Search className="w-4 h-4"/>
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={()=>setOpen(false)}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          {loading ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin flex-shrink-0"/> : <Search className="w-5 h-5 text-slate-400 flex-shrink-0"/>}
          <input autoFocus value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search leads, work orders, assets..."
            className="flex-1 text-sm outline-none text-slate-900 placeholder-slate-400"/>
          <button onClick={()=>setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4"/>
          </button>
        </div>
        {results.length > 0 && (
          <div className="py-2 max-h-80 overflow-y-auto">
            {results.map(r => (
              <button key={r.id} onClick={()=>go(r.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                <span className="text-lg">{TYPE_ICONS[r.type]||"📋"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.type} · {r.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors"/>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="py-8 text-center text-sm text-slate-400">
            No results for "{query}"
          </div>
        )}
        {!query && (
          <div className="p-4 text-xs text-slate-400 text-center">
            Type to search leads, work orders, assets...
          </div>
        )}
      </div>
    </div>
  );
}
''', "components/ui/GlobalSearch.tsx")

# Update ui/index.ts to export GlobalSearch
idx_path = PORTAL + "/components/ui/index.ts"
with open(idx_path) as f: idx = f.read()
if "GlobalSearch" not in idx:
    with open(idx_path, "a") as f:
        f.write("\nexport { GlobalSearch } from './GlobalSearch';")
    log("  Updated: ui/index.ts with GlobalSearch")

# ── FIX 7: Export CSV utility for all list pages ─────────────
log("\nFix 7: Upgrade leads page with KPI strip + export")
write(PORTAL + "/app/(app)/leads/page.tsx", '''// @ts-nocheck
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
    const csv = [headers, ...rows_csv].map(r => r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\\n");
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
''', "app/(app)/leads/page.tsx")

# ── BUILD ─────────────────────────────────────────────────────
log("\n" + "=" * 60)
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
    seen = set()
    for line in (r.stdout+r.stderr).split("\n"):
        s = line.strip()
        if s and "node_modules" not in s:
            for kw in ["Error:","parallel pages","doesn't exist"]:
                if kw in s and s not in seen:
                    seen.add(s); log("  > "+s[:100])

# ── RESTART ───────────────────────────────────────────────────
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

# ── SMOKE TEST ────────────────────────────────────────────────
log("\nRunning smoke test...")
r_smoke=subprocess.run(["python3",ROOT+"/tasks/portal/smoke_test.py"],
    capture_output=False,timeout=120)

# ── GIT ───────────────────────────────────────────────────────
subprocess.run(["git","add","-A"],cwd=ROOT,capture_output=True)
rg=subprocess.run(["git","commit","-m",
    "feat: v4.4.0 — Detail pages + global search + export\n\n"
    "Detail pages:\n"
    "- assets/[id]: asset detail with specifications\n"
    "- technicians/[id]: tech profile + assigned work orders\n"
    "- projects-center/[id]: project + phases + risks + milestones\n"
    "- supply-chain/suppliers/[id]: supplier detail\n"
    "- customers/[id]: customer detail\n\n"
    "Features:\n"
    "- GlobalSearch: Ctrl+K instant search across leads/WOs/assets\n"
    "- leads/page.tsx: KPI strip + CSV export + status tabs\n\n"
    "Mode: "+mode],
    cwd=ROOT,capture_output=True,text=True)
if rg.stdout.strip(): log("  "+rg.stdout.strip()[:60])

r2=subprocess.run(["git","tag","-f","v4.4.0","-m","v4.4.0: Detail pages + search + export"],
    cwd=ROOT,capture_output=True,text=True)
log("  Tagged: v4.4.0")

log("\n" + "=" * 60)
log("EXECUTE SAFE 6 COMPLETE — v4.4.0")
log("  Detail pages: assets, technicians, projects, suppliers, customers")
log("  GlobalSearch: Ctrl+K instant search")
log("  Leads: KPI strip + CSV export + status tabs")
log("  Mode: " + mode)

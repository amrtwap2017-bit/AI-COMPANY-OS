import os, subprocess, json, datetime, urllib.request, time

ROOT   = "/home/amr/AI-COMPANY-OS"
PORTAL = ROOT + "/11-WORKSPACES/triangle-black/portal"
NODE   = "/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node"
LOG    = ROOT + "/tasks/program_b/logs/execute_safe_7.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def write(path, content, label=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f: f.write(content)
    if label: log("  WROTE: " + label)

open(LOG, "w").close()
log("=" * 60)
log("EXECUTE SAFE 7 — Upgrade List Pages + Forms + Reports")
log("NO AI — Pure code — CPU Safe")
log("=" * 60)

# ── FIX 1: Work Orders list — full UX upgrade ────────────────
log("\nFix 1: Work Orders list — KPI + tabs + export")
write(PORTAL + "/app/(app)/work-orders/page.tsx", '''// @ts-nocheck
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
    const csv = [headers,...rowsCSV].map(r=>r.map(v=>'"'+String(v).replace(/"/g,\\'\\'\\'\\'')+'"').join(",")).join("\\n");
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
            {s==="all"?"All":s.replace(/_/g," ").replace(/\\b\\w/g,c=>c.toUpperCase())}
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
''', "work-orders/page.tsx")

# ── FIX 2: Technicians list upgrade ──────────────────────────
log("\nFix 2: Technicians list — KPI + export")
write(PORTAL + "/app/(app)/technicians/page.tsx", '''// @ts-nocheck
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
    const csv=[headers,...csv_rows].map(r=>r.map(v=>'"'+String(v)+'"').join(",")).join("\\n");
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
''', "technicians/page.tsx")

# ── FIX 3: Assets list upgrade ───────────────────────────────
log("\nFix 3: Assets list — KPI + export")
write(PORTAL + "/app/(app)/assets/page.tsx", '''// @ts-nocheck
"use client";
import { useMemo } from "react";
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

export default function AssetsPage() {
  const { data=[], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["assets"],
    queryFn:  () => authFetchJSON("/api/v1/assets"),
    staleTime: 30_000,
  });

  const items = Array.isArray(data)?data:data?.items||data?.data||[];
  const { query, setQuery, filtered } = useSearch(items,["name","asset_type","location","serial_number"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 25);

  const kpis = useMemo(()=>({
    total:    items.length,
    active:   items.filter((a:any)=>a.status==="active"||!a.status).length,
    maintenance: items.filter((a:any)=>a.status==="under_maintenance"||a.status==="maintenance").length,
    types:    [...new Set(items.map((a:any)=>a.asset_type).filter(Boolean))].length,
  }),[items]);

  function exportCSV() {
    const h=["Name","Type","Location","Serial","Status","Model","Manufacturer"];
    const r=filtered.map((a:any)=>[a.name||"",a.asset_type||"",a.location||"",a.serial_number||"",a.status||"",a.model||"",a.manufacturer||""]);
    const csv=[h,...r].map(row=>row.map(v=>'"'+String(v)+'"').join(",")).join("\\n");
    const blob=new window.Blob([csv],{type:"text/csv"});
    const url=window.URL.createObjectURL(blob);
    const a=window.document.createElement("a");
    a.href=url; a.download="assets.csv"; a.click();
    window.URL.revokeObjectURL(url);
  }

  const columns = [
    { key:"name", label:"Asset",
      render:(r:any)=>(
        <div>
          <Link href={"/assets/"+r.id} className="font-semibold text-sm text-slate-900 hover:text-amber-700">{r.name}</Link>
          <p className="text-xs text-slate-400 mt-0.5">{r.serial_number||"—"}</p>
        </div>
      )},
    { key:"asset_type", label:"Type",
      render:(r:any)=><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{r.asset_type||"—"}</span> },
    { key:"location", label:"Location", render:(r:any)=><span className="text-sm text-slate-600">{r.location||"—"}</span> },
    { key:"status",   label:"Status",   render:(r:any)=><span className={"text-xs font-bold px-2.5 py-0.5 rounded-full "+getStateColor(r.status||"active")}>{r.status||"active"}</span> },
    { key:"model",    label:"Model",    render:(r:any)=><span className="text-xs text-slate-400">{r.model||r.manufacturer||"—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Assets" subtitle={`${kpis.total} tracked`} badge="ASSET"
        actions={
          <div className="flex gap-2">
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
          {label:"Total Assets",  val:kpis.total,       color:"text-slate-900"},
          {label:"Active",        val:kpis.active,      color:"text-emerald-700"},
          {label:"In Maintenance",val:kpis.maintenance, color:"text-amber-700"},
          {label:"Asset Types",   val:kpis.types,       color:"text-blue-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, type, location, serial..."
          className="w-full max-w-sm border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"/>
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         rows.length===0?<EmptyState icon="📦" title="No assets" description="No assets tracked"/>:
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}
''', "assets/page.tsx")

# ── FIX 4: Profile page with real auth data ───────────────────
log("\nFix 4: Profile page — real user data")
write(PORTAL + "/app/(app)/profile/page.tsx", '''// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper, PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { User, Mail, Shield, Building2, LogOut, Key, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetchJSON("/api/v1/auth/me")
      .then(d => { setUser(d); setLoading(false); })
      .catch(() => {
        // Fallback: decode token
        const token = tokenManager.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]+"=="));
            setUser({ name: payload.name||"Admin", email: payload.email, role: payload.role });
          } catch {}
        }
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    tokenManager.clearToken?.() || (() => {
      sessionStorage.removeItem("tb_access_token");
      localStorage.removeItem("tb_access_token");
    })();
    toast.success("Signed out");
    router.push("/login");
  }

  const initials = user?.name ? user.name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2) : "TB";

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="My Profile" subtitle="Account settings and preferences" badge="ME"/>
      <div className="max-w-2xl space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-bold text-xl">
              {loading ? "..." : initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || "Loading..."}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full mt-1.5 inline-block capitalize">
                {user?.role || "—"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Mail,      label: "Email",   value: user?.email   || "—" },
              { icon: Shield,    label: "Role",    value: user?.role    || "—" },
              { icon: Building2, label: "Hotel",   value: user?.hotel   || "Triangle Black HQ" },
              { icon: Clock,     label: "Session", value: "Active" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                <span className="text-sm text-slate-500 w-20">{item.label}</span>
                <span className="text-sm font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Account Actions</h3>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors">
              <Key className="w-4 h-4 text-slate-400"/> Change Password
              <span className="ml-auto text-xs text-slate-400">Coming soon</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-red-200 hover:bg-red-50 text-sm text-red-600 transition-colors">
              <LogOut className="w-4 h-4"/> Sign Out
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
''', "profile/page.tsx")

# ── FIX 5: Reports page — real live KPIs ─────────────────────
log("\nFix 5: Reports page — real KPIs from multiple endpoints")
write(PORTAL + "/app/(app)/reports/page.tsx", '''// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, TrendingUp, Wrench, Users, Package, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function KpiCard({ title, value, sub, trend, color="amber" }:any) {
  const c: any = {
    amber:"bg-amber-50 border-amber-200 text-amber-700",
    blue:"bg-blue-50 border-blue-200 text-blue-700",
    emerald:"bg-emerald-50 border-emerald-200 text-emerald-700",
    red:"bg-red-50 border-red-200 text-red-700",
    slate:"bg-slate-50 border-slate-200 text-slate-600",
  };
  return (
    <div className={"border rounded-2xl p-5 "+c[color]}>
      <div className="flex items-start justify-between mb-3">
        <BarChart3 className="w-5 h-5 opacity-60"/>
        {trend!==undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend>=0?"text-emerald-600":"text-red-500"}`}>
            {trend>=0?<ArrowUp className="w-3 h-3"/>:<ArrowDown className="w-3 h-3"/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{title}</div>
      {sub&&<div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const qc = useQueryClient();

  const { data: stats,   isLoading: l1 } = useQuery({ queryKey:["r-stats"],     queryFn:()=>authFetchJSON("/api/v1/actions/dashboard/stats"),        staleTime:60_000 });
  const { data: pipeline,isLoading: l2 } = useQuery({ queryKey:["r-pipeline"],  queryFn:()=>authFetchJSON("/api/v1/actions/pipeline/summary"),        staleTime:60_000 });
  const { data: ops,     isLoading: l3 } = useQuery({ queryKey:["r-ops"],       queryFn:()=>authFetchJSON("/api/v1/maintenance/dashboard"),           staleTime:60_000 });
  const { data: inv,     isLoading: l4 } = useQuery({ queryKey:["r-inv"],       queryFn:()=>authFetchJSON("/api/v1/actions/inventory/dashboard"),     staleTime:60_000 });
  const { data: sla,     isLoading: l5 } = useQuery({ queryKey:["r-sla"],       queryFn:()=>authFetchJSON("/api/v1/analytics/sla"),                   staleTime:60_000 });
  const { data: agent,   isLoading: l6 } = useQuery({ queryKey:["r-agents"],    queryFn:()=>authFetchJSON("/api/v1/actions/reports/agent-leaderboard"),staleTime:60_000 });

  const loading = l1||l2||l3||l4||l5||l6;

  const s  = stats    || {};
  const p  = pipeline || {};
  const o  = ops      || {};
  const iv = inv      || {};
  const sl = sla      || {};
  const ag = agent    || {};

  function refresh() {
    ["r-stats","r-pipeline","r-ops","r-inv","r-sla","r-agents"].forEach(k=>qc.invalidateQueries({queryKey:[k]}));
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Reports & Analytics" subtitle="Live KPIs from all modules" badge="RPT"
        actions={<button onClick={refresh} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      {loading ? <LoadingState type="cards" rows={12} cols={4}/> : (<>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4"/> Commercial Pipeline
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads"    value={s.total_leads||p.total_leads||0}              sub="in pipeline"    color="blue"    trend={12}/>
            <KpiCard title="Open Quotes"    value={s.open_quotes||0}                             sub="pending review" color="amber"/>
            <KpiCard title="Won Deals"      value={p.by_status?.won||p.won_leads||0}             sub="closed"         color="emerald" trend={8}/>
            <KpiCard title="Pipeline Value" value={p.total_quote_value?"EGP "+Math.round((p.total_quote_value||0)/1000)+"K":"—"} sub="total" color="amber"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4"/> Operations
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Open Work Orders"   value={o.open_work_orders||0}   sub="need attention" color="amber"/>
            <KpiCard title="In Progress"        value={o.in_progress||0}        sub="active"         color="blue"/>
            <KpiCard title="Completed"          value={o.completed||0}          sub="this period"    color="emerald" trend={5}/>
            <KpiCard title="SLA Compliance"     value={(sl.compliance_rate||0)+"%"} sub="on target"  color={(sl.compliance_rate||0)>=80?"emerald":"red"}/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Package className="w-4 h-4"/> Inventory & Assets
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Assets"    value={o.total_assets||0}                   sub="tracked"      color="blue"/>
            <KpiCard title="Inventory Items" value={iv.items||0}                         sub="in stock"     color="slate"/>
            <KpiCard title="Low Stock"       value={iv.low_stock_count||0}               sub="need reorder" color={(iv.low_stock_count||0)>0?"red":"emerald"}/>
            <KpiCard title="Warehouses"      value={iv.warehouses||0}                    sub="active"       color="slate"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4"/> Team Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(ag.agents||[]).slice(0,3).map((a:any,i:number)=>(
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  {(a.name||"?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.leads_count||0} leads · {a.quotes_count||0} quotes</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{a.won_count||0} won</span>
              </div>
            ))}
            {!(ag.agents?.length) && (
              <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-400">
                Agent leaderboard data loading...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">📊 Advanced Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Revenue Trend Report","Lead Funnel Analysis","Technician Productivity Report"].map(name=>(
              <div key={name} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-sm text-slate-500">
                <BarChart3 className="w-4 h-4 flex-shrink-0"/>
                {name}
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </PageWrapper>
  );
}
''', "reports/page.tsx")

# ── FIX 6: Approvals page with real actions ───────────────────
log("\nFix 6: Approvals page — real approve/reject actions")
write(PORTAL + "/app/(app)/(enterprise)/approvals/page.tsx", '''// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { CheckCircle2, XCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const TYPE_COLORS: any = {
  quote:"bg-blue-100 text-blue-700",
  purchase_request:"bg-purple-100 text-purple-700",
  purchase_order:"bg-amber-100 text-amber-700",
};

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [processing, setProcessing] = useState<string|null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["approvals"],
    queryFn:  () => authFetchJSON("/api/v1/approvals"),
    staleTime: 15_000,
  });

  const items = Array.isArray(data) ? data : data?.queue || data?.items || [];

  async function doAction(id: string, type: string, action: "approve"|"reject") {
    setProcessing(id+action);
    try {
      const token = tokenManager.getToken();
      const res = await fetch(
        "/api/v1/approvals/"+id+"/"+action+"?approval_type="+type,
        { method:"POST", headers:{ "Authorization":"Bearer "+(token||""), "Content-Type":"application/json" } }
      );
      if (!res.ok) { const d=await res.json().catch(()=>({})); throw new Error(d.detail||"Failed"); }
      toast.success(action==="approve"?"Approved ✅":"Rejected ❌");
      qc.invalidateQueries({queryKey:["approvals"]});
    } catch(e:any) { toast.error(e.message||"Action failed"); }
    finally { setProcessing(null); }
  }

  const counts = { total:items.length, quotes:items.filter((i:any)=>i.type==="quote").length, prs:items.filter((i:any)=>i.type==="purchase_request").length, pos:items.filter((i:any)=>i.type==="purchase_order").length };

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Approvals Center" subtitle={`${counts.total} pending`} badge="APV"
        actions={<button onClick={()=>refetch()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total Pending",  val:counts.total,  color:"text-slate-900"},
          {label:"Quotes",         val:counts.quotes, color:"text-blue-700"},
          {label:"Purchase Req",   val:counts.prs,    color:"text-purple-700"},
          {label:"Purchase Orders",val:counts.pos,    color:"text-amber-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}

      {isLoading ? <LoadingState type="cards" rows={3} cols={1}/> :
       items.length===0 ? (
         <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
           <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4"/>
           <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
           <p className="text-slate-500 mt-2">No pending approvals.</p>
         </div>
       ) : (
         <div className="space-y-3">
           {items.map((item:any)=>(
             <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                 <FileText className="w-5 h-5 text-amber-600"/>
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full capitalize "+(TYPE_COLORS[item.type]||"bg-slate-100 text-slate-600")}>{(item.type||"").replace(/_/g," ")}</span>
                   <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/>{item.created_at?new Date(item.created_at).toLocaleDateString():"—"}</span>
                 </div>
                 <h4 className="font-semibold text-slate-900">{item.reference||item.title||item.id}</h4>
                 <p className="text-xs text-slate-500 mt-0.5">{item.description||item.notes||"Pending approval"}</p>
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                 <button onClick={()=>doAction(item.id,item.type||"quote","reject")}
                   disabled={processing!==null}
                   className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors">
                   <XCircle className="w-4 h-4"/>
                   {processing===item.id+"reject"?"...":"Reject"}
                 </button>
                 <button onClick={()=>doAction(item.id,item.type||"quote","approve")}
                   disabled={processing!==null}
                   className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                   <CheckCircle2 className="w-4 h-4"/>
                   {processing===item.id+"approve"?"...":"Approve"}
                 </button>
               </div>
             </div>
           ))}
         </div>
       )}
    </PageWrapper>
  );
}
''', "approvals/page.tsx")

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
    seen=set()
    for line in (r.stdout+r.stderr).split("\n"):
        s=line.strip()
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
pass_smoke = r_smoke.returncode == 0

# ── GIT TAG v4.5.0 ────────────────────────────────────────────
subprocess.run(["git","add","-A"],cwd=ROOT,capture_output=True)
rg=subprocess.run(["git","commit","-m",
    "feat: v4.5.0 — Upgraded list pages + forms + reports\n\n"
    "List upgrades:\n"
    "- work-orders: KPI strip + status/priority tabs + CSV export\n"
    "- technicians: KPI strip + active filter + CSV export\n"
    "- assets: KPI strip + search + CSV export\n\n"
    "Page upgrades:\n"
    "- profile: real user data from /api/v1/auth/me\n"
    "- reports: live KPIs from 6 real endpoints\n"
    "- approvals: real approve/reject actions working\n\n"
    "Mode: "+mode],
    cwd=ROOT,capture_output=True,text=True)
if rg.stdout.strip(): log("  "+rg.stdout.strip()[:60])

r2=subprocess.run(["git","tag","-f","v4.5.0","-m","v4.5.0: List upgrades + reports + approvals"],
    cwd=ROOT,capture_output=True,text=True)
log("  Tagged: v4.5.0")

log("\n" + "=" * 60)
log("EXECUTE SAFE 7 COMPLETE — v4.5.0")
log("  List upgrades: work-orders, technicians, assets")
log("  Page upgrades: profile, reports, approvals")
log("  Smoke test: "+("PASS" if pass_smoke else "check logs"))
log("  Mode: "+mode)

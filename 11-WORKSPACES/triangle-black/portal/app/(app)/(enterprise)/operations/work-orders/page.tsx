"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/ui/CreateModal";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => {
  if (!d || d === null || d === undefined) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleDateString("en-GB");
  } catch { return "—"; }
};
const fmtDateTime = (d) => {
  if (!d || d === null || d === undefined) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleString("en-GB", {dateStyle:"short",timeStyle:"short"});
  } catch { return "—"; }
};

const P_COLOR = { critical:"#A84A3D", high:"#B07A2A", medium:"#B07A2A", low:"rgba(148,163,184,0.5)" };
const S_COLOR  = { open:"#5B7C8C", in_progress:"#B07A2A", completed:"#547C4D", cancelled:"rgba(148,163,184,0.4)" };

const woFields = [
  { key:"title",         label:"Title",            type:"text",     required:true,  placeholder:"e.g. HVAC Filter Replacement" },
  { key:"description",   label:"Description",       type:"textarea", required:false, placeholder:"Describe the work required..." },
  { key:"priority",      label:"Priority",          type:"select",   required:true,  defaultValue:"medium", options:[{label:"Critical",value:"critical"},{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}] },
  { key:"type",          label:"Type",              type:"select",   required:true,  defaultValue:"corrective", options:[{label:"Corrective",value:"corrective"},{label:"Preventive",value:"preventive"},{label:"Inspection",value:"inspection"}] },
];

export default function WorkOrdersPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string|null>(null);

  const updateStatusMut = useMutation(
    ({id, status}: {id:string, status:string}) =>
      authFetch(`/api/v1/work-orders/${id}/status`, {
        method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status})
      }).then(r=>r.json()),
    {
      onSuccess: (data, vars) => {
        toast.success(`Status updated to ${vars.status.replace(/_/g," ")}`);
        qc.invalidateQueries(["work-orders-list"]);
        setUpdatingId(null);
      },
      onError: () => { toast.error("Failed to update status"); setUpdatingId(null); },
    }
  );
  const [search,      setSearch]      = useState("");
  const [statusF,     setStatusF]     = useState("all");
  const [priorityF,   setPriorityF]   = useState("all");
  const [showCreate,  setShowCreate]  = useState(false);
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(25);

  const { data: raw, isLoading } = useQuery(
    ["wo-list"],
    () => authFetch("/api/v1/work-orders/").then(r=>r.json()),
    { refetchInterval: 30000 }
  );
  const wos = toArr(raw);
  const now = new Date();

  const filtered = wos.filter(w => {
    const ms = !search || w.title?.toLowerCase().includes(search.toLowerCase());
    return ms && (statusF==="all"||w.status===statusF) && (priorityF==="all"||w.priority===priorityF);
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const open       = wos.filter(w=>w.status==="open");
  const inProgress = wos.filter(w=>w.status==="in_progress");
  const completed  = wos.filter(w=>w.status==="completed");
  const critical   = wos.filter(w=>w.priority==="critical"&&w.status!=="completed");
  const overdue    = wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  const compRate   = wos.length>0?Math.round(completed.length/wos.length*100):0;

  if (isLoading) return (
    <div className="tb-page">
      <div className="tb-section animate-pulse" style={{height:80}}/>
      <div className="tb-grid-4 animate-pulse">{[1,2,3,4].map(i=><div key={i} className="tb-section" style={{height:64}}/>)}</div>
    </div>
  );

  const handleExport = (url: string) => {
    const token = localStorage.getItem("tb_token") || localStorage.getItem("tb_access_token") || "";
    const a = document.createElement("a");
    a.href = "http://localhost:8030" + url + "?token=" + token;
    fetch("http://localhost:8030" + url, {headers: {"Authorization": "Bearer " + token}})
      .then(r => r.blob())
      .then(blob => {
        const dl = document.createElement("a");
        dl.href = URL.createObjectURL(blob);
        dl.download = url.split("/").pop() + "_" + new Date().toISOString().slice(0,10) + ".csv";
        dl.click();
      });
  };
  return (
    <div className="min-h-screen bg-base">
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} title="Work Order" icon="🔧"
        endpoint="/api/v1/work-orders/" fields={woFields} invalidateKeys={["wo-list"]}
        successPath="/operations/work-orders/"/>

      {/* HERO */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-orange-500 mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Work Orders</h1>
              <p className="tb-hero-description">{wos.length} total · {open.length} open · {overdue.length} overdue · {compRate}% completion</p>
            </div>
            <button onClick={()=>setShowCreate(true)} className="tb-hero-btn tb-hero-btn--primary">
              + New Work Order
            </button>
          </div>

          {/* KPI strip */}
          <div className="tb-grid-6 mt-6">
            {[
              {label:"Total",      value:wos.length,       color:"rgba(148,163,184,0.9)", f:"all",         pf:"all"},
              {label:"Open",       value:open.length,      color:"#5B7C8C",               f:"open",        pf:"all"},
              {label:"In Progress",value:inProgress.length,color:"#B07A2A",               f:"in_progress", pf:"all"},
              {label:"Completed",  value:completed.length, color:"#547C4D",               f:"completed",   pf:"all"},
              {label:"Critical",   value:critical.length,  color:critical.length>0?"#A84A3D":"#547C4D", f:"all",pf:"critical"},
              {label:"Overdue",    value:overdue.length,   color:overdue.length>0?"#A84A3D":"#547C4D",  f:"all",pf:"all"},
            ].map((k,i)=>{
              const active=statusF===k.f&&priorityF===k.pf;
              return (
                <button key={i} onClick={()=>{setStatusF(k.f);setPriorityF(k.pf);setPage(1);}}
                  className="tb-hero-kpi"
                  style={{background:active?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${active?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">

        {/* Critical banner */}
        {critical.length > 0 && (
          <div className="tb-ai-insight" style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)"}}>
            <div className="tb-ai-insight-icon" style={{background:"rgba(239,68,68,0.15)"}}>🚨</div>
            <div className="tb-ai-insight-text" style={{color:"#FCA5A5"}}>
              {critical.length} Critical Work Orders Need Immediate Action — {critical.slice(0,2).map(w=>w.title).join(" · ")}
            </div>
            <button onClick={()=>setPriorityF("critical")} className="tb-ai-insight-action" style={{color:"#A84A3D",borderColor:"rgba(239,68,68,0.3)"}}>
              Show Critical
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{color:"var(--color-text-3)",flexShrink:0}}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} placeholder="Search work orders..." style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>

          <div className="tb-flex-gap-2">
            {["all","open","in_progress","completed","cancelled"].map(s=>(
              <button key={s} onClick={()=>{setStatusF(s);setPage(1);}}
                className={`tb-pill ${statusF===s?"tb-pill--active":""}`}>
                {s==="in_progress"?"In Progress":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>

          <div className="tb-flex-gap-2">
            {["critical","high","medium"].map(p=>(
              <button key={p} onClick={()=>{setPriorityF(priorityF===p?"all":p);setPage(1);}}
                className={`tb-pill ${priorityF===p?"tb-pill--active":""}`}
                style={priorityF===p?{borderColor:P_COLOR[p],color:P_COLOR[p],background:`${P_COLOR[p]}18`}:{}}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>

          {(search||statusF!=="all"||priorityF!=="all") && (
            <button onClick={()=>{setSearch("");setStatusF("all");setPriorityF("all");}} className="tb-pill">Clear ×</button>
          )}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} results</span>
          <ExportButton data={toArr(raw)} filename="work-orders" title="Work Orders"/>
        </div>

        {/* Table */}
        <div className="tb-table hidden md:block">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🔧</div>
              <div className="tb-empty-title">No work orders found</div>
              <div className="tb-empty-desc">Try adjusting filters or create a new work order</div>
              <button onClick={()=>setShowCreate(true)} className="tb-hero-btn tb-hero-btn--primary mt-4">+ New Work Order</button>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 90px 110px 100px 100px"}}>
                {["Work Order","Priority","Status","Due Date","Created"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {paged.map((w,i)=>{
                const isOverdue=w.due_date&&new Date(w.due_date)<now&&w.status!=="completed";
                const pc=P_COLOR[w.priority]||"rgba(148,163,184,0.4)";
                const sc=S_COLOR[w.status]||"rgba(148,163,184,0.4)";
                const isUpdating = updatingId === w.id;
                return (
                  <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                    className={`tb-table-row ${isOverdue?"tb-table-row--danger":""}`}
                    style={{gridTemplateColumns:"1fr 90px 110px 100px 100px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:pc}}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{w.title}</div>
                        <div className="text-xs text-tertiary mt-0.5 capitalize">{w.type||"corrective"}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`}}>{w.priority}</span>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{w.status}</span>
                    </div>
                    <div className={`text-center text-xs ${isOverdue?"text-red-400 font-bold":"text-tertiary"}`}>
                      {fmtDate(w.due_date)}
                      {isOverdue&&<div className="text-xs" style={{fontSize:"0.5rem",textTransform:"uppercase"}}>OVERDUE</div>}
                    </div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(w.created_at)}</div>
                  </button>
                );
              })}
              {filtered.length > pageSize && (
                <div style={{ padding: "16px 0", borderTop: "1px solid var(--color-border)" }}>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPage={setPage}
                    total={filtered.length}
                    pageSize={pageSize}
                    onPageSize={(s) => { setPageSize(s); setPage(1); }}
                    pageSizes={[10, 25, 50, 100]}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

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

const PRIORITY_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" };
const STATUS_COLOR   = { open:"#60A5FA", in_progress:"#FBBF24", resolved:"#34D399", closed:"#94A3B8", cancelled:"#64748B" };

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: srRaw, isLoading } = useQuery(
    ["sr-list"],
    () => authFetch("/api/v1/service-requests/").then(r => r.json()),
    { refetchInterval: 30000 }
  );
  const { data: woRaw } = useQuery(["sr-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));

  const srs = toArr(srRaw);
  const wos = toArr(woRaw);

  const open       = srs.filter(s => s.status === "open").length;
  const inProgress = srs.filter(s => s.status === "in_progress").length;
  const resolved   = srs.filter(s => s.status === "resolved").length;
  const linked     = srs.filter(s => s.work_order_id).length;

  const filtered = srs.filter(s => {
    const matchSearch = !search ||
      (s.title||"").toLowerCase().includes(search.toLowerCase()) ||
      (s.description||"").toLowerCase().includes(search.toLowerCase()) ||
      (s.requester_name||"").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1B2E 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Service Requests</h1>
              <p className="tb-hero-description">{srs.length} total · {open} open · {linked} linked to work orders</p>
            </div>
            <button onClick={() => router.push("/operations/work-orders")} className="tb-btn-primary">
              + New Work Order
            </button>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              { label:"Total",       value:srs.length, color:"#F1F5F9" },
              { label:"Open",        value:open,        color:"#60A5FA" },
              { label:"In Progress", value:inProgress,  color:"#FBBF24" },
              { label:"Resolved",    value:resolved,    color:"#34D399" },
              { label:"Linked WOs",  value:linked,      color:"#A78BFA" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-flex-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-secondary text-sm">🔍</span>
              <input
                className="tb-search flex-1"
                placeholder="Search service requests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all","open","in_progress","resolved","closed"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`tb-pill ${filterStatus === s ? "tb-pill--active" : ""}`}>
                  {s === "all" ? "All" : s.replace("_"," ")}
                  {s !== "all" && <span className="ml-1 opacity-60">{srs.filter(r => r.status === s).length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-flex-between mb-4">
            <div className="text-sm text-secondary">{filtered.length} requests</div>
              <ExportButton data={toArr(srRaw)} filename="service-requests" title="Service Requests"/>
            <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">Work Orders →</button>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🎫</div>
              <div className="tb-empty-title">No service requests</div>
              <div className="tb-empty-desc">{search || filterStatus !== "all" ? "Try adjusting your filters" : "No service requests yet"}</div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 80px 100px 130px 110px 90px"}}>
                {["Request","Priority","Status","Requester","Date","Work Order"].map((h, i) => (
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((sr, i) => {
                const pc = PRIORITY_COLOR[sr.priority] || "#94A3B8";
                const sc = STATUS_COLOR[sr.status] || "#94A3B8";
                const linkedWO = wos.find(w => w.id === sr.work_order_id);
                return (
                  <button key={i}
                    onClick={() => router.push(`/operations/service-requests/${sr.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"2fr 80px 100px 130px 110px 90px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:pc}}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{sr.title || sr.id?.slice(0,20)}</div>
                        {sr.description && <div className="text-xs text-tertiary truncate">{sr.description}</div>}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.625rem"}}>{sr.priority||"—"}</span>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>{(sr.status||"—").replace("_"," ")}</span>
                    </div>
                    <div className="text-center text-xs text-secondary truncate px-1">{sr.requester_name||"—"}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(sr.created_at)}</div>
                    <div className="text-center">
                      {linkedWO
                        ? <span className="tb-badge tb-badge--success" style={{fontSize:"0.5625rem"}}>Linked</span>
                        : <span className="tb-badge" style={{fontSize:"0.5625rem",color:"#64748B"}}>—</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="tb-grid-3">
          <div className="tb-section">
            <div className="text-xs text-tertiary mb-3">By Priority</div>
            <div className="space-y-2">
              {["critical","high","medium","low"].map(p => {
                const cnt = srs.filter(s => s.priority === p).length;
                const pct = srs.length > 0 ? (cnt / srs.length) * 100 : 0;
                return (
                  <div key={p}>
                    <div className="tb-flex-between mb-1">
                      <span className="text-xs text-secondary capitalize">{p}</span>
                      <span className="text-xs font-bold text-primary">{cnt}</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:PRIORITY_COLOR[p],width:`${pct}%`}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="text-xs text-tertiary mb-3">By Status</div>
            <div className="space-y-2">
              {["open","in_progress","resolved","closed"].map(s => {
                const cnt = srs.filter(sr => sr.status === s).length;
                const pct = srs.length > 0 ? (cnt / srs.length) * 100 : 0;
                return (
                  <div key={s}>
                    <div className="tb-flex-between mb-1">
                      <span className="text-xs text-secondary capitalize">{s.replace("_"," ")}</span>
                      <span className="text-xs font-bold text-primary">{cnt}</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:STATUS_COLOR[s],width:`${pct}%`}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="text-xs text-tertiary mb-3">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label:"Work Orders",  icon:"🔧", path:"/operations/work-orders" },
                { label:"Dispatch",     icon:"📋", path:"/operations/dispatch" },
                { label:"Technicians",  icon:"👷", path:"/operations/technicians" },
                { label:"Assets",       icon:"⚙️",  path:"/maintenance/assets" },
              ].map((a, i) => (
                <button key={i} onClick={() => router.push(a.path)} className="tb-action-item w-full justify-start">
                  <span>{a.icon}</span>
                  <span className="text-sm text-secondary">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

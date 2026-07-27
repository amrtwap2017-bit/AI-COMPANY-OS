"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const PRIORITY_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" };
const STATUS_COLOR   = { open:"#60A5FA", in_progress:"#FBBF24", completed:"#34D399", cancelled:"#94A3B8" };

export default function DispatchPage() {
  const router = useRouter();
  const [view, setView] = useState("board");
  const [search, setSearch] = useState("");

  const { data: woRaw, isLoading: woLoading } = useQuery(
    ["dispatch-wos"],
    () => authFetch("/api/v1/work-orders/").then(r => r.json()),
    { refetchInterval: 30000 }
  );
  const { data: techRaw } = useQuery(
    ["dispatch-techs"],
    () => authFetch("/api/v1/technicians/").then(r => r.json()),
    { refetchInterval: 30000 }
  );
  const { data: srRaw } = useQuery(
    ["dispatch-srs"],
    () => authFetch("/api/v1/service-requests/").then(r => r.json())
  );

  const wos   = toArr(woRaw);
  const techs = toArr(techRaw);
  const srs   = toArr(srRaw);

  const openWOs      = wos.filter(w => w.status === "open");
  const inProgWOs    = wos.filter(w => w.status === "in_progress");
  const criticalWOs  = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const unassigned   = wos.filter(w => !w.technician_id && w.status !== "completed");
  const openSRs      = srs.filter(s => s.status === "open");

  const filtered = wos.filter(w =>
    w.status !== "completed" &&
    (!search ||
      (w.title||"").toLowerCase().includes(search.toLowerCase()) ||
      (w.priority||"").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1820 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Dispatch Board</h1>
              <p className="tb-hero-description">{techs.length} technicians · {openWOs.length} open · {criticalWOs.length} critical · {unassigned.length} unassigned</p>
            </div>
            <button onClick={() => router.push("/operations/work-orders")} className="tb-btn-primary">
              + New Work Order
            </button>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              { label:"Open WOs",    value:openWOs.length,   color:"#60A5FA" },
              { label:"In Progress", value:inProgWOs.length, color:"#FBBF24" },
              { label:"Critical",    value:criticalWOs.length, color:criticalWOs.length>0?"#F87171":"#34D399" },
              { label:"Unassigned",  value:unassigned.length, color:unassigned.length>0?"#FB923C":"#34D399" },
              { label:"Open SRs",   value:openSRs.length,   color:"#A78BFA" },
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

        {/* Alerts */}
        {(criticalWOs.length > 0 || unassigned.length > 0) && (
          <div className="tb-section" style={{borderColor:"#F8717140",background:"#F8717108"}}>
            <div className="flex items-center gap-3 flex-wrap">
              <span style={{fontSize:"1.25rem"}}>🚨</span>
              <div className="flex-1">
                {criticalWOs.length > 0 && (
                  <span className="text-sm font-semibold text-red-400 mr-4">
                    {criticalWOs.length} critical work order{criticalWOs.length>1?"s":""} need immediate attention
                  </span>
                )}
                {unassigned.length > 0 && (
                  <span className="text-sm font-semibold" style={{color:"#FB923C"}}>
                    {unassigned.length} unassigned work order{unassigned.length>1?"s":""}
                  </span>
                )}
              </div>
              <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">
                View All →
              </button>
            </div>
          </div>
        )}

        {/* Technician Board */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div>
              <div className="text-label-upper text-tertiary mb-1">Field Team</div>
              <div className="tb-section-title" style={{marginBottom:0}}>Technician Status</div>
            </div>
            <button onClick={() => router.push("/operations/technicians")} className="tb-section-link">Manage →</button>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {techs.slice(0,8).map((tech, i) => {
              const techWOs    = wos.filter(w => w.technician_id === tech.id);
              const active     = techWOs.filter(w => w.status === "in_progress").length;
              const openCount  = techWOs.filter(w => w.status === "open").length;
              const isActive   = active > 0;
              const isAvail    = !isActive && openCount === 0;
              const statusColor = isActive ? "#FBBF24" : isAvail ? "#34D399" : "#60A5FA";
              const statusLabel = isActive ? "Active" : isAvail ? "Available" : "Queued";
              return (
                <button key={i}
                  onClick={() => router.push(`/operations/technicians/${tech.id}`)}
                  className="tb-section text-left hover:border-brand transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-base-alt flex items-center justify-center text-xs font-black text-secondary flex-shrink-0">
                      {(tech.name||"?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-primary truncate">{tech.name||"—"}</div>
                      <div className="text-xs text-tertiary truncate">{tech.specialization||tech.role||"—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="tb-badge" style={{background:`${statusColor}18`,color:statusColor,border:`1px solid ${statusColor}30`,fontSize:"0.5625rem"}}>
                      {statusLabel}
                    </span>
                    <span className="text-xs text-tertiary">{techWOs.length} WOs</span>
                  </div>
                  {active > 0 && (
                    <div className="tb-progress mt-2">
                      <div className="tb-progress-bar" style={{background:"#FBBF24",width:"60%"}}/>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {techs.length > 8 && (
            <button onClick={() => router.push("/operations/technicians")}
              className="text-xs text-brand mt-3 hover:text-primary transition-colors">
              + {techs.length - 8} more technicians →
            </button>
          )}
        </div>

        {/* Work Order Queue */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div>
              <div className="text-label-upper text-tertiary mb-1">Queue</div>
              <div className="tb-section-title" style={{marginBottom:0}}>Active Work Orders ({filtered.length})</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                className="tb-search"
                style={{width:200}}
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All →</button>
            </div>
          </div>

          {woLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">✅</div>
              <div className="tb-empty-title">All clear</div>
              <div className="tb-empty-desc">No active work orders in the queue</div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 80px 90px 150px 100px 110px"}}>
                {["Work Order","Priority","Status","Technician","Asset","Due Date"].map((h, i) => (
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.slice(0,20).map((wo, i) => {
                const pc   = PRIORITY_COLOR[wo.priority] || "#94A3B8";
                const sc   = STATUS_COLOR[wo.status] || "#94A3B8";
                const tech = techs.find(t => t.id === wo.technician_id);
                return (
                  <button key={i}
                    onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"2fr 80px 90px 150px 100px 110px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:pc}}/>
                      <div className="text-sm font-semibold text-primary truncate">{wo.title||"—"}</div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.625rem"}}>{wo.priority||"—"}</span>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>{(wo.status||"—").replace("_"," ")}</span>
                    </div>
                    <div className="text-center text-xs text-secondary truncate px-1">
                      {tech?.name || <span style={{color:"#FB923C"}}>Unassigned</span>}
                    </div>
                    <div className="text-center text-xs text-tertiary truncate px-1">{wo.asset_id?.slice(0,10)||"—"}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(wo.due_date)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="tb-grid-3">
          <div className="tb-section">
            <div className="text-xs text-tertiary mb-3">WOs by Priority</div>
            <div className="space-y-2">
              {["critical","high","medium","low"].map(p => {
                const cnt = wos.filter(w => w.priority === p && w.status !== "completed").length;
                const pct = openWOs.length > 0 ? (cnt / openWOs.length) * 100 : 0;
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
            <div className="text-xs text-tertiary mb-3">Technician Workload</div>
            <div className="space-y-2">
              {techs.slice(0,5).map((tech, i) => {
                const cnt = wos.filter(w => w.technician_id === tech.id && w.status !== "completed").length;
                const max = Math.max(...techs.map(t => wos.filter(w => w.technician_id === t.id).length), 1);
                return (
                  <div key={i}>
                    <div className="tb-flex-between mb-1">
                      <span className="text-xs text-secondary truncate" style={{maxWidth:120}}>{tech.name||"—"}</span>
                      <span className="text-xs font-bold text-primary">{cnt}</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:"#60A5FA",width:`${(cnt/max)*100}%`}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="tb-section">
            <div className="text-xs text-tertiary mb-3">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label:"All Work Orders",     icon:"🔧", path:"/operations/work-orders" },
                { label:"Service Requests",    icon:"🎫", path:"/operations/service-requests" },
                { label:"Technicians",         icon:"👷", path:"/operations/technicians" },
                { label:"Maintenance Plans",   icon:"📅", path:"/maintenance/pm-plans" },
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

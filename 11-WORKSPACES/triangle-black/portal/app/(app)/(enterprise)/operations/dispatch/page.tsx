"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).getFullYear() > 1990;

const PRIORITY_COLORS = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D"};
const STATUS_CONFIG = {
  open:        {label:"Open",        color:"#5B7C8C", bg:"#1E3A5F"},
  in_progress: {label:"In Progress", color:"#B07A2A", bg:"#3A2F0E"},
  completed:   {label:"Completed",   color:"#547C4D", bg:"#0D2A1E"},
};
const COLUMNS = ["open","in_progress","completed"];

function WOCard({ wo, techs, onAssign, onStatus, onClick }) {
  const [showAssign, setShowAssign] = useState(false);
  const pc = PRIORITY_COLORS[wo.priority] || "#6D5F53";
  const overdue = isOverdue(wo.due_date);
  return (
    <div className="rounded-xl border border-border transition-all hover:border-brand/40 cursor-pointer"
         style={{background:"#332C27",borderLeft:`3px solid ${pc}`}}>
      <div className="p-3" onClick={()=>onClick(wo.id)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-xs font-bold text-primary leading-tight flex-1">{wo.title.slice(0,55)}{wo.title.length>55?"…":""}</div>
          <span className="tb-badge flex-shrink-0" style={{background:pc+"18",color:pc,fontSize:"0.45rem",border:`1px solid ${pc}30`}}>
            {wo.priority}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {wo.site_name && <span className="text-xs text-tertiary">📍 {wo.site_name.split(' ').slice(0,2).join(' ')}</span>}
          <span className="text-xs text-tertiary">⚙️ {wo.type}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs" style={{color:overdue?"#A84A3D":"#64748B"}}>
            {overdue ? "⚠ Overdue: " : "Due: "}{fmtDate(wo.due_date)}
          </div>
          {wo.technician_name && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                {(wo.technician_name||"?").charAt(0)}
              </div>
              <span className="text-xs text-secondary">{wo.technician_name.split(" ")[0]}</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border/50 px-3 py-2 flex items-center gap-2">
        <button onClick={(e)=>{e.stopPropagation();setShowAssign(!showAssign);}}
          className="text-xs text-brand hover:text-brand/80 flex-1 text-left">
          {wo.technician_name ? "Reassign ↓" : "+ Assign Tech"}
        </button>
        {wo.status !== "completed" && (
          <button onClick={(e)=>{e.stopPropagation();onStatus(wo.id, wo.status==="open"?"in_progress":"completed");}}
            className="text-xs px-2 py-0.5 rounded-lg transition-colors"
            style={{background:wo.status==="open"?"#B07A2A20":"#547C4D20",color:wo.status==="open"?"#B07A2A":"#547C4D"}}>
            {wo.status==="open"?"▶ Start":"✓ Done"}
          </button>
        )}
      </div>
      {showAssign && (
        <div className="px-3 pb-3" onClick={e=>e.stopPropagation()}>
          <select className="tb-input w-full text-xs" defaultValue={wo.technician_id||""}
            onChange={e=>{onAssign(wo.id,e.target.value);setShowAssign(false);}}>
            <option value="">Unassigned</option>
            {techs.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default function DispatchBoardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filterSite, setFilterSite] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const { data: boardData, isLoading } = useQuery(
    ["dispatch-board", filterSite, filterPriority],
    () => {
      const params = new URLSearchParams();
      if (filterSite) params.set("site_id", filterSite);
      if (filterPriority) params.set("priority", filterPriority);
      return authFetch(`/api/v1/dispatch/board?${params}`).then(r=>r.json());
    },
    { staleTime: 15000, refetchInterval: 30000 }
  );

  const board = boardData?.board || {};
  const counts = boardData?.counts || {};
  const techs = boardData?.technicians || [];

  const assignMut = useMutation(
    ({wo_id, tech_id}) => authFetch(`/api/v1/work-orders/${wo_id}/assign`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({technician_id:tech_id})
    }).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["dispatch-board"]) }
  );

  const statusMut = useMutation(
    ({wo_id, status}) => authFetch(`/api/v1/work-orders/${wo_id}/status`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({status})
    }).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["dispatch-board"]) }
  );

  const totalOpen = counts.open || 0;
  const totalIP = counts.in_progress || 0;
  const critical = [...(board.open||[]),...(board.in_progress||[])].filter(w=>w.priority==="critical").length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Operations</div>
              <h1 className="tb-hero-title">Dispatch Board</h1>
              <p className="tb-hero-description">Assign technicians · Track progress · Real-time status</p>
            </div>
            <button onClick={()=>router.push("/operations/work-orders/new")} className="tb-btn-primary" style={{fontSize:"0.75rem"}}>
              + New Work Order
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Open",value:totalOpen,color:"#5B7C8C"},
              {label:"In Progress",value:totalIP,color:"#B07A2A"},
              {label:"Completed",value:counts.completed||0,color:"#547C4D"},
              {label:"Critical",value:critical,color:critical>0?"#A84A3D":"#547C4D"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <select className="tb-input" value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} style={{minWidth:"140px"}}>
            <option value="">All Priorities</option>
            {["critical","high","medium","low"].map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <select className="tb-input" value={filterSite} onChange={e=>setFilterSite(e.target.value)} style={{minWidth:"180px"}}>
            <option value="">All Sites</option>
            {[{id:"site-nile-plaza",name:"Nile Plaza"},{id:"site-cairo-festival",name:"Cairo Festival"},{id:"site-four-seasons",name:"Four Seasons"},{id:"site-hilton-cairo",name:"Hilton Cairo"}].map(s=>(
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {(filterPriority||filterSite) && (
            <button onClick={()=>{setFilterPriority("");setFilterSite("");}} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>
              Reset
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-96 bg-base-alt rounded-2xl animate-pulse"/>)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map(col=>{
              const cfg = STATUS_CONFIG[col];
              const wos = board[col] || [];
              return (
                <div key={col} className="flex flex-col rounded-2xl overflow-hidden border border-border"
                     style={{background:"#221D1A"}}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border"
                       style={{background:cfg.bg}}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{background:cfg.color}}/>
                      <span className="text-sm font-bold" style={{color:cfg.color}}>{cfg.label}</span>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{background:cfg.color+"20",color:cfg.color}}>
                      {wos.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{maxHeight:"70vh"}}>
                    {wos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <div style={{fontSize:"2rem",opacity:0.3}}>📋</div>
                        <div className="text-xs text-tertiary">No {cfg.label.toLowerCase()} work orders</div>
                      </div>
                    ) : (
                      wos.map(wo=>(
                        <WOCard key={wo.id} wo={wo} techs={techs}
                          onAssign={(wo_id,tech_id)=>assignMut.mutate({wo_id,tech_id})}
                          onStatus={(wo_id,status)=>statusMut.mutate({wo_id,status})}
                          onClick={(id)=>router.push("/operations/work-orders/"+id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

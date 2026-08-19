"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const isOverdue = (d: any) => d && new Date(d) < new Date() && new Date(d).getFullYear() > 1990;

const PRIORITY_COLORS = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D"};
const STATUS_CONFIG = {
  open:        {label:"Open",        color:"#5B7C8C", bg:"#1E3A5F"},
  in_progress: {label:"In Progress", color:"#B07A2A", bg:"#3A2F0E"},
  completed:   {label:"Completed",   color:"#547C4D", bg:"#0D2A1E"},
};
const COLUMNS = ["open","in_progress","completed"];

function WOCard({ wo, techs, onAssign, onStatus, onClick }: any) {
  const [showAssign, setShowAssign] = useState(false);
  const pc = (PRIORITY_COLORS as Record<string, any>)[wo.priority] || "#6D5F53";
  const overdue = isOverdue(wo.due_date);
  return (
    <div className="rounded-xl border border-default transition-all tb-hover-lift cursor-pointer"
         style={{background:"var(--color-surface)",borderLeft:`3px solid ${pc}`}}>
      <div className="p-3" onClick={()=>onClick(wo.id)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-xs font-bold text-primary leading-tight flex-1">{wo.title.slice(0,55)}{wo.title.length>55?"…":""}</div>
          <span className="tb-badge flex-shrink-0" style={{background:pc+"18",color:pc,fontSize:"0.45rem",border:`1px solid ${pc}30`}}>
            {wo.priority}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {wo.site_name && <span className="text-xs text-tertiary">📍 {wo.site_name.split(" ").slice(0,2).join(" ")}</span>}
          <span className="text-xs text-tertiary">⚙️ {wo.type}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className={`text-xs ${overdue?"text-danger font-semibold":"text-tertiary"}`}>
            {overdue ? "⚠ Overdue: " : "Due: "}{fmtDate(wo.due_date)}
          </div>
          {wo.technician_name && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center text-xs font-bold text-brand">
                {(wo.technician_name||"?").charAt(0)}
              </div>
              <span className="text-xs text-secondary">{wo.technician_name.split(" ")[0]}</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-default px-3 py-2 flex items-center gap-2">
        <button onClick={(e: any) =>{e.stopPropagation();setShowAssign(!showAssign);}}
          className="text-xs text-brand hover:opacity-80 flex-1 text-left bg-transparent border-0 cursor-pointer">
          {wo.technician_name ? "Reassign ↓" : "+ Assign Tech"}
        </button>
        {wo.status !== "completed" && (
          <button onClick={(e: any) =>{e.stopPropagation();onStatus(wo.id, wo.status==="open"?"in_progress":"completed");}}
            className="text-xs px-2 py-0.5 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
            style={{background:wo.status==="open"?"#B07A2A20":"#547C4D20",color:wo.status==="open"?"#B07A2A":"#547C4D"}}>
            {wo.status==="open"?"▶ Start":"✓ Done"}
          </button>
        )}
      </div>
      {showAssign && (
        <div className="px-3 pb-3" onClick={(e: any) =>e.stopPropagation()}>
          <select className="tb-select w-full" defaultValue={wo.technician_id||""}
            onChange={(e: any) =>{onAssign(wo.id,e.target.value);setShowAssign(false);}}>
            <option value="">Unassigned</option>
            {techs.map((t: any) =><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default function DispatchBoardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filterSite,     setFilterSite]     = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const { data: boardData, isLoading } = useQuery(
    ["dispatch-board", filterSite, filterPriority],
    () => {
      const params = new URLSearchParams();
      if (filterSite)     params.set("site_id",  filterSite);
      if (filterPriority) params.set("priority", filterPriority);
      return authFetch(`/api/v1/dispatch/board?${params}`).then(r=>r.json());
    },
    {staleTime:15000, refetchInterval:30000}
  );

  const board  = boardData?.board        || {};
  const counts = boardData?.counts       || {};
  const techs  = boardData?.technicians  || [];

  const assignMut = useMutation(
    ({wo_id,tech_id})=>authFetch(`/api/v1/work-orders/${wo_id}/assign`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({technician_id:tech_id})}).then(r=>r.json()),
    {onSuccess:()=>qc.invalidateQueries(["dispatch-board"])}
  );
  const statusMut = useMutation(
    ({wo_id,status})=>authFetch(`/api/v1/work-orders/${wo_id}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}).then(r=>r.json()),
    {onSuccess:()=>qc.invalidateQueries(["dispatch-board"])}
  );

  const totalOpen = counts.open        || 0;
  const totalIP   = counts.in_progress || 0;
  const critical  = [...(board.open||[]),...(board.in_progress||[])].filter((w: any) =>w.priority==="critical").length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Dispatch Board</h1>
              <p className="tb-hero-description">Assign technicians · Track progress · Real-time status</p>
            </div>
            <button onClick={()=>router.push("/operations/work-orders/new")} className="tb-btn tb-btn-primary">
              + New Work Order
            </button>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Open",        value:totalOpen,          color:"var(--color-info)"},
              {label:"In Progress", value:totalIP,            color:"var(--color-warning)"},
              {label:"Completed",   value:counts.completed||0,color:"var(--color-success)"},
              {label:"Critical",    value:critical,           color:critical>0?"var(--color-danger)":"var(--color-success)"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-3 mb-4 flex-wrap">
          <select className="tb-select" value={filterPriority} onChange={(e: any) =>setFilterPriority(e.target.value)} style={{minWidth:"140px"}}>
            <option value="">All Priorities</option>
            {["critical","high","medium","low"].map((p: any) =><option key={p} value={p}>{p}</option>)}
          </select>
          <select className="tb-select" value={filterSite} onChange={(e: any) =>setFilterSite(e.target.value)} style={{minWidth:"180px"}}>
            <option value="">All Sites</option>
            {[{id:"site-nile-plaza",name:"Nile Plaza"},{id:"site-cairo-festival",name:"Cairo Festival"},{id:"site-four-seasons",name:"Four Seasons"},{id:"site-hilton-cairo",name:"Hilton Cairo"}].map((s: any) =>(
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {(filterPriority||filterSite) && (
            <button onClick={()=>{setFilterPriority("");setFilterSite("");}} className="tb-btn tb-btn-ghost tb-btn-sm">Reset</button>
          )}
        </div>

        {isLoading ? (
          <div className="tb-grid-3">{[1,2,3].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:384}}/>)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map(col=>{
              const cfg = (STATUS_CONFIG as Record<string, any>)[col];
              const wos = board[col] || [];
              return (
                <div key={col} className="flex flex-col rounded-2xl overflow-hidden border border-default"
                     style={{background:"var(--color-surface)"}}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-default"
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
                  <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto" style={{maxHeight:"70vh"}}>
                    {wos.length === 0 ? (
                      <div className="tb-empty py-8">
                        <div className="tb-empty-icon text-2xl opacity-30">📋</div>
                        <div className="tb-empty-desc">No {cfg.label.toLowerCase()} work orders</div>
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

"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"}); } catch { return "—"; } };
const fmtDateTime = (d) => { try { return new Date(d).toLocaleString("en-GB", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const P_CONFIG = {
  critical: { color:"#F87171", bg:"rgba(239,68,68,0.12)", border:"rgba(239,68,68,0.3)",  label:"Critical" },
  high:     { color:"#FB923C", bg:"rgba(251,146,60,0.12)", border:"rgba(251,146,60,0.3)", label:"High" },
  medium:   { color:"#FCD34D", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.3)", label:"Medium" },
  low:      { color:"#94A3B8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.2)",label:"Low" },
};
const S_CONFIG = {
  open:        { color:"#60A5FA", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.25)",  label:"Open" },
  in_progress: { color:"#FCD34D", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  label:"In Progress" },
  completed:   { color:"#34D399", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)",  label:"Completed" },
  cancelled:   { color:"#94A3B8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.2)",  label:"Cancelled" },
};

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const qc      = useQueryClient();

  const { data: woData, isLoading, isError } = useQuery(
    ["wo-detail", id],
    () => authFetch(`/api/v1/work-orders/${id}`).then(r => r.json()),
    { enabled: !!id }
  );
  const { data: techRaw }  = useQuery(["wo-techs"],   () => authFetch("/api/v1/technicians/").then(r=>r.json()));
  const { data: assetRaw } = useQuery(["wo-assets"],  () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: allWOsRaw }= useQuery(["wo-all"],     () => authFetch("/api/v1/work-orders/").then(r=>r.json()));

  if (isLoading) return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>
      <div style={{background:"#0F172A",height:220}} className="animate-pulse"/>
    </div>
  );

  if (isError || !woData) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--color-bg)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:16}}>🔧</div>
        <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>Work Order Not Found</div>
        <button onClick={() => router.push("/operations/work-orders")} style={{marginTop:20,background:"var(--color-brand)",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>← Back to Work Orders</button>
      </div>
    </div>
  );

  const wo = Array.isArray(woData) ? woData[0] : woData;
  if (!wo) return null;

  const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
  const techs  = toArr(techRaw);
  const assets = toArr(assetRaw);
  const allWOs = toArr(allWOsRaw);

  const pc = P_CONFIG[wo.priority] || P_CONFIG.medium;
  const sc = S_CONFIG[wo.status]   || S_CONFIG.open;
  const tech     = techs.find(t => t.id === wo.technician_id);
  const asset    = assets.find(a => a.id === wo.asset_id);
  const relatedWOs = allWOs.filter(w => w.id !== wo.id && (w.asset_id === wo.asset_id || w.technician_id === wo.technician_id) && wo.asset_id).slice(0,4);

  const now = new Date();
  const isOverdue = wo.due_date && new Date(wo.due_date) < now && wo.status !== "completed";
  const daysOverdue = isOverdue ? Math.floor((Date.now() - new Date(wo.due_date).getTime()) / 86400000) : 0;

  // Timeline events
  const timeline = [
    { event:"Created",    time:wo.created_at,    icon:"📝", color:"#60A5FA" },
    wo.started_at    && { event:"Started",     time:wo.started_at,    icon:"▶️", color:"#FCD34D" },
    wo.completed_at  && { event:"Completed",   time:wo.completed_at,  icon:"✅", color:"#34D399" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>

      {/* DARK HEADER */}
      <div style={{background:"linear-gradient(135deg, #0F172A 0%, #111827 100%)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 32px"}}>

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push("/operations/work-orders")}
              style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"rgba(248,250,252,0.8)",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",transition:"all 120ms"}}>
              ← Work Orders
            </button>
            <span style={{color:"rgba(255,255,255,0.15)"}}>/</span>
            <span style={{color:"rgba(148,163,184,0.6)",fontSize:"0.75rem",maxWidth:300}} className="truncate">{wo.title}</span>
          </div>

          {/* Hero */}
          <div className="flex items-start justify-between gap-6">
            <div style={{flex:1,minWidth:0}}>
              <div className="flex items-center gap-3 mb-3" style={{flexWrap:"wrap"}}>
                <div style={{fontSize:"0.625rem",fontWeight:700,color:"#F97316",textTransform:"uppercase",letterSpacing:"0.1em"}}>Operations · Work Order</div>
                <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>
                <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:pc.bg,color:pc.color,border:`1px solid ${pc.border}`}}>{pc.label}</span>
                {wo.type && <span style={{fontSize:"0.6875rem",padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,0.06)",color:"rgba(148,163,184,0.7)",textTransform:"capitalize"}}>{wo.type}</span>}
              </div>
              <h1 style={{fontSize:"1.875rem",fontWeight:900,color:"#F1F5F9",letterSpacing:"-0.02em",lineHeight:1.15,margin:0}} className="truncate">{wo.title}</h1>
              {wo.description && <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.8125rem",marginTop:8,lineHeight:1.5}}>{wo.description}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {wo.status === "open" && (
                <button onClick={async()=>{
                  const r = await authFetch(`/api/v1/work-orders/${wo.id}/status`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"in_progress"})});
                  if(r.ok){qc.invalidateQueries(["wo-detail",id]);qc.invalidateQueries(["wo-list"]);}
                }} style={{background:"rgba(180,83,9,0.15)",border:"1px solid rgba(180,83,9,0.4)",color:"#FCD34D",borderRadius:10,padding:"9px 18px",fontSize:"0.8125rem",fontWeight:700,cursor:"pointer",transition:"all 150ms"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(180,83,9,0.25)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(180,83,9,0.15)"}>
                  ▶ Start WO
                </button>
              )}
              {wo.status === "in_progress" && (
                <button onClick={async()=>{
                  const r = await authFetch(`/api/v1/work-orders/${wo.id}/status`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"completed"})});
                  if(r.ok){qc.invalidateQueries(["wo-detail",id]);qc.invalidateQueries(["wo-list"]);}
                }} style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.4)",color:"#34D399",borderRadius:10,padding:"9px 18px",fontSize:"0.8125rem",fontWeight:700,cursor:"pointer",transition:"all 150ms"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.25)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(16,185,129,0.15)"}>
                  ✓ Complete WO
                </button>
              )}
              {(wo.status === "open" || wo.status === "in_progress") && (
                <button onClick={async()=>{
                  if(!confirm("Cancel this work order?"))return;
                  const r = await authFetch(`/api/v1/work-orders/${wo.id}/status`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"cancelled"})});
                  if(r.ok){qc.invalidateQueries(["wo-detail",id]);qc.invalidateQueries(["wo-list"]);}
                }} style={{background:"rgba(148,163,184,0.08)",border:"1px solid rgba(148,163,184,0.2)",color:"#94A3B8",borderRadius:10,padding:"9px 14px",fontSize:"0.8125rem",fontWeight:600,cursor:"pointer"}}>
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {[
              { label:"Priority",   value:pc.label,             color:pc.color },
              { label:"Status",     value:sc.label,             color:sc.color },
              { label:"Due Date",   value:fmtDate(wo.due_date), color:isOverdue?"#F87171":"rgba(148,163,184,0.8)" },
              { label:"Technician", value:tech?.name||"Unassigned", color:tech?"rgba(248,250,252,0.9)":"rgba(148,163,184,0.5)" },
              { label:"Asset",      value:asset?.name||"—",     color:"rgba(148,163,184,0.8)" },
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 12px",backdropFilter:"blur(12px)"}}>
                <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.5)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{k.label}</div>
                <div style={{fontSize:"0.8125rem",fontWeight:700,color:k.color,lineHeight:1.3}} className="truncate">{k.value}</div>
              </div>
            ))}
          </div>

          {/* Overdue alert */}
          {isOverdue && (
            <div style={{marginTop:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span>⏰</span>
              <div style={{flex:1,fontSize:"0.75rem",color:"#FCA5A5",fontWeight:600}}>This work order is {daysOverdue} day{daysOverdue>1?"s":""} overdue — SLA breach.</div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 32px"}}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main */}
          <div className="xl:col-span-2 space-y-5">

            {/* Details card */}
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Work Order Details</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Full Information</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Type",        (wo.type||"corrective").toUpperCase()],
                  ["Priority",    pc.label],
                  ["Status",      sc.label],
                  ["Created",     fmtDate(wo.created_at)],
                  ["Started",     fmtDate(wo.started_at)],
                  ["Completed",   fmtDate(wo.completed_at)],
                  ["Due Date",    fmtDate(wo.due_date)],
                  ["Site",        wo.site_id?.slice(0,12)||"—"],
                ].map(([l,v],i) => (
                  <div key={i} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{l}</div>
                    <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned technician */}
            {tech && (
              <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:16}}>Assigned Technician</div>
                <button onClick={() => router.push(`/operations/technicians/${tech.id}`)} className="w-full text-left"
                  style={{display:"flex",alignItems:"center",gap:16,padding:"16px",background:"var(--color-bg-alt)",borderRadius:14,border:"1px solid transparent",transition:"all 120ms ease",cursor:"pointer"}}
                  onMouseEnter={e => e.currentTarget.style.borderColor="var(--color-brand)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="transparent"}>
                  <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg, #B45309, #D97706)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{color:"#fff",fontSize:"1.25rem",fontWeight:900}}>{(tech.name||"?")[0]}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)"}}>{tech.name}</div>
                    <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{tech.email}</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(tech.specializations||[]).slice(0,3).map((s,i) => (
                        <span key={i} style={{fontSize:"0.625rem",fontWeight:600,padding:"2px 8px",borderRadius:99,background:"rgba(180,83,9,0.1)",color:"var(--color-brand)",border:"1px solid rgba(180,83,9,0.2)"}}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>Capacity</div>
                    <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)"}}>{tech.current_work_orders||0}/{tech.max_work_orders||5}</div>
                  </div>
                </button>
              </div>
            )}

            {/* Linked asset */}
            {asset && (
              <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:16}}>Asset</div>
                <button onClick={() => router.push(`/maintenance/assets/${asset.id}`)} className="w-full text-left"
                  style={{display:"flex",alignItems:"center",gap:14,padding:16,background:"var(--color-bg-alt)",borderRadius:14,border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                  onMouseEnter={e => e.currentTarget.style.borderColor="var(--color-brand)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="transparent"}>
                  <div style={{width:44,height:44,borderRadius:12,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1.5rem"}}>🏗️</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)"}}>{asset.name}</div>
                    <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{asset.category} · {asset.location_description||asset.serial_number||"—"}</div>
                    <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>Last service: {fmtDate(asset.last_maintenance_date)}</div>
                  </div>
                  <div>
                    <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 8px",borderRadius:99,background:"rgba(16,185,129,0.1)",color:"#34D399"}}>{asset.status}</span>
                  </div>
                </button>
              </div>
            )}

            {/* Related WOs */}
            {relatedWOs.length > 0 && (
              <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Related</div>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Related Work Orders</div>
                <div className="space-y-2">
                  {relatedWOs.map((w,i) => {
                    const wpc = P_CONFIG[w.priority]||P_CONFIG.medium;
                    const wsc = S_CONFIG[w.status]||S_CONFIG.open;
                    return (
                      <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e => e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor="transparent"}>
                        <div style={{width:3,height:28,background:wpc.color,borderRadius:99,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{w.title}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{wpc.label} · {fmtDate(w.due_date)}</div>
                        </div>
                        <span style={{fontSize:"0.625rem",fontWeight:700,padding:"3px 8px",borderRadius:99,background:wsc.bg,color:wsc.color,border:`1px solid ${wsc.border}`}}>{wsc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Timeline */}
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Timeline</div>
              <div className="space-y-3">
                {timeline.map((event,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div style={{width:28,height:28,borderRadius:8,background:`${event.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"0.875rem"}}>{event.icon}</div>
                    <div>
                      <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{event.event}</div>
                      <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{fmtDateTime(event.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"← All Work Orders",  icon:"🔧", path:"/operations/work-orders" },
                  { label:"Dispatch Center",     icon:"👷", path:"/operations/dispatch" },
                  { label:"SLA Review",          icon:"⏱️", path:"/operations/sla-review" },
                  { label:"Create New WO",       icon:"➕", path:"/engineering/new-work-order" },
                ].map((a,i) => (
                  <button key={i} onClick={() => router.push(a.path)} className="w-full text-left flex items-center gap-3"
                    style={{padding:"10px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",fontSize:"0.8125rem",fontWeight:500,color:"var(--color-text-2)",cursor:"pointer",transition:"all 120ms"}}
                    onMouseEnter={e => {e.currentTarget.style.background="rgba(180,83,9,0.06)";e.currentTarget.style.borderColor="rgba(180,83,9,0.2)";e.currentTarget.style.color="var(--color-brand)";}}
                    onMouseLeave={e => {e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.color="var(--color-text-2)";}}>
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Record meta */}
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Record Info</div>
              {[["ID",wo.id?.slice(0,16)+"..."],["Created",fmtDate(wo.created_at)],["Updated",fmtDate(wo.updated_at)]].map(([l,v],i)=>(
                <div key={i} className="flex justify-between" style={{fontSize:"0.75rem",padding:"7px 0",borderBottom:i<2?"1px solid var(--color-divider)":"none"}}>
                  <span style={{color:"var(--color-text-3)"}}>{l}</span>
                  <span style={{color:"var(--color-text-2)",fontFamily:"monospace",fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

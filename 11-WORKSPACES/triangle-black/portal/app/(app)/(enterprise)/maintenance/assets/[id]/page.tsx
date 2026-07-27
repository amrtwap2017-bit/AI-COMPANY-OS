"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"}); } catch { return "—"; } };
const fmtDateTime = (d) => { try { return new Date(d).toLocaleString("en-GB", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const CRIT_CONFIG = {
  critical: { color:"#F87171", bg:"rgba(239,68,68,0.12)", border:"rgba(239,68,68,0.3)",  label:"Critical" },
  high:     { color:"#FB923C", bg:"rgba(251,146,60,0.12)", border:"rgba(251,146,60,0.3)", label:"High" },
  medium:   { color:"#FCD34D", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.3)", label:"Medium" },
  low:      { color:"#94A3B8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.2)",label:"Low" },
};
const STATUS_CONFIG = {
  "Operational":        { color:"#34D399", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)",  label:"Operational" },
  "In Fault":           { color:"#F87171", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",   label:"In Fault" },
  "Under Maintenance":  { color:"#FCD34D", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  label:"Under Maintenance" },
};

export default function AssetDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const { data: assetData, isLoading, isError } = useQuery(
    ["asset-detail", id],
    () => authFetch(`/api/v1/assets/${id}`).then(r => r.json()),
    { enabled: !!id }
  );
  const { data: allAssetsRaw } = useQuery(["all-assets-detail"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: allWOsRaw }    = useQuery(["all-wos-detail"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: allPMsRaw }    = useQuery(["all-pms-detail"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));

  if (isLoading) return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>
      <div style={{background:"#0F172A",height:240}} className="animate-pulse"/>
    </div>
  );

  if (isError || !assetData) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--color-bg)"}}>
      <div style={{textAlign:"center"}}>
        <div className="tb-empty-icon">🏗️</div>
        <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>Asset Not Found</div>
        <button onClick={() => router.push("/maintenance/assets")} style={{marginTop:20,background:"var(--color-brand)",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>← Back to Assets</button>
      </div>
    </div>
  );

  const asset = Array.isArray(assetData) ? assetData[0] : assetData;
  if (!asset) return null;

  const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
  const allAssets = toArr(allAssetsRaw);
  const allWOs    = toArr(allWOsRaw);
  const allPMs    = toArr(allPMsRaw);

  const sc = STATUS_CONFIG[asset.status] || STATUS_CONFIG["Operational"];
  const cc = CRIT_CONFIG[asset.criticality] || CRIT_CONFIG.medium;

  // Related data
  const assetWOs   = allWOs.filter(w => w.asset_id === asset.id);
  const openWOs    = assetWOs.filter(w => w.status !== "completed" && w.status !== "cancelled");
  const assetPMs   = allPMs.filter(p => p.asset_node_id === asset.id);
  const sameCategory = allAssets.filter(a => a.id !== asset.id && a.category === asset.category).slice(0, 4);

  const now = new Date();
  const isOverdueService = asset.next_maintenance_date && new Date(asset.next_maintenance_date) < now;
  const isFault = asset.status === "In Fault";
  const overduePMs = assetPMs.filter(p => p.next_due_ts && new Date(p.next_due_ts) < now);

  return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>

      {/* DARK HEADER */}
      <div style={{background:`linear-gradient(135deg, #0F172A 0%, ${isFault?"#1A0A0A":"#0F1A16"} 100%)`,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="tb-canvas">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push("/maintenance/assets")}
              className="tb-breadcrumb-btn"
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
              ← Assets
            </button>
            <span className="tb-breadcrumb-sep">/</span>
            <span style={{color:"rgba(148,163,184,0.6)",fontSize:"0.75rem"}}>{asset.category}</span>
            <span className="tb-breadcrumb-sep">/</span>
            <span style={{color:"rgba(148,163,184,0.6)",fontSize:"0.75rem"}} className="truncate">{asset.name}</span>
          </div>

          {/* Hero */}
          <div className="flex items-start justify-between gap-6">
            <div style={{flex:1,minWidth:0}}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div style={{fontSize:"0.625rem",fontWeight:700,color:"#EF4444",textTransform:"uppercase",letterSpacing:"0.1em"}}>Maintenance · Asset</div>
                <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>
                <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:cc.bg,color:cc.color,border:`1px solid ${cc.border}`}}>{cc.label}</span>
                <span style={{fontSize:"0.6875rem",padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,0.06)",color:"rgba(148,163,184,0.7)"}}>{asset.category}</span>
              </div>
              <h1 className="text-page-title" style={{color:"#F1F5F9"}}>{asset.name}</h1>
              <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.8125rem",marginTop:6}}>{asset.manufacturer} {asset.model} · {asset.serial_number}</p>
            </div>

            {/* Status badge */}
            <div style={{background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:16,padding:"18px 24px",textAlign:"center",flexShrink:0,boxShadow:asset.status==="Operational"?"0 0 24px rgba(16,185,129,0.12)":asset.status==="In Fault"?"0 0 24px rgba(239,68,68,0.15)":"none"}}>
              <div style={{fontSize:"2rem",marginBottom:6}}>{asset.status==="Operational"?"✅":asset.status==="In Fault"?"⚠️":"🔧"}</div>
              <div style={{fontSize:"0.875rem",fontWeight:700,color:sc.color}}>{sc.label}</div>
              <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.55)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>{cc.label} Criticality</div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6">
            {[
              { label:"Category",     value:asset.category||"—",                     color:"rgba(148,163,184,0.8)" },
              { label:"Criticality",  value:cc.label,                                 color:cc.color },
              { label:"Location",     value:asset.location_description||"—",          color:"rgba(148,163,184,0.8)" },
              { label:"Last Service", value:fmtDate(asset.last_maintenance_date),     color:isOverdueService?"#F87171":"rgba(148,163,184,0.8)" },
              { label:"Next Service", value:fmtDate(asset.next_maintenance_date),     color:isOverdueService?"#F87171":"#34D399" },
              { label:"Open WOs",     value:openWOs.length,                           color:openWOs.length>0?"#FCD34D":"#34D399" },
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 12px",backdropFilter:"blur(12px)"}}>
                <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.5)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{k.label}</div>
                <div style={{fontSize:"0.8125rem",fontWeight:700,color:k.color,lineHeight:1.3}} className="truncate">{k.value}</div>
              </div>
            ))}
          </div>

          {/* Fault / overdue alerts */}
          {isFault && (
            <div style={{marginTop:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span>🚨</span>
              <div style={{flex:1,fontSize:"0.75rem",color:"#FCA5A5",fontWeight:600}}>Asset is IN FAULT — immediate inspection and repair required. Create a corrective work order.</div>
              <button onClick={()=>router.push("/engineering/new-work-order")} style={{fontSize:"0.6875rem",fontWeight:700,color:"#F87171",background:"none",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Create WO →</button>
            </div>
          )}
          {isOverdueService && !isFault && (
            <div style={{marginTop:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span>⏰</span>
              <div style={{flex:1,fontSize:"0.75rem",color:"#FCD34D",fontWeight:600}}>Service overdue — schedule preventive maintenance immediately.</div>
              <button onClick={()=>router.push("/maintenance/pm-plans")} style={{fontSize:"0.6875rem",fontWeight:700,color:"#FBBF24",background:"none",border:"1px solid rgba(245,158,11,0.3)",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>View PM Plans →</button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main */}
          <div className="xl:col-span-2 space-y-5">

            {/* Asset details */}
            <div className="tb-section">
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Asset Information</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Full Technical Details</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Asset ID",         asset.id?.slice(0,16)+"..."],
                  ["Status",           <span style={{fontSize:"0.75rem",fontWeight:700,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>],
                  ["Manufacturer",     asset.manufacturer||"—"],
                  ["Model",            asset.model||"—"],
                  ["Serial Number",    asset.serial_number||"—"],
                  ["Category",         asset.category||"—"],
                  ["Criticality",      <span style={{fontSize:"0.75rem",fontWeight:700,padding:"4px 12px",borderRadius:20,background:cc.bg,color:cc.color,border:`1px solid ${cc.border}`}}>{cc.label}</span>],
                  ["Service Freq.",    asset.service_frequency||"—"],
                  ["Installation",     fmtDate(asset.installation_date)],
                  ["Warranty Expiry",  fmtDate(asset.warranty_expiry)],
                  ["Last Service",     fmtDate(asset.last_maintenance_date)],
                  ["Next Service",     <span style={{color:isOverdueService?"#EF4444":"inherit",fontWeight:isOverdueService?700:400}}>{fmtDate(asset.next_maintenance_date)}{isOverdueService?" ⚠️":""}</span>],
                ].map(([l,v],i)=>(
                  <div key={i} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{l}</div>
                    <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{v}</div>
                  </div>
                ))}
              </div>
              {asset.location_description && (
                <div style={{marginTop:12,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Location</div>
                  <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)"}}>{asset.location_description}</div>
                </div>
              )}
              {asset.notes && (
                <div style={{marginTop:12,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Notes</div>
                  <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",lineHeight:1.6}}>{asset.notes}</div>
                </div>
              )}
            </div>

            {/* PM Plans for this asset */}
            {assetPMs.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Maintenance</div>
                <div className="flex items-center justify-between" style={{marginBottom:16}}>
                  <div className="tb-empty-title">PM Plans ({assetPMs.length})</div>
                  <button onClick={()=>router.push("/maintenance/pm-plans")} className="tb-section-link">All plans →</button>
                </div>
                <div className="space-y-2">
                  {assetPMs.map((pm,i)=>{
                    const isOv = pm.next_due_ts && new Date(pm.next_due_ts) < now;
                    return (
                      <button key={i} onClick={()=>router.push(`/maintenance/pm-plans/${pm.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:isOv?"rgba(239,68,68,0.04)":"var(--color-bg-alt)",border:`1px solid ${isOv?"rgba(239,68,68,0.2)":"transparent"}`,transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=isOv?"rgba(239,68,68,0.2)":"transparent"}>
                        <div style={{width:3,height:28,background:isOv?"#F87171":"#34D399",borderRadius:99,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{pm.title}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{pm.frequency} · {pm.plan_type}</div>
                        </div>
                        <div style={{fontSize:"0.75rem",color:isOv?"#F87171":"var(--color-text-3)",fontWeight:isOv?700:400,textAlign:"right",flexShrink:0}}>
                          {isOv?"OVERDUE":fmtDate(pm.next_due_ts)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Work orders for this asset */}
            {assetWOs.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>History</div>
                <div className="flex items-center justify-between" style={{marginBottom:16}}>
                  <div className="tb-empty-title">Work Orders ({assetWOs.length})</div>
                  <button onClick={()=>router.push("/maintenance/work-history")} className="tb-section-link">Full history →</button>
                </div>
                <div className="space-y-2">
                  {assetWOs.slice(0,6).map((w,i)=>{
                    const wc = {open:"#60A5FA",in_progress:"#FCD34D",completed:"#34D399",cancelled:"#94A3B8"}[w.status]||"#94A3B8";
                    const pc = {critical:"#F87171",high:"#FB923C",medium:"#FCD34D",low:"#94A3B8"}[w.priority]||"#94A3B8";
                    return (
                      <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                        <div style={{width:3,height:28,background:pc,borderRadius:99,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{w.title}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{fmtDate(w.created_at)}</div>
                        </div>
                        <span style={{fontSize:"0.625rem",fontWeight:700,padding:"3px 8px",borderRadius:99,background:`${wc}18`,color:wc,flexShrink:0}}>{w.status}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Same category assets */}
            {sameCategory.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Related</div>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Other {asset.category} Assets</div>
                <div className="grid grid-cols-2 gap-3">
                  {sameCategory.map((a,i)=>{
                    const asc = STATUS_CONFIG[a.status]||STATUS_CONFIG["Operational"];
                    return (
                      <button key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)} className="w-full text-left"
                        style={{padding:"14px",borderRadius:14,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                        <div style={{fontSize:"0.8125rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:4}} className="truncate">{a.name}</div>
                        <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{a.manufacturer}</div>
                        <span style={{display:"inline-block",marginTop:8,fontSize:"0.625rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:asc.bg,color:asc.color}}>{asc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Quick actions */}
            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="space-y-2">
                {[
                  { label:"← All Assets",          icon:"🏗️", path:"/maintenance/assets" },
                  { label:"Create Work Order",      icon:"🔧", path:"/engineering/new-work-order" },
                  { label:"View PM Plans",          icon:"📅", path:"/maintenance/pm-plans" },
                  { label:"Asset Tree",             icon:"🌳", path:"/maintenance/asset-tree" },
                  { label:"Work History",           icon:"📋", path:"/maintenance/work-history" },
                  { label:"Maintenance Intelligence",icon:"🧠",path:"/maintenance/intelligence" },
                ].map((a,i)=>(
                  <button key={i} onClick={()=>router.push(a.path)} className="w-full text-left flex items-center gap-3"
                    style={{padding:"10px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",fontSize:"0.8125rem",fontWeight:i===0?600:500,color:"var(--color-text-2)",cursor:"pointer",transition:"all 120ms"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(180,83,9,0.06)";e.currentTarget.style.borderColor="rgba(180,83,9,0.2)";e.currentTarget.style.color="var(--color-brand)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.color="var(--color-text-2)";}}>
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Health summary */}
            <div className="tb-section">
              <div className="tb-section-title">Asset Health</div>
              <div className="space-y-3">
                {[
                  { label:"Status",       value:sc.label,          color:sc.color },
                  { label:"Criticality",  value:cc.label,          color:cc.color },
                  { label:"Open WOs",     value:openWOs.length,    color:openWOs.length>0?"#FCD34D":"#34D399" },
                  { label:"PM Plans",     value:assetPMs.length,   color:"rgba(148,163,184,0.8)" },
                  { label:"Overdue PMs",  value:overduePMs.length, color:overduePMs.length>0?"#F87171":"#34D399" },
                  { label:"Total WOs",    value:assetWOs.length,   color:"rgba(148,163,184,0.8)" },
                ].map(({label,value,color},i)=>(
                  <div key={i} className="flex justify-between" style={{padding:"8px 0",borderBottom:i<5?"1px solid var(--color-divider)":"none"}}>
                    <span style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>{label}</span>
                    <span style={{fontSize:"0.875rem",fontWeight:700,color}}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Record meta */}
            <div className="tb-section">
              <div className="tb-section-title">Record Info</div>
              {[["ID",asset.id?.slice(0,14)+"..."],["Created",fmtDate(asset.created_at)],["Updated",fmtDate(asset.updated_at)]].map(([l,v],i)=>(
                <div key={i} className="flex justify-between" style={{fontSize:"0.6875rem",padding:"7px 0",borderBottom:i<2?"1px solid var(--color-divider)":"none"}}>
                  <span style={{color:"var(--color-text-3)"}}>{l}</span>
                  <span style={{color:"var(--color-text-2)",fontFamily:"monospace"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

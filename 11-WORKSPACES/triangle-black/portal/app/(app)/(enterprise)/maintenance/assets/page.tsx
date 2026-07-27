"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { ActionBar } from "@/components/ui/ActionBar";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const P_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"rgba(148,163,184,0.4)" };

export default function AssetsPage() {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("all");
  const [critFilter, setCrit] = useState("all");

  const { data: raw, isLoading } = useQuery(["assets-list"], () => authFetch("/api/v1/assets/").then(r=>r.json()), {refetchInterval:120000});
  const { data: twin }           = useQuery(["assets-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));

  const assets = toArr(raw);
  const cats   = [...new Set(assets.map(a => a.category || "Other"))].sort();
  const now    = new Date();

  const operational   = assets.filter(a => a.status==="Operational");
  const faulted       = assets.filter(a => a.status==="In Fault");
  const underMaint    = assets.filter(a => a.status==="Under Maintenance");
  const critical      = assets.filter(a => a.criticality==="critical");
  const overdueService= assets.filter(a => a.next_maintenance_date && new Date(a.next_maintenance_date) < now);
  const uptimePct     = assets.length > 0 ? Math.round(operational.length/assets.length*100) : 100;

  const filtered = assets.filter(a => {
    const ms = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.serial_number?.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter==="all" || (a.category||"Other")===catFilter;
    const mk = critFilter==="all" || a.criticality===critFilter;
    return ms && mc && mk;
  });

  const hasFilters = search || catFilter!=="all" || critFilter!=="all";

  return (
    <div className="min-h-screen" className="bg-base">

      <WorkspaceHeader
        domain="Maintenance"
        domainColor="#EF4444"
        title="Asset Registry"
        description="MEP equipment health, criticality monitoring, and maintenance history"
        health={{ score: twin?.health_score ?? 0, label: "Asset Health", sub: `${uptimePct}% uptime` }}
        kpis={[
          { label:"Total Assets",  value:assets.length,        color:"default" },
          { label:"Operational",   value:operational.length,   color:"success" },
          { label:"In Fault",      value:faulted.length,       color:faulted.length>0?"danger":"success" },
          { label:"Maintenance",   value:underMaint.length,    color:underMaint.length>0?"warning":"success" },
          { label:"Critical",      value:critical.length,      color:"danger" },
          { label:"Overdue Svc",   value:overdueService.length,color:overdueService.length>0?"danger":"success" },
          { label:"Uptime",        value:`${uptimePct}%`,      color:uptimePct>=95?"success":"warning" },
          { label:"Categories",    value:cats.length,          color:"info" },
        ]}
        actions={[
          { label:"Asset Tree",     icon:"🌳", href:"/maintenance/asset-tree", variant:"secondary" },
          { label:"PM Plans",       icon:"📅", href:"/maintenance/pm-plans",   variant:"secondary" },
          { label:"Work History",   icon:"📋", href:"/maintenance/work-history",variant:"secondary" },
        ]}
        aiInsight={faulted.length > 0 ? {
          text: `${faulted.length} asset${faulted.length>1?"s are":" is"} currently in fault. Recommend immediate inspection and work order creation.`,
          action: "Create WOs",
          onAction: () => router.push("/engineering/new-work-order"),
          type: "warning"
        } : critical.length > 0 ? {
          text: `${critical.length} critical assets detected. Ensure PM schedules are up to date for high-risk equipment.`,
          action: "View PM Plans",
          onAction: () => router.push("/maintenance/pm-plans"),
          type: "recommendation"
        } : undefined}
        tabs={[
          { label:"All Assets",   href:"/maintenance/assets",    active:true },
          { label:"Asset Tree",   href:"/maintenance/asset-tree" },
          { label:"PM Plans",     href:"/maintenance/pm-plans" },
          { label:"Work History", href:"/maintenance/work-history" },
          { label:"QR Codes",     href:"/maintenance/qr-codes" },
          { label:"Intelligence", href:"/maintenance/intelligence" },
        ]}
      />

      <ActionBar
        search={{ value:search, onChange:setSearch, placeholder:"Search assets by name or serial number..." }}
        filters={[
          { label:"Category", value:catFilter, onChange:setCat, options:[{label:"All Categories",value:"all"},...cats.map(c=>({label:c,value:c}))] },
          { label:"Criticality", value:critFilter, onChange:setCrit, options:[{label:"All Criticality",value:"all"},{label:"Critical",value:"critical"},{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}] },
        ]}
        hasFilters={!!hasFilters}
        onClear={() => { setSearch(""); setCat("all"); setCrit("all"); }}
        count={{ total:assets.length, filtered:filtered.length }}
      />

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 32px" }}>

        {/* Fault alert */}
        {faulted.length > 0 && (
          <div className="tb-alert tb-alert-critical" style={{borderRadius:14,marginBottom:20}}>
            <span style={{fontSize:"1.25rem"}}>⚠️</span>
            <div className="flex-1">
              <div style={{fontWeight:700,color:"var(--color-danger-text)",fontSize:"0.875rem"}}>{faulted.length} Asset{faulted.length>1?"s":""} In Fault — Immediate Attention Required</div>
              <div style={{fontSize:"0.75rem",color:"var(--color-danger-text)",opacity:0.75,marginTop:2}}>{faulted.slice(0,3).map(a=>a.name).join(" · ")}</div>
            </div>
            <button onClick={()=>router.push("/maintenance/actions")} style={{background:"var(--color-danger)",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>
              View Faults
            </button>
          </div>
        )}

        {/* Table */}
        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🏗️</div>
              <div className="tb-empty-title">No assets found</div>
              <div className="tb-empty-desc">Try adjusting your filters</div>
            </div>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 110px 130px 100px 120px 120px",background:"var(--color-bg-alt)",padding:"10px 24px",borderBottom:"1px solid var(--color-divider)"}}>
                {["Asset","Category","Status","Criticality","Last Service","Next Service"].map((h,i)=>(
                  <div key={i} style={{fontSize:"0.5625rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.07em",textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((a,i)=>{
                const isOverdue = a.next_maintenance_date && new Date(a.next_maintenance_date) < now;
                const isFault   = a.status === "In Fault";
                const statColor = a.status==="Operational"?"#34D399":a.status==="In Fault"?"#F87171":"#FBBF24";
                const critColor = P_COLOR[a.criticality] || "rgba(148,163,184,0.4)";
                return (
                  <button key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)}
                    className="w-full text-left"
                    style={{display:"grid",gridTemplateColumns:"1fr 110px 130px 100px 120px 120px",alignItems:"center",padding:"14px 24px",borderBottom:i<filtered.length-1?"1px solid var(--color-divider)":"none",transition:"background 100ms ease",cursor:"pointer",background:isFault?"rgba(239,68,68,0.03)":"transparent"}}
                    onMouseEnter={e=>e.currentTarget.style.background=isFault?"rgba(239,68,68,0.06)":"rgba(180,83,9,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background=isFault?"rgba(239,68,68,0.03)":"transparent"}>
                    <div style={{display:"flex",alignItems:"center",gap:10,paddingRight:16}}>
                      <div style={{width:3,height:32,background:critColor,borderRadius:99,flexShrink:0}}/>
                      <div>
                        <div className="text-sm font-semibold text-primary" className="truncate">{a.name}</div>
                        <div className="text-xs text-tertiary mt-0.5">{a.manufacturer} {a.model}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"center",fontSize:"0.75rem",color:"var(--color-text-2)"}}>{a.category||"—"}</div>
                    <div className="text-center">
                      <span style={{fontSize:"0.6875rem",fontWeight:600,padding:"3px 10px",borderRadius:6,background:`${statColor}18`,color:statColor}}>
                        {a.status||"—"}
                      </span>
                    </div>
                    <div className="text-center">
                      <span style={{fontSize:"0.6875rem",fontWeight:600,padding:"3px 8px",borderRadius:6,background:`${critColor}18`,color:critColor}}>
                        {a.criticality||"—"}
                      </span>
                    </div>
                    <div style={{textAlign:"center",fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{fmtDate(a.last_maintenance_date)}</div>
                    <div style={{textAlign:"center",fontSize:"0.6875rem",color:isOverdue?"#F87171":"var(--color-text-3)",fontWeight:isOverdue?700:400}}>
                      {fmtDate(a.next_maintenance_date)}
                      {isOverdue&&<div style={{fontSize:"0.5rem",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:1}}>OVERDUE</div>}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

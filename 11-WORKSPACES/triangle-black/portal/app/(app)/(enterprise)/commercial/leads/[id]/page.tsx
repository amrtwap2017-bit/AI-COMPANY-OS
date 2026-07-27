"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"}); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_CONFIG = {
  new:         { color:"#60A5FA", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.25)",   label:"New" },
  qualified:   { color:"#A78BFA", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.25)",  label:"Qualified" },
  proposal:    { color:"#818CF8", bg:"rgba(129,140,248,0.1)", border:"rgba(129,140,248,0.25)",  label:"Proposal" },
  negotiation: { color:"#FCD34D", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",   label:"Negotiation" },
  won:         { color:"#34D399", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)",   label:"Won ✓" },
  lost:        { color:"#F87171", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",    label:"Lost" },
};

const PIPELINE_STAGES = ["new","qualified","proposal","negotiation","won"];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const { data: leadData, isLoading, isError } = useQuery(
    ["lead-detail", id],
    () => authFetch(`/api/v1/leads/${id}`).then(r => r.json()),
    { enabled: !!id }
  );
  const { data: allLeadsRaw }    = useQuery(["leads-all-det"],  () => authFetch("/api/v1/leads/").then(r=>r.json()));
  const { data: allContractsRaw }= useQuery(["contracts-leads"],() => authFetch("/api/v1/contracts/").then(r=>r.json()));

  if (isLoading) return (
    <div className="min-h-screen" className="bg-base">
      <div style={{background:"#0F172A",height:240}} className="animate-pulse"/>
    </div>
  );

  if (isError || !leadData) return (
    <div className="min-h-screen flex items-center justify-center" className="bg-base">
      <div style={{textAlign:"center"}}>
        <div className="tb-empty-icon">👤</div>
        <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>Lead Not Found</div>
        <button onClick={()=>router.push("/commercial/leads")} style={{marginTop:20,background:"var(--color-brand)",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>← Back to Leads</button>
      </div>
    </div>
  );

  const lead = Array.isArray(leadData) ? leadData[0] : leadData;
  if (!lead) return null;

  const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
  const allLeads     = toArr(allLeadsRaw);
  const allContracts = toArr(allContractsRaw);

  const sc    = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
  const score = Number(lead.score || 0);
  const isHot = score >= 70 && lead.status !== "won" && lead.status !== "lost";
  const isWon = lead.status === "won";

  // Find linked contract (by lead_id)
  const linkedContract = allContracts.find(c => c.lead_id === lead.id);
  // Similar company leads
  const similarLeads   = allLeads.filter(l => l.id !== lead.id && (l.company === lead.company || l.source === lead.source) && lead.company).slice(0, 4);

  // Pipeline progress
  const stageIndex = PIPELINE_STAGES.indexOf(lead.status);

  return (
    <div className="min-h-screen" className="bg-base">

      {/* DARK HEADER */}
      <div style={{background:`linear-gradient(135deg, #0F172A 0%, ${isWon?"#0A1F14":isHot?"#1A1208":"#0F172A"} 100%)`,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="tb-canvas">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={()=>router.push("/commercial/leads")}
              className="tb-breadcrumb-btn"
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
              ← Leads
            </button>
            <span className="tb-breadcrumb-sep">/</span>
            {lead.company && <><span style={{color:"rgba(148,163,184,0.6)",fontSize:"0.75rem"}}>{lead.company}</span><span className="tb-breadcrumb-sep">/</span></>}
            <span style={{color:"rgba(148,163,184,0.6)",fontSize:"0.75rem"}} className="truncate">{lead.name}</span>
          </div>

          {/* Hero */}
          <div className="flex items-start justify-between gap-6">
            <div style={{flex:1,minWidth:0}}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div style={{fontSize:"0.625rem",fontWeight:700,color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.1em"}}>Commercial · Lead</div>
                <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>
                {isHot && <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(239,68,68,0.15)",color:"#F87171",border:"1px solid rgba(239,68,68,0.3)"}}>🔥 HOT</span>}
                {isWon && <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(16,185,129,0.15)",color:"#34D399",border:"1px solid rgba(16,185,129,0.3)"}}>✓ CONVERTED</span>}
              </div>
              <h1 className="text-page-title" style={{color:"#F1F5F9"}}>{lead.name}</h1>
              {lead.company && <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.8125rem",marginTop:6}}>{lead.company} · {lead.source||"Direct"}</p>}
            </div>

            {/* Score badge */}
            <div style={{background:score>=70?"rgba(16,185,129,0.08)":score>=50?"rgba(245,158,11,0.08)":"rgba(96,165,250,0.08)",border:`1px solid ${score>=70?"rgba(16,185,129,0.22)":score>=50?"rgba(245,158,11,0.22)":"rgba(96,165,250,0.22)"}`,borderRadius:16,padding:"16px 24px",textAlign:"center",flexShrink:0,boxShadow:score>=70?"0 0 20px rgba(16,185,129,0.12)":"none"}}>
              <div style={{fontSize:"2.5rem",fontWeight:900,color:score>=70?"#34D399":score>=50?"#FCD34D":"#60A5FA",lineHeight:1}}>{score}</div>
              <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>Lead Score</div>
              <div style={{fontSize:"0.625rem",fontWeight:700,color:score>=70?"#34D399":score>=50?"#FCD34D":"#60A5FA",marginTop:4}}>
                {score>=70?"High Intent":score>=50?"Moderate":"Early Stage"}
              </div>
            </div>
          </div>

          {/* Pipeline progress bar */}
          {stageIndex >= 0 && (
            <div style={{marginTop:20}}>
              <div className="flex items-center gap-1">
                {PIPELINE_STAGES.map((stage,i)=>{
                  const passed = i <= stageIndex;
                  const current = i === stageIndex;
                  const sc2 = STATUS_CONFIG[stage];
                  return (
                    <div key={stage} className="flex items-center gap-1" style={{flex:1}}>
                      <div style={{
                        flex:1,height:4,borderRadius:99,
                        background:passed?(current?sc.color:"rgba(52,211,153,0.6)"):"rgba(255,255,255,0.08)",
                        transition:"background 300ms ease",
                        boxShadow:current?`0 0 8px ${sc.color}60`:"none"
                      }}/>
                      {i < PIPELINE_STAGES.length - 1 && <div style={{width:1,height:4,background:"transparent"}}/>}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                {PIPELINE_STAGES.map((stage,i)=>(
                  <div key={stage} style={{fontSize:"0.5rem",color:i<=stageIndex?"rgba(148,163,184,0.7)":"rgba(148,163,184,0.3)",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:i===stageIndex?700:400}}>
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {[
              { label:"Score",    value:score,              color:score>=70?"#34D399":score>=50?"#FCD34D":"#60A5FA" },
              { label:"Priority", value:lead.priority||"—", color:"rgba(148,163,184,0.8)" },
              { label:"Source",   value:lead.source||"—",   color:"rgba(148,163,184,0.8)" },
              { label:"Email",    value:lead.email||"—",    color:"rgba(148,163,184,0.8)" },
              { label:"Phone",    value:lead.phone||"—",    color:"rgba(148,163,184,0.8)" },
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 12px",backdropFilter:"blur(12px)"}}>
                <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.5)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{k.label}</div>
                <div style={{fontSize:"0.8125rem",fontWeight:700,color:k.color,lineHeight:1.3}} className="truncate">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main */}
          <div className="xl:col-span-2 space-y-5">

            {/* Lead details */}
            <div className="tb-section">
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Contact & Lead Info</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Full Details</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Name",      lead.name||"—"],
                  ["Company",   lead.company||"—"],
                  ["Email",     lead.email||"—"],
                  ["Phone",     lead.phone||"—"],
                  ["Source",    lead.source||"—"],
                  ["Priority",  lead.priority||"—"],
                  ["Score",     `${score}/100`],
                  ["Status",    <span style={{fontSize:"0.75rem",fontWeight:700,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>],
                  ["Created",   fmtDate(lead.created_at)],
                  ["Updated",   fmtDate(lead.updated_at)],
                ].map(([l,v],i)=>(
                  <div key={i} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{l}</div>
                    <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{v}</div>
                  </div>
                ))}
              </div>
              {lead.notes && (
                <div style={{marginTop:12,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Notes</div>
                  <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",lineHeight:1.6}}>{lead.notes}</div>
                </div>
              )}
            </div>

            {/* Linked contract (if won) */}
            {linkedContract && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Converted</div>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Linked Contract</div>
                <button onClick={()=>router.push(`/commercial/contracts/${linkedContract.id}`)} className="w-full text-left"
                  style={{padding:20,borderRadius:16,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",transition:"all 120ms",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(16,185,129,0.2)"}>
                  <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:10}}>{linkedContract.title||`Contract ${linkedContract.id?.slice(0,8)}`}</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[["Value",fmtEGP(linkedContract.total_value)],["Status",linkedContract.status],["Expires",fmtDate(linkedContract.end_date)]].map(([l,v],i)=>(
                      <div key={i} style={{background:"rgba(0,0,0,0.1)",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.6)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
                        <div style={{fontSize:"0.8125rem",fontWeight:700,color:"#34D399"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:"0.75rem",color:"var(--color-brand)",marginTop:14,fontWeight:600}}>View full contract →</div>
                </button>
              </div>
            )}

            {/* Similar leads */}
            {similarLeads.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Related</div>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Similar Leads</div>
                <div className="space-y-2">
                  {similarLeads.map((l,i)=>{
                    const ls = STATUS_CONFIG[l.status]||STATUS_CONFIG.new;
                    const ls_score = Number(l.score||0);
                    return (
                      <button key={i} onClick={()=>router.push(`/commercial/leads/${l.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                        <div style={{width:36,height:36,borderRadius:10,background:`${ls.bg}`,border:`1px solid ${ls.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1rem",fontWeight:900,color:ls.color}}>
                          {(l.name||"?")[0]}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{l.name}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{l.company||l.source||"—"}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:"1rem",fontWeight:900,color:ls_score>=70?"#34D399":ls_score>=50?"#FCD34D":"#60A5FA"}}>{ls_score}</div>
                          <span style={{fontSize:"0.5625rem",fontWeight:700,padding:"2px 6px",borderRadius:99,background:ls.bg,color:ls.color}}>{ls.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Score breakdown */}
            <div className="tb-section">
              <div className="tb-section-title">Lead Scoring</div>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{fontSize:"3rem",fontWeight:900,color:score>=70?"#34D399":score>=50?"#FCD34D":"#60A5FA",lineHeight:1}}>{score}</div>
                <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:4}}>out of 100</div>
              </div>
              <div style={{height:8,background:"var(--color-bg-alt)",borderRadius:99,overflow:"hidden",marginBottom:12}}>
                <div style={{height:8,borderRadius:99,background:score>=70?"#34D399":score>=50?"#FCD34D":"#60A5FA",width:`${score}%`,transition:"width 600ms ease"}}/>
              </div>
              <div style={{fontSize:"0.75rem",color:score>=70?"#34D399":score>=50?"#FCD34D":"#60A5FA",fontWeight:700,textAlign:"center"}}>
                {score>=70?"High Intent — Ready to close":score>=50?"Moderate — Nurture needed":"Early Stage — Needs qualification"}
              </div>
            </div>

            {/* Actions */}
            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="space-y-2">
                {[
                  { label:"← All Leads",         icon:"👤", path:"/commercial/leads" },
                  { label:"Edit Lead",            icon:"✏️", path:`/leads/${lead.id}/edit` },
                  { label:"Sales Pipeline",        icon:"📊", path:"/commercial/pipeline" },
                  { label:"Commercial Overview",  icon:"💼", path:"/commercial" },
                  { label:"Customer 360",         icon:"🔍", path:"/customers/360" },
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

            {/* Record meta */}
            <div className="tb-section">
              <div className="tb-section-title">Record Info</div>
              {[["ID",lead.id?.slice(0,14)+"..."],["Agent",lead.agent_id?.slice(0,12)||"—"],["Created",fmtDate(lead.created_at)],["Updated",fmtDate(lead.updated_at)]].map(([l,v],i)=>(
                <div key={i} className="flex justify-between" style={{fontSize:"0.6875rem",padding:"7px 0",borderBottom:i<3?"1px solid var(--color-divider)":"none"}}>
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

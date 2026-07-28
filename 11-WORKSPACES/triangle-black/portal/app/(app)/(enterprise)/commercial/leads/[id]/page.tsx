"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  new:"#60A5FA", qualified:"#A78BFA", proposal:"#818CF8",
  negotiation:"#FBBF24", won:"#34D399", lost:"#F87171",
  assigned:"#FB923C", converted:"#34D399"
};

const PIPELINE_STAGES = ["new","qualified","proposal","negotiation","won"];

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: lead, isLoading } = useQuery(
    ["lead-detail", id],
    () => authFetch(`/api/v1/leads-portal-v2/${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading lead...</div>
    </div>
  );

  if (!lead || lead.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">👤</div>
        <div className="tb-empty-title">Lead not found</div>
        <button onClick={() => router.push("/commercial/leads")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc        = STATUS_COLOR[lead.status] || "#94A3B8";
  const contracts = lead.contracts || [];
  const stageIdx  = PIPELINE_STAGES.indexOf(lead.status);
  const isWon     = lead.status === "won" || lead.status === "converted";
  const isLost    = lead.status === "lost";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0F28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Commercial · CRM</div>
              <h1 className="tb-hero-title">{lead.name || lead.contact_name || `Lead ${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{lead.status||"—"}</span>
                {lead.company && <span className="text-secondary mr-2">{lead.company}</span>}
                {lead.source && <span className="text-tertiary">via {lead.source}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/commercial/leads")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Status",       value:(lead.status||"—").toUpperCase(), color:sc },
              { label:"Score",        value:lead.score||"—",                  color:Number(lead.score||0)>=70?"#34D399":"#FBBF24" },
              { label:"Value",        value:fmtEGP(lead.estimated_value||lead.value||0), color:"#34D399" },
              { label:"Contracts",    value:contracts.length,                 color:"#A78BFA" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">

            {/* Pipeline progress */}
            {!isLost && (
              <div className="tb-section">
                <div className="tb-section-title">Pipeline Stage</div>
                <div className="flex items-center gap-0 mt-2">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const isPast    = i <= stageIdx || isWon;
                    const isCurrent = i === stageIdx && !isWon;
                    const c = STATUS_COLOR[stage] || "#94A3B8";
                    return (
                      <div key={stage} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center flex-1">
                          <div style={{
                            width:28, height:28, borderRadius:"50%",
                            background: isPast ? `${c}30` : "transparent",
                            border: `2px solid ${isPast || isCurrent ? c : "#334155"}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"0.625rem", color: isPast ? c : "#64748B",
                            fontWeight:900,
                          }}>
                            {isPast ? "✓" : i+1}
                          </div>
                          <div className="text-xs mt-1 text-center capitalize" style={{color:isCurrent?c:"#64748B",fontSize:"0.5625rem"}}>{stage}</div>
                        </div>
                        {i < PIPELINE_STAGES.length - 1 && (
                          <div style={{height:2,flex:1,background:i<stageIdx||isWon?"#334155":"#1E293B",marginBottom:16}}/>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="tb-section">
              <div className="tb-section-title">Lead Details</div>
              <div className="space-y-1">
                {[
                  ["Name",          lead.name || lead.contact_name || "—"],
                  ["Company",       lead.company || "—"],
                  ["Email",         lead.email || "—"],
                  ["Phone",         lead.phone || "—"],
                  ["Status",        lead.status || "—"],
                  ["Source",        lead.source || "—"],
                  ["Score",         lead.score || "—"],
                  ["Est. Value",    fmtEGP(lead.estimated_value || lead.value || 0)],
                  ["Assigned To",   lead.assigned_to || "—"],
                  ["Created",       fmtDate(lead.created_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {lead.notes && (
              <div className="tb-section">
                <div className="tb-section-title">Notes</div>
                <p className="text-sm text-secondary leading-relaxed">{lead.notes}</p>
              </div>
            )}

            {contracts.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Contracts ({contracts.length})</div>
                  <button onClick={() => router.push("/commercial/contracts")} className="tb-section-link">All →</button>
                </div>
                <div className="space-y-2 mt-3">
                  {contracts.map((ct, i) => {
                    const csc = { active:"#34D399", expired:"#F87171", pending:"#FBBF24" }[ct.status] || "#94A3B8";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/commercial/contracts/${ct.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">📄</span>
                          <div className="min-w-0">
                            <div className="text-sm text-secondary truncate">{ct.title||ct.id?.slice(0,20)}</div>
                            <div className="text-xs text-tertiary">{fmtEGP(ct.total_value||0)}</div>
                          </div>
                        </div>
                        <span className="tb-badge" style={{background:`${csc}18`,color:csc,border:`1px solid ${csc}30`,fontSize:"0.5625rem",flexShrink:0}}>{ct.status||"—"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Lead Score</div>
              <div className="text-center py-3">
                <div className="text-5xl font-black mb-1" style={{color:Number(lead.score||0)>=70?"#34D399":"#FBBF24"}}>
                  {lead.score || 0}
                </div>
                <div className="text-xs text-tertiary">/ 100</div>
                <div className="tb-progress tb-progress--md mt-3">
                  <div className="tb-progress-bar" style={{
                    background:Number(lead.score||0)>=70?"#34D399":"#FBBF24",
                    width:`${Math.min(Number(lead.score||0),100)}%`
                  }}/>
                </div>
              </div>
            </div>

            {isWon && (
              <div className="tb-section" style={{borderColor:"#34D39940",background:"#34D39908"}}>
                <div className="text-center py-2">
                  <div style={{fontSize:"2rem"}}>🎉</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">DEAL WON</div>
                  <div className="text-xs text-tertiary mt-1">Convert to contract</div>
                </div>
              </div>
            )}

            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Leads",        icon:"👤", path:"/commercial/leads" },
                  { label:"Contracts",        icon:"📄", path:"/commercial/contracts" },
                  { label:"Sales Pipeline",   icon:"📊", path:"/commercial/pipeline" },
                  { label:"Invoices",         icon:"💰", path:"/invoices" },
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
    </div>
  );
}

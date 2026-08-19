"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  new:"#5B7C8C", qualified:"#8D7443", proposal:"#818CF8",
  negotiation:"#B07A2A", won:"#547C4D", lost:"#A84A3D",
  assigned:"#B07A2A", converted:"#547C4D"
};

const PIPELINE_STAGES = ["new","qualified","proposal","negotiation","won"];

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: lead, isLoading } = useQuery(
    ["lead-detail", id],
    () => authFetch(`/api/v1/leads-portal-v2/${id}`).then(r => r.data ?? r),
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

  const sc        = (STATUS_COLOR as Record<string, any>)[lead.status] || "#6D5F53";
  const contracts = lead.contracts || [];
  const stageIdx  = PIPELINE_STAGES.indexOf(lead.status);
  const isWon     = lead.status === "won" || lead.status === "converted";
  const isLost    = lead.status === "lost";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0F28 100%)"}}>
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
              { label:"Score",        value:lead.score||"—",                  color:Number(lead.score||0)>=70?"#547C4D":"#B07A2A" },
              { label:"Value",        value:fmtEGP(lead.estimated_value||lead.value||0), color:"#547C4D" },
              { label:"Contracts",    value:contracts.length,                 color:"#8D7443" },
            ].map((k: any, i: number) => (
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
                  {PIPELINE_STAGES.map((stage: any, i: any) => {
                    const isPast    = i <= stageIdx || isWon;
                    const isCurrent = i === stageIdx && !isWon;
                    const c = (STATUS_COLOR as Record<string, any>)[stage] || "#6D5F53";
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
                          <div style={{height:2,flex:1,background:i<stageIdx||isWon?"#334155":"#332C27",marginBottom:16}}/>
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
                  {contracts.map((ct: any, i: any) => {
                    const csc = { active:"#547C4D", expired:"#A84A3D", pending:"#B07A2A" }[ct.status] || "#6D5F53";
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
                <div className="text-5xl font-black mb-1" style={{color:Number(lead.score||0)>=70?"#547C4D":"#B07A2A"}}>
                  {lead.score || 0}
                </div>
                <div className="text-xs text-tertiary">/ 100</div>
                <div className="tb-progress tb-progress--md mt-3">
                  <div className="tb-progress-bar" style={{
                    background:Number(lead.score||0)>=70?"#547C4D":"#B07A2A",
                    width:`${Math.min(Number(lead.score||0),100)}%`
                  }}/>
                </div>
              </div>
            </div>

            {isWon && (
              <div className="tb-section" style={{borderColor:"#547C4D40",background:"#547C4D08"}}>
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
                ].map((a: any, i: number) => (
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

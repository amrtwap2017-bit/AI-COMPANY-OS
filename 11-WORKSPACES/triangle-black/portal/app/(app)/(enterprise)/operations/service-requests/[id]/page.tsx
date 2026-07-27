"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const PRIORITY_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" };
const STATUS_COLOR   = { open:"#60A5FA", in_progress:"#FBBF24", resolved:"#34D399", closed:"#94A3B8" };
const WO_SC          = { open:"#60A5FA", in_progress:"#FBBF24", completed:"#34D399" };

export default function ServiceRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: sr, isLoading } = useQuery(
    ["sr-detail", id],
    () => authFetch(`/api/v1/service-requests/${id}`).then(r => r.json()),
    { enabled: !!id }
  );
  const { data: woRaw } = useQuery(
    ["sr-detail-wo", sr?.work_order_id],
    () => authFetch(`/api/v1/work-orders/${sr?.work_order_id}`).then(r => r.json()),
    { enabled: !!sr?.work_order_id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading...</div>
    </div>
  );

  if (!sr || sr.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">🎫</div>
        <div className="tb-empty-title">Service request not found</div>
        <button onClick={() => router.push("/operations/service-requests")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const pc  = PRIORITY_COLOR[sr.priority] || "#94A3B8";
  const sc  = STATUS_COLOR[sr.status]     || "#94A3B8";
  const wo  = woRaw && !woRaw.detail ? woRaw : null;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1820 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Operations · Service Requests</div>
              <h1 className="tb-hero-title">{sr.title || `SR-${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`}}>{sr.priority||"—"}</span>
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{(sr.status||"—").replace("_"," ")}</span>
                {sr.requester_name && <span className="text-secondary">by {sr.requester_name}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/operations/service-requests")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Priority",  value:(sr.priority||"—").toUpperCase(),        color:pc },
              { label:"Status",    value:(sr.status||"—").replace("_"," ").toUpperCase(), color:sc },
              { label:"Requester", value:sr.requester_name||"—",                  color:"#F1F5F9" },
              { label:"Work Order",value:wo ? "Linked" : "Not Linked",            color:wo?"#34D399":"#94A3B8" },
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
            <div className="tb-section">
              <div className="tb-section-title">Request Details</div>
              <div className="space-y-1">
                {[
                  ["Title",         sr.title || "—"],
                  ["Priority",      sr.priority || "—"],
                  ["Status",        (sr.status||"—").replace("_"," ")],
                  ["Requester",     sr.requester_name || "—"],
                  ["Location",      sr.location || sr.site || "—"],
                  ["Category",      sr.category || sr.type || "—"],
                  ["Created",       fmtDate(sr.created_at)],
                  ["Updated",       fmtDate(sr.updated_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {sr.description && (
              <div className="tb-section">
                <div className="tb-section-title">Description</div>
                <p className="text-sm text-secondary leading-relaxed">{sr.description}</p>
              </div>
            )}

            {wo && (
              <div className="tb-section">
                <div className="tb-section-title">Linked Work Order</div>
                <button
                  onClick={() => router.push("/operations/work-orders/" + wo.id)}
                  className="tb-action-item w-full justify-start hover:border-brand transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-base-alt flex items-center justify-center text-lg flex-shrink-0">🔧</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{wo.title||"—"}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="tb-badge" style={{
                        background:(WO_SC[wo.status]||"#94A3B8")+"18",
                        color:WO_SC[wo.status]||"#94A3B8",
                        fontSize:"0.5rem"
                      }}>{(wo.status||"—").replace("_"," ")}</span>
                      <span className="text-xs text-tertiary">{wo.priority||"—"} priority</span>
                    </div>
                  </div>
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#60A5FA"}}>View →</span>
                </button>
              </div>
            )}

            {!wo && (
              <div className="tb-section" style={{borderColor:"#FBBF2430",background:"#FBBF2408"}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{fontSize:"1.125rem"}}>⚠️</span>
                    <span className="text-sm text-secondary">No work order linked to this request</span>
                  </div>
                  <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">
                    Create WO →
                  </button>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="tb-section">
              <div className="tb-section-title">Status Timeline</div>
              <div className="space-y-3">
                {[
                  { label:"Submitted",   date:sr.created_at,  done:true,                           color:"#60A5FA" },
                  { label:"In Progress", date:sr.updated_at,  done:sr.status==="in_progress"||sr.status==="resolved"||sr.status==="closed", color:"#FBBF24" },
                  { label:"Resolved",    date:sr.resolved_at, done:sr.status==="resolved"||sr.status==="closed", color:"#34D399" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0,
                      background: step.done ? step.color+"30" : "transparent",
                      border: "2px solid " + (step.done ? step.color : "#334155"),
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.625rem", color: step.done ? step.color : "#64748B", fontWeight:900,
                    }}>
                      {step.done ? "✓" : ""}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{color:step.done?step.color:"#64748B"}}>{step.label}</div>
                      {step.date && <div className="text-xs text-tertiary">{fmtDate(step.date)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Requests",    icon:"🎫", path:"/operations/service-requests" },
                  { label:"Work Orders",     icon:"🔧", path:"/operations/work-orders" },
                  { label:"Dispatch Board",  icon:"📋", path:"/operations/dispatch" },
                  { label:"Assets",          icon:"⚙️",  path:"/maintenance/assets" },
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

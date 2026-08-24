"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => {
  if (!d || d === null || d === undefined) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleDateString("en-GB");
  } catch { return "—"; }
};
const fmtDateTime = (d: any) => {
  if (!d || d === null || d === undefined) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleString("en-GB", {dateStyle:"short",timeStyle:"short"});
  } catch { return "—"; }
};

const PRIORITY_COLOR = { critical:"#A84A3D", high:"#B07A2A", medium:"#B07A2A", low:"#6D5F53" };
const STATUS_COLOR   = { open:"#5B7C8C", in_progress:"#B07A2A", resolved:"#547C4D", closed:"#6D5F53" };
const WO_SC          = { open:"#5B7C8C", in_progress:"#B07A2A", completed:"#547C4D" };

export default function ServiceRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: sr, isLoading } = useQuery(
    ["sr-detail", id],
    () => authFetch(`/api/v1/service-requests/${id}`).then(r => (r as any).data ?? r),
    { enabled: !!id }
  );
  const { data: woRaw } = useQuery(
    ["sr-detail-wo", sr?.work_order_id],
    () => authFetch(`/api/v1/work-orders/${sr?.work_order_id}`).then(r => (r as any).data ?? r),
    { enabled: !!sr?.work_order_id }
  );

  const deleteMut = useMutation(
    () => authFetch(`/api/v1/service-requests/${id}`, { method: "DELETE" }),
    { onSuccess: () => router.push("/operations/service-requests") }
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
        <button
          onClick={()=>{ if(window.confirm("Delete this service request? This cannot be undone.")) deleteMut.mutate(); }}
          disabled={deleteMut.isLoading}
          className="tb-btn-secondary"
          style={{borderColor:"#A84A3D",color:"#A84A3D",fontSize:"0.75rem"}}>
          {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
        </button>
      </div>
    </div>
  );

  const pc  = (PRIORITY_COLOR as Record<string, any>)[sr.priority] || "#6D5F53";
  const sc  = (STATUS_COLOR as Record<string, any>)[sr.status]     || "#6D5F53";
  const wo  = woRaw && !woRaw.detail ? woRaw : null;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
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
              { label:"Requester", value:sr.requester_name||"—",                  color:"#221D1A" },
              { label:"Work Order",value:wo ? "Linked" : "Not Linked",            color:wo?"#547C4D":"#6D5F53" },
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
                        background:((WO_SC as Record<string, any>)[wo.status]||"#6D5F53")+"18",
                        color:(WO_SC as Record<string, any>)[wo.status]||"#6D5F53",
                        fontSize:"0.5rem"
                      }}>{(wo.status||"—").replace("_"," ")}</span>
                      <span className="text-xs text-tertiary">{wo.priority||"—"} priority</span>
                    </div>
                  </div>
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#5B7C8C"}}>View →</span>
                </button>
              </div>
            )}

            {!wo && (
              <div className="tb-section" style={{borderColor:"#B07A2A30",background:"#B07A2A08"}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
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
                  { label:"Submitted",   date:sr.created_at,  done:true,                           color:"#5B7C8C" },
                  { label:"In Progress", date:sr.updated_at,  done:sr.status==="in_progress"||sr.status==="resolved"||sr.status==="closed", color:"#B07A2A" },
                  { label:"Resolved",    date:sr.resolved_at, done:sr.status==="resolved"||sr.status==="closed", color:"#547C4D" },
                ].map((step: any, i: any) => (
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

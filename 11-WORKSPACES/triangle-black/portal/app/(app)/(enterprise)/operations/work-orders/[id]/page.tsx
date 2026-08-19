"use client";
// @ts-nocheck
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
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
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const PRIORITY_COLOR = { critical:"#A84A3D", high:"#B07A2A", medium:"#B07A2A", low:"#6D5F53" };
const STATUS_COLOR   = { open:"#5B7C8C", in_progress:"#B07A2A", completed:"#547C4D", cancelled:"#6D5F53" };

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: wo, isLoading } = useQuery(
    ["wo-detail", id],
    () => authFetch(`/api/v1/work-orders/${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  const deleteMut = useMutation(
    () => authFetch(`/api/v1/work-orders/${id}`, { method: "DELETE" }),
    { onSuccess: () => router.push("/operations/work-orders") }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading work order...</div>
    </div>
  );

  if (!wo || wo.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">🔧</div>
        <div className="tb-empty-title">Work order not found</div>
        <button onClick={() => router.push("/operations/work-orders")} className="tb-btn-primary mt-4">Back</button>
            <a href={`/api/v1/pdf/work-order/${id}`} target="_blank" rel="noopener noreferrer" className="tb-btn-secondary" style={{fontSize:"0.75rem",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"4px"}}>📄 Export PDF</a>
        <button
              onClick={()=>{ if(confirm("Delete this work order? This cannot be undone.")) deleteMut.mutate(); }}
              disabled={deleteMut.isLoading}
              className="tb-btn-secondary"
              style={{borderColor:"#A84A3D",color:"#A84A3D",fontSize:"0.75rem"}}>
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
      </div>
    </div>
  );

  const pc = (PRIORITY_COLOR as Record<string, any>)[wo.priority] || "#6D5F53";
  const sc = (STATUS_COLOR as Record<string, any>)[wo.status]   || "#6D5F53";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Operations</div>
              <h1 className="tb-hero-title">{wo.title || `WO-${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`}}>
                  {wo.priority||"—"}
                </span>
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>
                  {(wo.status||"—").replace("_"," ")}
                </span>
                Created {fmtDate(wo.created_at)}
              </p>
            </div>
            <button onClick={() => router.push("/operations/work-orders")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Priority",    value:(wo.priority||"—").toUpperCase(),        color:pc },
              { label:"Status",      value:(wo.status||"—").replace("_"," ").toUpperCase(), color:sc },
              { label:"Technician",  value:wo.technician?.name || "Unassigned",     color:wo.technician?"#547C4D":"#B07A2A" },
              { label:"Due Date",    value:fmtDate(wo.due_date),                    color:"#221D1A" },
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
              <div className="tb-section-title">Work Order Details</div>
              <div className="space-y-1">
                {[
                  ["Title",         wo.title || "—"],
                  ["Type",          wo.type  || "—"],
                  ["Priority",      wo.priority || "—"],
                  ["Status",        (wo.status||"—").replace("_"," ")],
                  ["Created",       fmtDate(wo.created_at)],
                  ["Due Date",      fmtDate(wo.due_date)],
                  ["Started",       fmtDate(wo.started_at)],
                  ["Completed",     fmtDate(wo.completed_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {wo.description && (
              <div className="tb-section">
                <div className="tb-section-title">Description</div>
                <p className="text-sm text-secondary leading-relaxed">{wo.description}</p>
              </div>
            )}

            {wo.asset && (
              <div className="tb-section">
                <div className="tb-section-title">Linked Asset</div>
                <button
                  onClick={() => router.push(`/maintenance/assets/${wo.asset_id}`)}
                  className="tb-action-item w-full justify-start hover:border-brand transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-base-alt flex items-center justify-center text-lg flex-shrink-0">⚙️</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{wo.asset.name || "—"}</div>
                    <div className="text-xs text-tertiary">{wo.asset.category || "—"} · {wo.asset.status || "—"}</div>
                  </div>
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#5B7C8C"}}>View →</span>
                </button>
              </div>
            )}

            {wo.service_request && (
              <div className="tb-section">
                <div className="tb-section-title">Origin Service Request</div>
                <button
                  onClick={() => router.push(`/operations/service-requests/${wo.service_request.id}`)}
                  className="tb-action-item w-full justify-start hover:border-brand transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-base-alt flex items-center justify-center text-lg flex-shrink-0">🎫</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{wo.service_request.title || "—"}</div>
                    <div className="text-xs text-tertiary">{wo.service_request.status || "—"} · {fmtDate(wo.service_request.created_at)}</div>
                  </div>
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#5B7C8C"}}>View →</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {wo.technician && (
              <div className="tb-section">
                <div className="tb-section-title">Assigned Technician</div>
                <button
                  onClick={() => router.push(`/operations/technicians/${wo.technician_id}`)}
                  className="tb-action-item w-full justify-start hover:border-brand transition-colors">
                  <div className="w-10 h-10 rounded-full bg-base-alt flex items-center justify-center text-sm font-black text-secondary flex-shrink-0">
                    {(wo.technician.name||"?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{wo.technician.name || "—"}</div>
                    <div className="text-xs text-tertiary">{wo.technician.specialization || wo.technician.role || "Technician"}</div>
                  </div>
                </button>
              </div>
            )}

            <div className="tb-section">
              <div className="tb-section-title">Status Timeline</div>
              <div className="space-y-3">
                {[
                  { label:"Created",   date:wo.created_at,  done:true,        color:"#5B7C8C" },
                  { label:"Started",   date:wo.started_at,  done:!!wo.started_at,   color:"#B07A2A" },
                  { label:"Completed", date:wo.completed_at,done:wo.status==="completed", color:"#547C4D" },
                ].map((step: any, i: any) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{
                      width:20, height:20, borderRadius:"50%", flexShrink:0,
                      background: step.done ? `${step.color}30` : "transparent",
                      border: `2px solid ${step.done ? step.color : "#334155"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.625rem",
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

            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Work Orders",    icon:"🔧", path:"/operations/work-orders" },
                  { label:"Dispatch Board",     icon:"📋", path:"/operations/dispatch" },
                  { label:"Service Requests",   icon:"🎫", path:"/operations/service-requests" },
                  { label:"Technicians",        icon:"👷", path:"/operations/technicians" },
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

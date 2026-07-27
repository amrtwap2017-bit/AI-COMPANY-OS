"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const PRIORITY_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" };
const STATUS_COLOR   = { open:"#60A5FA", in_progress:"#FBBF24", completed:"#34D399", cancelled:"#94A3B8" };

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: wo, isLoading } = useQuery(
    ["wo-detail", id],
    () => authFetch(`/api/v1/work-orders/${id}`).then(r => r.json()),
    { enabled: !!id }
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
      </div>
    </div>
  );

  const pc = PRIORITY_COLOR[wo.priority] || "#94A3B8";
  const sc = STATUS_COLOR[wo.status]   || "#94A3B8";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1820 100%)"}}>
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
              { label:"Technician",  value:wo.technician?.name || "Unassigned",     color:wo.technician?"#34D399":"#FB923C" },
              { label:"Due Date",    value:fmtDate(wo.due_date),                    color:"#F1F5F9" },
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
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#60A5FA"}}>View →</span>
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
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#60A5FA"}}>View →</span>
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
                  { label:"Created",   date:wo.created_at,  done:true,        color:"#60A5FA" },
                  { label:"Started",   date:wo.started_at,  done:!!wo.started_at,   color:"#FBBF24" },
                  { label:"Completed", date:wo.completed_at,done:wo.status==="completed", color:"#34D399" },
                ].map((step, i) => (
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

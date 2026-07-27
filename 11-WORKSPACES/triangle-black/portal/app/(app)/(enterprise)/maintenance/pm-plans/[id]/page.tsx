"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR  = { active:"#34D399", inactive:"#94A3B8", paused:"#FBBF24" };
const ASSET_SC      = { Operational:"#34D399", "In Fault":"#F87171", "Under Maintenance":"#FBBF24" };

export default function PMPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: plan, isLoading } = useQuery(
    ["pm-detail", id],
    () => authFetch(`/api/v1/maintenance/pm-plans/${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading PM plan...</div>
    </div>
  );

  if (!plan || plan.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📅</div>
        <div className="tb-empty-title">PM Plan not found</div>
        <button onClick={() => router.push("/maintenance/pm-plans")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc      = STATUS_COLOR[plan.status] || "#94A3B8";
  const now     = new Date();
  const dueDate = plan.next_due_ts ? new Date(plan.next_due_ts) : null;
  const isOverdue = dueDate && dueDate < now;
  const daysUntil = dueDate ? Math.ceil((dueDate - now) / 86400000) : null;
  const recentWOs = plan.recent_work_orders || [];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">{plan.title || `PM Plan ${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{plan.status||"—"}</span>
                <span className="text-secondary mr-2">{plan.plan_type||"—"}</span>
                {isOverdue
                  ? <span style={{color:"#F87171"}}>Overdue by {Math.abs(daysUntil)}d</span>
                  : daysUntil !== null
                  ? <span style={{color:daysUntil<7?"#FBBF24":"#94A3B8"}}>Due in {daysUntil}d</span>
                  : null}
              </p>
            </div>
            <button onClick={() => router.push("/maintenance/pm-plans")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Status",    value:plan.status||"—",              color:sc },
              { label:"Type",      value:plan.plan_type||"—",           color:"#60A5FA" },
              { label:"Frequency", value:plan.frequency||"—",           color:"#A78BFA" },
              { label:"Next Due",  value:fmtDate(plan.next_due_ts),     color:isOverdue?"#F87171":daysUntil&&daysUntil<7?"#FBBF24":"#F1F5F9" },
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
        {isOverdue && (
          <div className="tb-section" style={{borderColor:"#F8717140",background:"#F8717108"}}>
            <div className="flex items-center gap-3">
              <span style={{fontSize:"1.25rem"}}>⚠️</span>
              <span className="text-sm font-semibold text-red-400">
                This PM plan is overdue by {Math.abs(daysUntil)} days — was due {fmtDate(plan.next_due_ts)}
              </span>
              <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link ml-auto">Create WO →</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="tb-section">
              <div className="tb-section-title">Plan Details</div>
              <div className="space-y-1">
                {[
                  ["Title",       plan.title || "—"],
                  ["Type",        plan.plan_type || "—"],
                  ["Status",      plan.status || "—"],
                  ["Frequency",   plan.frequency || "—"],
                  ["Owner",       plan.owner || "—"],
                  ["Next Due",    fmtDate(plan.next_due_ts)],
                  ["Created",     fmtDate(plan.created_at)],
                  ["Updated",     fmtDate(plan.updated_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {plan.notes && (
              <div className="tb-section">
                <div className="tb-section-title">Notes</div>
                <p className="text-sm text-secondary leading-relaxed">{plan.notes}</p>
              </div>
            )}

            {plan.asset && (
              <div className="tb-section">
                <div className="tb-section-title">Linked Asset</div>
                <button
                  onClick={() => router.push(`/maintenance/assets/${plan.asset_node_id}`)}
                  className="tb-action-item w-full justify-start hover:border-brand transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-base-alt flex items-center justify-center text-lg flex-shrink-0">⚙️</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{plan.asset.name||"—"}</div>
                    <div className="text-xs text-tertiary flex items-center gap-2">
                      <span>{plan.asset.category||"—"}</span>
                      <span className="tb-badge" style={{
                        background:`${ASSET_SC[plan.asset.status]||"#94A3B8"}18`,
                        color:ASSET_SC[plan.asset.status]||"#94A3B8",
                        fontSize:"0.5rem"
                      }}>{plan.asset.status||"—"}</span>
                    </div>
                  </div>
                  <span className="tb-badge ml-auto" style={{fontSize:"0.625rem",color:"#60A5FA"}}>View →</span>
                </button>
              </div>
            )}

            {recentWOs.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-title">Related Work Orders</div>
                <div className="space-y-2 mt-2">
                  {recentWOs.map((wo, i) => {
                    const pc  = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" }[wo.priority] || "#94A3B8";
                    const wsc = { open:"#60A5FA", in_progress:"#FBBF24", completed:"#34D399" }[wo.status] || "#94A3B8";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="tb-priority-bar" style={{background:pc}}/>
                          <span className="text-sm text-secondary truncate">{wo.title||"—"}</span>
                        </div>
                        <span className="tb-badge" style={{background:`${wsc}18`,color:wsc,border:`1px solid ${wsc}30`,fontSize:"0.5625rem",flexShrink:0}}>
                          {(wo.status||"—").replace("_"," ")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Schedule Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:isOverdue?"#F87171":daysUntil&&daysUntil<7?"#FBBF24":"#34D399"}}>
                  {isOverdue ? "!" : daysUntil !== null && daysUntil < 7 ? "⚠" : "✓"}
                </div>
                <div className="text-sm font-bold" style={{color:isOverdue?"#F87171":"#34D399"}}>
                  {isOverdue ? "OVERDUE" : "ON SCHEDULE"}
                </div>
                <div className="text-xs text-tertiary mt-1">
                  {isOverdue ? `${Math.abs(daysUntil)} days past due` : daysUntil !== null ? `${daysUntil} days until due` : "—"}
                </div>
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All PM Plans",    icon:"📅", path:"/maintenance/pm-plans" },
                  { label:"Assets",          icon:"⚙️",  path:"/maintenance/assets" },
                  { label:"Asset Tree",      icon:"🌳", path:"/maintenance/asset-tree" },
                  { label:"Work Orders",     icon:"🔧", path:"/operations/work-orders" },
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

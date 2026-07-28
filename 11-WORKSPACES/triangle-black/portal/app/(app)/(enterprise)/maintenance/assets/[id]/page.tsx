"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR = {
  Operational:"#34D399", "In Fault":"#F87171", "Under Maintenance":"#FBBF24", Inactive:"#94A3B8"
};
const PRIORITY_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"#94A3B8" };
const WO_STATUS_COLOR = { open:"#60A5FA", in_progress:"#FBBF24", completed:"#34D399", cancelled:"#94A3B8" };

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: asset, isLoading } = useQuery(
    ["asset-detail", id],
    () => authFetch(`/api/v1/assets-portal${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading asset...</div>
    </div>
  );

  if (!asset || asset.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">⚙️</div>
        <div className="tb-empty-title">Asset not found</div>
        <button onClick={() => router.push("/maintenance/assets")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc   = STATUS_COLOR[asset.status] || "#94A3B8";
  const wos  = asset.work_orders || [];
  const pms  = asset.pm_plans || [];
  const openWOs = wos.filter(w => w.status !== "completed").length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">{asset.name || `Asset ${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{asset.status||"—"}</span>
                {asset.category && <span className="text-secondary mr-2">{asset.category}</span>}
                {asset.location && <span className="text-tertiary">{asset.location}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/maintenance/assets")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Status",       value:asset.status||"—",       color:sc },
              { label:"Category",     value:asset.category||"—",     color:"#60A5FA" },
              { label:"Work Orders",  value:wos.length,               color:openWOs>0?"#FBBF24":"#34D399" },
              { label:"PM Plans",     value:pms.length,               color:"#A78BFA" },
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
              <div className="tb-section-title">Asset Details</div>
              <div className="space-y-1">
                {[
                  ["Name",            asset.name || "—"],
                  ["Asset Tag",       asset.asset_tag || "—"],
                  ["Category",        asset.category || "—"],
                  ["Status",          asset.status || "—"],
                  ["Location",        asset.location || "—"],
                  ["Manufacturer",    asset.manufacturer || "—"],
                  ["Model",           asset.model || "—"],
                  ["Serial Number",   asset.serial_number || "—"],
                  ["Install Date",    fmtDate(asset.installation_date || asset.install_date)],
                  ["Last Maintenance",fmtDate(asset.last_maintenance_date)],
                  ["Next Maintenance",fmtDate(asset.next_maintenance_date)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {wos.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Work Order History ({wos.length})</div>
                  <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All →</button>
                </div>
                <div className="tb-table" style={{borderRadius:12,overflow:"hidden",marginTop:12}}>
                  <div className="tb-table-head" style={{gridTemplateColumns:"2fr 80px 90px 110px"}}>
                    {["Work Order","Priority","Status","Date"].map((h, i) => (
                      <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {wos.map((wo, i) => {
                    const pc  = PRIORITY_COLOR[wo.priority]  || "#94A3B8";
                    const wsc = WO_STATUS_COLOR[wo.status]   || "#94A3B8";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                        className="tb-table-row"
                        style={{gridTemplateColumns:"2fr 80px 90px 110px"}}>
                        <div className="flex items-center gap-2 pr-4 min-w-0">
                          <div className="tb-priority-bar" style={{background:pc}}/>
                          <div className="text-sm font-medium text-primary truncate">{wo.title||"—"}</div>
                        </div>
                        <div className="text-center">
                          <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.5625rem"}}>{wo.priority||"—"}</span>
                        </div>
                        <div className="text-center">
                          <span className="tb-badge" style={{background:`${wsc}18`,color:wsc,border:`1px solid ${wsc}30`,fontSize:"0.5625rem"}}>{(wo.status||"—").replace("_"," ")}</span>
                        </div>
                        <div className="text-center text-xs text-tertiary">{fmtDate(wo.created_at)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pms.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>PM Plans ({pms.length})</div>
                  <button onClick={() => router.push("/maintenance/pm-plans")} className="tb-section-link">All →</button>
                </div>
                <div className="space-y-2 mt-3">
                  {pms.map((pm, i) => {
                    const now = new Date();
                    const due = pm.next_due_ts ? new Date(pm.next_due_ts) : null;
                    const isOverdue = due && due < now;
                    return (
                      <button key={i}
                        onClick={() => router.push(`/maintenance/pm-plans/${pm.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">📅</span>
                          <div className="min-w-0">
                            <div className="text-sm text-secondary truncate">{pm.title||"—"}</div>
                            <div className="text-xs text-tertiary">{pm.plan_type||"—"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isOverdue && <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem"}}>Overdue</span>}
                          <span className="text-xs text-tertiary">{fmtDate(pm.next_due_ts)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Health Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:sc}}>
                  {asset.status === "Operational" ? "✓" : asset.status === "In Fault" ? "✗" : "⚠"}
                </div>
                <div className="text-sm font-bold" style={{color:sc}}>{asset.status||"—"}</div>
                {asset.last_maintenance_date && (
                  <div className="text-xs text-tertiary mt-2">Last serviced {fmtDate(asset.last_maintenance_date)}</div>
                )}
              </div>
              {openWOs > 0 && (
                <div className="mt-2 p-2 rounded-lg text-center" style={{background:"#FBBF2410",border:"1px solid #FBBF2430"}}>
                  <div className="text-xs" style={{color:"#FBBF24"}}>{openWOs} active work order{openWOs>1?"s":""}</div>
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Assets",      icon:"⚙️",  path:"/maintenance/assets" },
                  { label:"Asset Tree",      icon:"🌳", path:"/maintenance/asset-tree" },
                  { label:"PM Plans",        icon:"📅", path:"/maintenance/pm-plans" },
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

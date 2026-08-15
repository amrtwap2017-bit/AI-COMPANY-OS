"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR   = {Operational:"#547C4D","In Fault":"#A84A3D","Under Maintenance":"#B07A2A",Inactive:"#6D5F53"};
const PRIORITY_COLOR = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#6D5F53"};
const WO_STATUS_COLOR= {open:"#5B7C8C",in_progress:"#B07A2A",completed:"#547C4D",cancelled:"#6D5F53"};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: asset, isLoading } = useQuery(
    ["asset-detail", id],
    () => authFetch(`/api/v1/assets/${id}`).then(r=>r.json()),
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
        <button onClick={()=>router.push("/maintenance/assets")} className="tb-btn tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc     = STATUS_COLOR[asset.status] || "#6D5F53";
  const wos    = asset.work_orders || [];
  const pms    = asset.pm_plans    || [];
  const openWOs= wos.filter(w=>w.status!=="completed").length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">{asset.name || `Asset ${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{asset.status||"—"}</span>
                {asset.category && <span className="text-secondary mr-2">{asset.category}</span>}
                {asset.location && <span className="text-tertiary">{asset.location}</span>}
              </p>
            </div>
            <button onClick={()=>router.push("/maintenance/assets")} className="tb-btn tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Status",      value:asset.status||"—", color:sc},
              {label:"Category",    value:asset.category||"—",color:"var(--color-info)"},
              {label:"Work Orders", value:wos.length,         color:openWOs>0?"var(--color-warning)":"var(--color-success)"},
              {label:"PM Plans",    value:pms.length,         color:"var(--color-brand)"},
            ].map((k,i)=>(
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
          <div className="xl:col-span-2 flex flex-col gap-5">

            <div className="tb-section">
              <div className="tb-section-title">Asset Details</div>
              {[
                ["Name",             asset.name||"—"],
                ["Asset Tag",        asset.asset_tag||"—"],
                ["Category",         asset.category||"—"],
                ["Status",           asset.status||"—"],
                ["Location",         asset.location||"—"],
                ["Manufacturer",     asset.manufacturer||"—"],
                ["Model",            asset.model||"—"],
                ["Serial Number",    asset.serial_number||"—"],
                ["Install Date",     fmtDate(asset.installation_date||asset.install_date)],
                ["Last Maintenance", fmtDate(asset.last_maintenance_date)],
                ["Next Maintenance", fmtDate(asset.next_maintenance_date)],
              ].map(([l,v],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{l}</span>
                  <span className="tb-detail-value">{v}</span>
                </div>
              ))}
            </div>

            {wos.length > 0 && (
              <div className="tb-section">
                <div className="flex justify-between items-center mb-3">
                  <div className="tb-section-title" style={{marginBottom:0}}>Work Order History ({wos.length})</div>
                  <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">All →</button>
                </div>
                <div className="tb-table-wrap mt-3">
                  <table className="tb-table">
                    <thead>
                      <tr>
                        <th>Work Order</th>
                        <th style={{textAlign:"center"}}>Priority</th>
                        <th style={{textAlign:"center"}}>Status</th>
                        <th style={{textAlign:"center"}}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wos.map((wo,i)=>{
                        const pc  = PRIORITY_COLOR[wo.priority]  || "#6D5F53";
                        const wsc = WO_STATUS_COLOR[wo.status]   || "#6D5F53";
                        return (
                          <tr key={i} onClick={()=>router.push(`/operations/work-orders/${wo.id}`)} className="cursor-pointer">
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 rounded-full flex-shrink-0" style={{background:pc}}/>
                                <span className="text-sm font-medium text-primary truncate">{wo.title||"—"}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.5625rem"}}>{wo.priority||"—"}</span>
                            </td>
                            <td className="text-center">
                              <span className="tb-badge" style={{background:`${wsc}18`,color:wsc,border:`1px solid ${wsc}30`,fontSize:"0.5625rem"}}>{(wo.status||"—").replace("_"," ")}</span>
                            </td>
                            <td className="text-center text-xs text-tertiary">{fmtDate(wo.created_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {pms.length > 0 && (
              <div className="tb-section">
                <div className="flex justify-between items-center mb-3">
                  <div className="tb-section-title" style={{marginBottom:0}}>PM Plans ({pms.length})</div>
                  <button onClick={()=>router.push("/maintenance/pm-plans")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">All →</button>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  {pms.map((pm,i)=>{
                    const now = new Date();
                    const due = pm.next_due_ts ? new Date(pm.next_due_ts) : null;
                    const isOvd = due && due < now;
                    return (
                      <button key={i} onClick={()=>router.push(`/maintenance/pm-plans/${pm.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">📅</span>
                          <div className="min-w-0">
                            <div className="text-sm text-secondary truncate">{pm.title||"—"}</div>
                            <div className="text-xs text-tertiary">{pm.plan_type||"—"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isOvd && <span className="tb-badge tb-badge-danger" style={{fontSize:"0.5rem"}}>Overdue</span>}
                          <span className="text-xs text-tertiary">{fmtDate(pm.next_due_ts)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Health Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:sc}}>
                  {asset.status==="Operational"?"✓":asset.status==="In Fault"?"✗":"⚠"}
                </div>
                <div className="text-sm font-bold" style={{color:sc}}>{asset.status||"—"}</div>
                {asset.last_maintenance_date && (
                  <div className="text-xs text-tertiary mt-2">Last serviced {fmtDate(asset.last_maintenance_date)}</div>
                )}
              </div>
              {openWOs > 0 && (
                <div className="tb-alert tb-alert-warning mt-2">
                  <span className="text-xs font-bold">{openWOs} active work order{openWOs>1?"s":""}</span>
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="flex flex-col gap-2">
                {[
                  {label:"All Assets",  icon:"⚙️", path:"/maintenance/assets"},
                  {label:"Asset Tree",  icon:"🌳",  path:"/maintenance/asset-tree"},
                  {label:"PM Plans",    icon:"📅",  path:"/maintenance/pm-plans"},
                  {label:"Work Orders", icon:"🔧",  path:"/operations/work-orders"},
                ].map((a,i)=>(
                  <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start">
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

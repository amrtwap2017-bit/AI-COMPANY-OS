"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtRelative = (d: any) => {
  if (!d) return "";
  try {
    const ms = Date.now()-new Date(d).getTime();
    const m  = Math.floor(ms/60000);
    if (m<1)  return "just now";
    if (m<60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h<24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  } catch { return ""; }
};

const TYPE_CONFIG = {
  alert:   {icon:"🚨",color:"#A84A3D",bg:"#A84A3D10"},
  warning: {icon:"⚠️",color:"#B07A2A",bg:"#B07A2A10"},
  info:    {icon:"ℹ️",color:"#5B7C8C",bg:"#5B7C8C10"},
  success: {icon:"✅",color:"#547C4D",bg:"#547C4D10"},
};

export default function NotificationsPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const { data: notifData, isLoading } = useQuery(
    ["notifications"],
    ()=>authFetch("/api/v1/platform-notif/").then(r => (r as any).data ?? r),
    {staleTime:15000,refetchInterval:30000}
  );

  const generateMut = useMutation(
    ()=>authFetch("/api/v1/platform-notif/generate",{method:"POST"}).then(r => (r as any).data ?? r),
    {onSuccess:()=>qc.invalidateQueries(["notifications"])}
  );
  const readMut = useMutation(
    (id)=>authFetch(`/api/v1/platform-notif/${id}/read`,{method:"POST"}).then(r => (r as any).data ?? r),
    {onSuccess:()=>qc.invalidateQueries(["notifications"])}
  );
  const readAllMut = useMutation(
    ()=>authFetch("/api/v1/platform-notif/mark-all-read",{method:"POST"}).then(r => (r as any).data ?? r),
    {onSuccess:()=>qc.invalidateQueries(["notifications"])}
  );

  const notifications = notifData?.notifications||[];
  const unread        = notifData?.unread_count||0;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Platform Intelligence</div>
              <h1 className="tb-hero-title">Notifications</h1>
              <p className="tb-hero-description">{unread} unread · {notifications.length} total</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>generateMut.mutate()} disabled={generateMut.isLoading} className="tb-btn tb-btn-secondary tb-btn-sm">
                {generateMut.isLoading?"Scanning…":"⚡ Scan Platform"}
              </button>
              {unread>0&&(
                <button onClick={()=>readAllMut.mutate()} className="tb-btn tb-btn-primary tb-btn-sm">
                  ✓ Mark All Read
                </button>
              )}
            </div>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Total",    value:notifications.length,                                       color:"var(--color-text-2)"},
              {label:"Unread",   value:unread,                                                     color:unread>0?"var(--color-warning)":"var(--color-success)"},
              {label:"Alerts",   value:notifications.filter((n: any) =>n.type==="alert").length,           color:"var(--color-danger)"},
              {label:"Critical", value:notifications.filter((n: any) =>n.priority==="critical").length,    color:notifications.filter((n: any) =>n.priority==="critical").length>0?"var(--color-danger)":"var(--color-success)"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {generateMut.data&&(
          <div className="tb-alert tb-alert-success mb-4">
            <span>✅</span>
            <span className="text-sm font-bold">Scan complete — {generateMut.data.created} new notifications generated</span>
          </div>
        )}

        <div className="tb-section">
          {isLoading ? (
            <div className="flex flex-col gap-3">{[1,2,3,4].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:64}}/>)}</div>
          ) : notifications.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🔔</div>
              <div className="tb-empty-title">No notifications yet</div>
              <div className="tb-empty-desc">Click Scan Platform to generate notifications from live data</div>
              <button onClick={()=>generateMut.mutate()} className="tb-btn tb-btn-primary mt-4">⚡ Scan Platform Now</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((notif: any, i: any) =>{
                const cfg = (TYPE_CONFIG as Record<string, any>)[notif.type]||TYPE_CONFIG.info;
                return (
                  <div key={i}
                    className="flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer tb-hover-lift"
                    style={{background:notif.is_read?"transparent":cfg.bg,borderColor:notif.is_read?"rgba(255,255,255,0.06)":cfg.color+"30",opacity:notif.is_read?0.6:1}}
                    onClick={()=>{if(!notif.is_read)readMut.mutate(notif.id);if(notif.entity_url)router.push(notif.entity_url);}}>
                    <span className="text-xl flex-shrink-0">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-bold text-primary">{notif.title}</div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notif.is_read&&<div className="w-2 h-2 rounded-full" style={{background:cfg.color}}/>}
                          <span className="text-xs text-tertiary">{fmtRelative(notif.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-secondary mt-0.5">{notif.message}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {notif.entity_type&&(
                          <span className="tb-badge" style={{fontSize:"0.45rem",background:"rgba(255,255,255,0.06)"}}>
                            {notif.entity_type.replace(/_/g," ")}
                          </span>
                        )}
                        <span className="tb-badge" style={{fontSize:"0.45rem",background:cfg.color+"18",color:cfg.color}}>{notif.type}</span>
                        {notif.priority==="critical"&&(
                          <span className="tb-badge tb-badge-danger" style={{fontSize:"0.45rem"}}>CRITICAL</span>
                        )}
                        {notif.entity_url&&<span className="text-xs text-brand ml-auto">View →</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtTimeAgo = (d) => {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), dy = Math.floor(diff/86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${dy}d ago`;
  } catch { return "—"; }
};

const TYPE_META = {
  work_order_created:       { icon:"🔧", color:"#60A5FA", label:"Work Order",  path:"/operations/work-orders" },
  work_order_completed:     { icon:"✅", color:"#34D399", label:"Completed",   path:"/operations/work-orders" },
  contract_expiring:        { icon:"⏰", color:"#FBBF24", label:"Contract",    path:"/commercial/contracts" },
  contract_renewed:         { icon:"🔄", color:"#A78BFA", label:"Renewal",     path:"/commercial/contracts" },
  purchase_request_created: { icon:"🛒", color:"#F97316", label:"Procurement", path:"/supply-chain/purchase-requests" },
  lead_created:             { icon:"👤", color:"#EC4899", label:"CRM",         path:"/commercial/leads" },
  asset_fault:              { icon:"⚙️",  color:"#F87171", label:"Asset",       path:"/maintenance/assets" },
  pm_overdue:               { icon:"📅", color:"#FB923C", label:"Maintenance", path:"/maintenance/pm-plans" },
};

export default function InboxPage() {
  const router = useRouter();

  const { data: notifRaw, isLoading } = useQuery(
    ["inbox-notifs"],
    () => authFetch("/api/v1/notifications/?limit=100").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const { data: actRaw } = useQuery(
    ["inbox-activity"],
    () => authFetch("/api/v1/activity-feed?limit=20").then(r => r.json())
  );

  const notifs     = toArr(notifRaw);
  const activities = actRaw?.activities || [];
  const unread     = notifs.filter(n => !n.is_read);
  const critical   = notifs.filter(n => !n.is_read && (
    n.type === "contract_expiring" || n.type === "asset_fault" || n.type === "pm_overdue"
  ));

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0E28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Platform</div>
              <h1 className="tb-hero-title">Inbox</h1>
              <p className="tb-hero-description">Platform alerts, notifications, and activity feed</p>
            </div>
            <button onClick={() => router.push("/notifications")} className="tb-btn-primary">
              All Notifications
            </button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total",    value:notifs.length,  color:"#F1F5F9" },
              { label:"Unread",   value:unread.length,  color:unread.length>0?"#FBBF24":"#34D399" },
              { label:"Critical", value:critical.length,color:critical.length>0?"#F87171":"#34D399" },
              { label:"Activity", value:activities.length, color:"#A78BFA" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Unread notifications */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Alerts</div>
                <div className="tb-section-title" style={{marginBottom:0}}>
                  Unread ({unread.length})
                </div>
              </div>
              <button onClick={() => router.push("/notifications")} className="tb-section-link">All →</button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}
              </div>
            ) : unread.length === 0 ? (
              <div className="tb-empty" style={{padding:"32px 0"}}>
                <div className="tb-empty-icon" style={{fontSize:"2.5rem"}}>✅</div>
                <div className="tb-empty-desc">Inbox clear — no unread notifications</div>
              </div>
            ) : (
              <div className="space-y-1">
                {unread.slice(0,8).map((n, i) => {
                  const meta = TYPE_META[n.type] || { icon:"🔔", color:"#A78BFA", label:"System", path:"/workspace" };
                  return (
                    <button key={i}
                      onClick={() => router.push(meta.path)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left"
                      style={{borderLeft:`3px solid ${meta.color}`}}>
                      <div style={{
                        width:32, height:32, borderRadius:8, flexShrink:0,
                        background:`${meta.color}18`, border:`1px solid ${meta.color}30`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.875rem"
                      }}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div className="text-sm font-semibold text-primary truncate">{n.title}</div>
                          <div className="text-xs text-tertiary flex-shrink-0">{fmtTimeAgo(n.created_at)}</div>
                        </div>
                        {n.message && <div className="text-xs text-secondary mt-0.5 truncate">{n.message}</div>}
                      </div>
                    </button>
                  );
                })}
                {unread.length > 8 && (
                  <button onClick={() => router.push("/notifications")}
                    className="w-full text-center text-xs text-brand py-2 hover:text-primary transition-colors">
                    + {unread.length - 8} more unread notifications →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Feed</div>
                <div className="tb-section-title" style={{marginBottom:0}}>Recent Activity</div>
              </div>
              <button onClick={() => router.push("/workspace")} className="tb-section-link">Workspace →</button>
            </div>
            <div className="space-y-2">
              {activities.length === 0 ? (
                <div className="tb-empty" style={{padding:"32px 0"}}>
                  <div className="tb-empty-icon" style={{fontSize:"2rem"}}>📋</div>
                  <div className="tb-empty-desc">No recent activity</div>
                </div>
              ) : activities.slice(0,10).map((act, i) => (
                <button key={i}
                  onClick={() => act.path && router.push(act.path)}
                  className="w-full flex items-start gap-3 text-left p-2 rounded-xl hover:bg-base-alt transition-colors">
                  <div style={{
                    width:32, height:32, borderRadius:8, flexShrink:0,
                    background:`${act.color}18`, border:`1px solid ${act.color}30`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.875rem"
                  }}>
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="text-sm font-semibold text-primary truncate">{act.title}</div>
                      <div className="text-xs text-tertiary flex-shrink-0">{fmtTimeAgo(act.time)}</div>
                    </div>
                    {act.description && (
                      <div className="text-xs text-tertiary mt-0.5 truncate">{act.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate to Domain</div>
          <div className="tb-grid-4" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
            {[
              { label:"Work Orders",  icon:"🔧", path:"/operations/work-orders" },
              { label:"Contracts",    icon:"📄", path:"/commercial/contracts" },
              { label:"Assets",       icon:"⚙️",  path:"/maintenance/assets" },
              { label:"PM Plans",     icon:"📅", path:"/maintenance/pm-plans" },
              { label:"Procurement",  icon:"🛒", path:"/supply-chain/purchase-requests" },
              { label:"Workspace",    icon:"🏠", path:"/workspace" },
            ].map((a, i) => (
              <button key={i} onClick={() => router.push(a.path)}
                className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

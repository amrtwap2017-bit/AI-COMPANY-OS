"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtAgo = (d) => {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), dy = Math.floor(diff/86400000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    if (h < 24) return h + "h ago";
    return dy + "d ago";
  } catch { return "—"; }
};

const TMETA = {
  work_order_created:      { icon:"🔧", color:"#60A5FA", path:"/operations/work-orders" },
  work_order_completed:    { icon:"✅", color:"#34D399", path:"/operations/work-orders" },
  contract_expiring:       { icon:"⏰", color:"#FBBF24", path:"/commercial/contracts" },
  contract_renewed:        { icon:"🔄", color:"#A78BFA", path:"/commercial/contracts" },
  purchase_request_created:{ icon:"🛒", color:"#F97316", path:"/supply-chain/purchase-requests" },
  lead_created:            { icon:"👤", color:"#EC4899", path:"/commercial/leads" },
  asset_fault:             { icon:"⚙️",  color:"#F87171", path:"/maintenance/assets" },
  pm_overdue:              { icon:"📅", color:"#FB923C", path:"/maintenance/pm-plans" },
};

export default function InboxPage() {
  const router = useRouter();
  const [notifs,     setNotifs]     = useState([]);
  const [activities, setActivities] = useState([]);
  const [nLoaded,    setNLoaded]    = useState(false);
  const [aLoaded,    setALoaded]    = useState(false);

  useEffect(() => {
    // authFetch automatically adds Authorization: Bearer <token> header
    authFetch("/api/v1/notifications/?limit=30")
      .then(r => r.json())
      .then(d => {
        setNotifs(Array.isArray(d) ? d : d?.items || d?.data || []);
        setNLoaded(true);
      })
      .catch(() => setNLoaded(true));

    authFetch("/api/v1/activity-feed?limit=10")
      .then(r => r.json())
      .then(d => {
        setActivities(d?.activities || []);
        setALoaded(true);
      })
      .catch(() => setALoaded(true));
  }, []);

  const unread   = notifs.filter(n => !n.is_read);
  const critical = notifs.filter(n => !n.is_read &&
    ["contract_expiring","asset_fault","pm_overdue"].includes(n.type));

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#1A0E28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Platform</div>
              <h1 className="tb-hero-title">Inbox</h1>
              <p className="tb-hero-description">Platform alerts and recent activity</p>
            </div>
            <button onClick={() => router.push("/notifications")} className="tb-btn-primary">
              All Notifications
            </button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total",    value:notifs.length,    color:"#F1F5F9" },
              { label:"Unread",   value:unread.length,    color:unread.length>0?"#FBBF24":"#34D399" },
              { label:"Critical", value:critical.length,  color:critical.length>0?"#F87171":"#34D399" },
              { label:"Activity", value:activities.length,color:"#A78BFA" },
            ].map((k,i) => (
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

          {/* Unread Notifications */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Alerts</div>
                <div className="tb-section-title" style={{marginBottom:0}}>
                  Unread ({unread.length})
                </div>
              </div>
              <button onClick={() => router.push("/notifications")} className="tb-section-link">
                All →
              </button>
            </div>

            {!nLoaded ? (
              <div className="space-y-2 mt-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>
                ))}
              </div>
            ) : unread.length === 0 ? (
              <div className="tb-empty" style={{padding:"24px 0"}}>
                <div style={{fontSize:"2.5rem"}}>✅</div>
                <div className="tb-empty-desc">Inbox clear</div>
              </div>
            ) : (
              <div className="space-y-1 mt-3">
                {unread.slice(0, 6).map((n, i) => {
                  const m = TMETA[n.type] || { icon:"🔔", color:"#A78BFA", path:"/workspace" };
                  return (
                    <button key={i} onClick={() => router.push(m.path)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left"
                      style={{borderLeft: "3px solid " + m.color}}>
                      <div style={{width:32,height:32,borderRadius:8,flexShrink:0,
                        background:m.color+"18",display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:"0.875rem"}}>
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div className="text-sm font-semibold text-primary truncate">{n.title}</div>
                          <div className="text-xs text-tertiary flex-shrink-0">{fmtAgo(n.created_at)}</div>
                        </div>
                        {n.message && (
                          <div className="text-xs text-secondary mt-0.5 truncate">{n.message}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {unread.length > 6 && (
                  <button onClick={() => router.push("/notifications")}
                    className="w-full text-center text-xs text-brand py-2 hover:text-primary transition-colors">
                    +{unread.length - 6} more →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Feed</div>
                <div className="tb-section-title" style={{marginBottom:0}}>Recent Activity</div>
              </div>
              <button onClick={() => router.push("/workspace")} className="tb-section-link">
                Workspace →
              </button>
            </div>

            {!aLoaded ? (
              <div className="space-y-2 mt-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 bg-base-alt rounded-xl animate-pulse"/>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="tb-empty" style={{padding:"24px 0"}}>
                <div style={{fontSize:"2rem"}}>📋</div>
                <div className="tb-empty-desc">No recent activity</div>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {activities.map((act, i) => (
                  <button key={i} onClick={() => act.path && router.push(act.path)}
                    className="w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-base-alt transition-colors">
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,
                      background:act.color+"18",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:"0.875rem"}}>
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="text-sm font-semibold text-primary truncate">{act.title}</div>
                        <div className="text-xs text-tertiary flex-shrink-0">{fmtAgo(act.time)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Nav */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Quick Navigation</div>
          <div className="tb-grid-4" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
            {[
              { label:"Work Orders", icon:"🔧", path:"/operations/work-orders" },
              { label:"Contracts",   icon:"📄", path:"/commercial/contracts" },
              { label:"Assets",      icon:"⚙️",  path:"/maintenance/assets" },
              { label:"PM Plans",    icon:"📅", path:"/maintenance/pm-plans" },
              { label:"Procurement", icon:"🛒", path:"/supply-chain/purchase-requests" },
              { label:"Workspace",   icon:"🏠", path:"/workspace" },
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

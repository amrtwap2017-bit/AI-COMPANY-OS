"use client";
// @ts-nocheck
import { useState } from "react";
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
  work_order_created:       { icon:"🔧", color:"#60A5FA", label:"Work Order" },
  work_order_completed:     { icon:"✅", color:"#34D399", label:"Completed" },
  contract_expiring:        { icon:"⏰", color:"#FBBF24", label:"Contract" },
  contract_renewed:         { icon:"🔄", color:"#A78BFA", label:"Renewal" },
  purchase_request_created: { icon:"🛒", color:"#F97316", label:"Procurement" },
  lead_created:             { icon:"👤", color:"#EC4899", label:"CRM" },
  asset_fault:              { icon:"⚙️",  color:"#F87171", label:"Asset" },
  pm_overdue:               { icon:"📅", color:"#FB923C", label:"Maintenance" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");

  const { data: notifRaw, isLoading } = useQuery(
    ["notif-list"],
    () => authFetch("/api/v1/notifications-portal?limit=200").then(r => r.json()),
    { refetchInterval: 30000 }
  );

  const notifs  = toArr(notifRaw);
  const unread  = notifs.filter(n => !n.is_read).length;
  const types   = [...new Set(notifs.map(n => n.type).filter(Boolean))];

  const filtered = notifs.filter(n => {
    const matchType = filterType === "all" || n.type === filterType;
    const matchRead = filterRead === "all"
      || (filterRead === "unread" && !n.is_read)
      || (filterRead === "read"   &&  n.is_read);
    return matchType && matchRead;
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0E28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Platform</div>
              <h1 className="tb-hero-title">Notifications</h1>
              <p className="tb-hero-description">{notifs.length} total · {unread} unread · {types.length} types</p>
            </div>
            <div className={`tb-score-badge ${unread === 0 ? "tb-score-badge--success" : "tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:unread===0?"#34D399":"#FBBF24"}}>{unread}</div>
              <div className="tb-score-label">Unread</div>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total",  value:notifs.length,        color:"#F1F5F9" },
              { label:"Unread", value:unread,               color:unread>0?"#FBBF24":"#34D399" },
              { label:"Read",   value:notifs.length-unread, color:"#94A3B8" },
              { label:"Types",  value:types.length,         color:"#A78BFA" },
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
        <div className="tb-section">
          <div className="tb-flex-between gap-4 flex-wrap">
            <div className="flex gap-2">
              {["all","unread","read"].map(f => (
                <button key={f} onClick={() => setFilterRead(f)}
                  className={`tb-pill ${filterRead === f ? "tb-pill--active" : ""}`}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                  {f === "unread" && unread > 0 && <span className="ml-1 opacity-80">{unread}</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterType("all")}
                className={`tb-pill text-xs ${filterType === "all" ? "tb-pill--active" : ""}`}>
                All Types
              </button>
              {types.slice(0,6).map(t => {
                const meta = TYPE_META[t] || { icon:"🔔", color:"#94A3B8" };
                return (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`tb-pill text-xs ${filterType === t ? "tb-pill--active" : ""}`}>
                    {meta.icon} {t.replace(/_/g," ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-flex-between mb-4">
            <div className="text-sm text-secondary">{filtered.length} notifications</div>
            <button onClick={() => router.push("/workspace")} className="tb-section-link">Workspace →</button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🔔</div>
              <div className="tb-empty-title">No notifications</div>
              <div className="tb-empty-desc">All caught up — no notifications match your filters</div>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((n, i) => {
                const meta = TYPE_META[n.type] || { icon:"🔔", color:"#A78BFA", label:"System" };
                return (
                  <div key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${!n.is_read ? "bg-base-alt" : "hover:bg-base-alt"}`}
                    style={!n.is_read ? {borderLeft:`3px solid ${meta.color}`} : {}}>
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background:`${meta.color}18`, border:`1px solid ${meta.color}30`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem"
                    }}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-primary truncate">{n.title}</div>
                        <div className="text-xs text-tertiary flex-shrink-0">{fmtTimeAgo(n.created_at)}</div>
                      </div>
                      {n.message && (
                        <div className="text-xs text-secondary mt-0.5 line-clamp-2">{n.message}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="tb-badge" style={{background:`${meta.color}18`,color:meta.color,border:`1px solid ${meta.color}30`,fontSize:"0.5625rem"}}>
                          {meta.label}
                        </span>
                        {!n.is_read && (
                          <span className="tb-badge tb-badge--warning" style={{fontSize:"0.5625rem"}}>New</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="tb-section">
          <div className="tb-section-title">By Type</div>
          <div className="tb-grid-3">
            {types.map(t => {
              const meta = TYPE_META[t] || { icon:"🔔", color:"#94A3B8", label:t };
              const cnt      = notifs.filter(n => n.type === t).length;
              const unreadCnt= notifs.filter(n => n.type === t && !n.is_read).length;
              return (
                <button key={t}
                  onClick={() => setFilterType(filterType === t ? "all" : t)}
                  className={`tb-section text-left transition-colors ${filterType === t ? "border-brand" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{fontSize:"1.25rem"}}>{meta.icon}</span>
                    <span className="text-xs text-secondary">{t.replace(/_/g," ")}</span>
                  </div>
                  <div className="text-2xl font-black" style={{color:meta.color}}>{cnt}</div>
                  {unreadCnt > 0 && (
                    <div className="text-xs text-tertiary mt-1">{unreadCnt} unread</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

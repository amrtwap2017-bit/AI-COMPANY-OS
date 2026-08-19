"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function DailyReviewPage() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-GB",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const { data: woRaw }   = useQuery(["dr-wos"],   () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: notifRaw }= useQuery(["dr-notifs"],() => authFetch("/api/v1/notifications-portal?limit=50").then(r => r.json()));
  const { data: twin }    = useQuery(["dr-twin"],  () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: actRaw }  = useQuery(["dr-act"],   () => authFetch("/api/v1/activity-feed?limit=15").then(r => r.json()));
  const wos = toArr(woRaw); const notifs = toArr(notifRaw);
  const score = twin?.health_score||0;
  const critical = wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed");
  const overdue  = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)<new Date()&&w.status!=="completed");
  const unread   = notifs.filter((n: any) =>!n.is_read);
  const activities = actRaw?.activities||[];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
          <h1 className="tb-hero-title">Daily Review</h1>
          <p className="tb-hero-description">{today}</p>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Twin Score",     value:score+"/100",           color:score>=95?"#547C4D":"#B07A2A"},
              {label:"Critical WOs",  value:critical.length,        color:critical.length>0?"#A84A3D":"#547C4D"},
              {label:"Overdue WOs",   value:overdue.length,         color:overdue.length>0?"#B07A2A":"#547C4D"},
              {label:"Unread Alerts", value:unread.length,          color:unread.length>0?"#8D7443":"#547C4D"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Today's Priorities</div><button onClick={()=>router.push("/executive/exceptions")} className="tb-section-link">Exceptions →</button></div>
            {critical.length===0&&overdue.length===0 ? (
              <div className="tb-empty" style={{padding:"24px 0"}}><div className="tb-empty-icon" style={{fontSize:"2rem"}}>✅</div><div className="tb-empty-desc">No critical items today</div></div>
            ) : (
              <div className="space-y-2 mt-3">
                {[...critical.slice(0,3),...overdue.slice(0,3)].map((wo: any, i: any) =>(
                  <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><div className="tb-priority-bar" style={{background:wo.priority==="critical"?"#A84A3D":"#B07A2A"}}/><span className="text-sm text-secondary truncate">{wo.title||"—"}</span></div>
                    <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5625rem",flexShrink:0}}>{wo.priority}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Recent Activity</div><button onClick={()=>router.push("/inbox")} className="tb-section-link">Inbox →</button></div>
            <div className="space-y-2 mt-3">
              {activities.slice(0,6).map((act: any, i: any) =>(
                <div key={i} className="flex items-center gap-2">
                  <span style={{fontSize:"1rem"}}>{act.icon}</span>
                  <div className="flex-1 min-w-0"><div className="text-xs text-secondary truncate">{act.title}</div></div>
                </div>
              ))}
              {activities.length===0 && <div className="text-xs text-tertiary">No recent activity</div>}
            </div>
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Executive Navigation</div>
          <div className="tb-grid-4" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[{label:"Intelligence",icon:"🧠",path:"/executive/intelligence"},{label:"Portfolio",icon:"💼",path:"/executive/portfolio"},{label:"Risks",icon:"⚠️",path:"/executive/risks"},{label:"Exceptions",icon:"🚨",path:"/executive/exceptions"},{label:"Reports",icon:"📊",path:"/executive/reports"}].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span><span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtRel = (d) => { if (!d) return ""; try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); return h<1?"just now":h<24?h+"h ago":Math.floor(h/24)+"d ago"; } catch { return ""; } };

export default function AlertsPage() {
  const router = useRouter();
  const { data: breaches } = useQuery(["alerts-breaches"], ()=>authFetch("/api/v1/sla/breaches").then(r=>r.json()), {staleTime:30000});
  const { data: notifs }   = useQuery(["alerts-notifs"],   ()=>authFetch("/api/v1/platform-notif/?limit=20").then(r=>r.json()), {staleTime:30000});
  const { data: slaDash }  = useQuery(["alerts-sla"],      ()=>authFetch("/api/v1/sla/dashboard").then(r=>r.json()), {staleTime:60000});

  const breachList = toArr(breaches);
  const notifList  = notifs?.notifications||[];
  const overall    = slaDash?.overall||{};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Alerts & Breaches</h1>
          <p className="tb-hero-description">{breachList.length} active breaches · {notifList.filter(n=>!n.is_read).length} unread</p>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"SLA Breaches",value:breachList.length,danger:breachList.length>0},
              {label:"Total SRs",value:overall.total_requests||0},
              {label:"Resolved",value:overall.resolved||0,good:true},
              {label:"Avg Resolution",value:`${Math.round(overall.avg_resolution_hours||0)}h`},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.good?"var(--color-success)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2">
          <div className="tb-section" style={{borderColor:breachList.length>0?"var(--color-danger-border)":"var(--color-border)"}}>
            <div className="font-bold text-danger mb-4">⚠ SLA Breaches ({breachList.length})</div>
            {breachList.length===0 ? (
              <div className="tb-empty">
                <div className="tb-empty-icon" style={{opacity:0.4}}>✅</div>
                <div className="tb-empty-title">No active SLA breaches</div>
              </div>
            ) : breachList.map((b,i)=>(
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-alt rounded-lg mb-2 border border-danger/10">
                <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{b.title}</div>
                  <div className="text-xs text-tertiary mt-0.5">{b.urgency} · Target: {b.sla_target_hours}h · {b.site_name||"—"}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-extrabold text-danger">{Math.round(b.hours_overdue)}h</div>
                  <div className="text-xs text-tertiary">overdue</div>
                </div>
              </div>
            ))}
          </div>

          <div className="tb-section">
            <div className="font-bold text-primary mb-4">Recent Notifications</div>
            {notifList.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-title">No notifications</div></div>
            ) : notifList.map((n,i)=>(
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-divider">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{background:n.is_read?"var(--color-text-3)":"var(--color-brand)"}} />
                <div className="flex-1">
                  <div className={`text-sm ${n.is_read?"font-normal":"font-semibold"} text-primary`}>{n.title}</div>
                  <div className="text-xs text-tertiary mt-0.5">{fmtRel(n.created_at)}</div>
                </div>
              </div>
            ))}
            <button onClick={()=>authFetch("/api/v1/platform-notif/mark-all-read",{method:"POST"}).then(()=>window.location.reload())}
              className="tb-btn tb-btn-ghost w-full justify-center mt-4">Mark all read</button>
          </div>
        </div>
      </div>
    </div>
  );
}

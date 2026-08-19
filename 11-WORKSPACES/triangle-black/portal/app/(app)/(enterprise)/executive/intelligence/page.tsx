"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function IntelligencePage() {
  const router = useRouter();
  const { data: twin }    = useQuery(["int-twin"],  () => authFetch("/api/v1/twin/state").then(r => (r as any).data ?? r));
  const { data: signals } = useQuery(["int-sig"],   () => authFetch("/api/v1/ai/signals").then(r => (r as any).data ?? r));
  const { data: actRaw }  = useQuery(["int-act"],   () => authFetch("/api/v1/activity-feed?limit=20").then(r => (r as any).data ?? r));
  const score = twin?.health_score||0;
  const domains = twin?.operational_domains||[];
  const activities = actRaw?.activities||[];
  const sigs = toArr(signals?.signals||signals);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive · AI</div>
          <h1 className="tb-hero-title">Intelligence Hub</h1>
          <p className="tb-hero-description">Digital twin insights, AI signals, and platform intelligence</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Twin Score",value:score+"/100",color:score>=95?"#547C4D":"#B07A2A"},{label:"Domains",value:domains.length,color:"#5B7C8C"},{label:"Signals",value:sigs.length,color:"#8D7443"},{label:"Activities",value:activities.length,color:"#B07A2A"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Domain Health</div>
          <div className="tb-grid-4">
            {domains.map((dom: any, i: any) =>{
              const hasIssue=(dom.overdue||0)>0||(dom.critical_open||0)>0;
              const c = hasIssue?"#B07A2A":"#547C4D";
              return (
                <div key={i} className={"tb-domain-card "+(hasIssue?"tb-domain-card--warn":"tb-domain-card--ok")}>
                  <div className="tb-flex-between mb-1"><div className="text-xs font-semibold text-primary">{dom.domain}</div><div className="text-xs font-black" style={{color:c}}>{hasIssue?"⚠":"✓"}</div></div>
                  <div className="text-2xl font-black" style={{color:c}}>{dom.total||0}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>AI Signals</div><button onClick={()=>router.push("/connect-signals")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {sigs.slice(0,6).map((sig: any, i: any) =>(
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-base-alt">
                  <span style={{fontSize:"1rem"}}>🔮</span>
                  <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-primary truncate">{sig.title||sig.message||"AI Signal"}</div></div>
                  <span className="tb-badge" style={{fontSize:"0.5625rem",color:"#8D7443"}}>{sig.type||"info"}</span>
                </div>
              ))}
              {sigs.length===0 && <div className="text-xs text-tertiary text-center py-4">No active signals</div>}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Recent Activity</div><button onClick={()=>router.push("/inbox")} className="tb-section-link">Inbox →</button></div>
            <div className="space-y-2 mt-3">
              {activities.slice(0,6).map((act: any, i: any) =>(
                <div key={i} className="flex items-center gap-2">
                  <span style={{fontSize:"0.875rem"}}>{act.icon}</span>
                  <div className="flex-1 min-w-0"><div className="text-xs text-secondary truncate">{act.title}</div></div>
                </div>
              ))}
              {activities.length===0 && <div className="text-xs text-tertiary text-center py-4">No recent activity</div>}
            </div>
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Intelligence Tools</div>
          <div className="tb-grid-4" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[{label:"Digital Twin",icon:"🔷",path:"/executive"},{label:"Scorecard",icon:"🏆",path:"/executive/scorecard"},{label:"Predictive",icon:"🔮",path:"/executive/predictive"},{label:"AI Hub",icon:"🤖",path:"/hub"},{label:"Signals",icon:"📡",path:"/connect-signals"}].map((a: any, i: number) =>(
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

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function ConnectSignalsPage() {
  const router = useRouter();
  const { data: sigRaw }  = useQuery(["cs-signals"], () => authFetch("/api/v1/ai/signals").then(r => r.json()));
  const { data: twin }    = useQuery(["cs-twin"],    () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: actRaw }  = useQuery(["cs-act"],     () => authFetch("/api/v1/activity-feed?limit=20").then(r => r.json()));
  const signals = toArr(sigRaw?.signals||sigRaw);
  const score = twin?.health_score||0;
  const activities = actRaw?.activities||[];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0A1A30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">AI · Signals</div>
          <h1 className="tb-hero-title">Connect Signals</h1>
          <p className="tb-hero-description">Real-time AI signals, platform events, and operational intelligence</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Active Signals",value:signals.length,color:"#5B7C8C"},{label:"Twin Score",value:score+"/100",color:score>=95?"#547C4D":"#B07A2A"},{label:"Events",value:activities.length,color:"#8D7443"},{label:"Status",value:"Live",color:"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>AI Signals</div></div>
            <div className="space-y-2 mt-3">
              {signals.length===0 ? <div className="tb-empty" style={{padding:"24px 0"}}><div className="tb-empty-icon" style={{fontSize:"2rem"}}>📡</div><div className="tb-empty-desc">No active signals</div></div>
              : signals.slice(0,8).map((sig: any, i: any) =>(
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-base-alt">
                  <span style={{fontSize:"1rem"}}>🔮</span>
                  <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-primary truncate">{sig.title||sig.message||"Signal"}</div><div className="text-xs text-tertiary">{sig.type||"AI"}</div></div>
                  <span className="tb-badge" style={{fontSize:"0.5rem",color:"#8D7443"}}>{sig.severity||"info"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Recent Events</div><button onClick={()=>router.push("/inbox")} className="tb-section-link">Inbox →</button></div>
            <div className="space-y-2 mt-3">
              {activities.slice(0,8).map((act: any, i: any) =>(
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-alt transition-colors">
                  <span>{act.icon}</span><div className="flex-1 min-w-0"><div className="text-xs text-secondary truncate">{act.title}</div></div>
                </div>
              ))}
              {activities.length===0&&<div className="text-xs text-tertiary text-center py-4">No recent events</div>}
            </div>
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">AI Platform</div>
          <div className="tb-grid-4">
            {[{label:"AI Hub",icon:"🤖",path:"/hub"},{label:"Knowledge Graph",icon:"🔷",path:"/graph"},{label:"Intelligence",icon:"🧠",path:"/executive/intelligence"},{label:"Digital Twin",icon:"🔷",path:"/executive"}].map((a: any, i: number) =>(
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

"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function HubPage() {
  const router = useRouter();
  const { data: health } = useQuery(["hub-h"], () => authFetch("/api/v1/ai/health").then(r=>r.json()), { staleTime:120000, refetchOnWindowFocus:false });
  const { data: twin }   = useQuery(["hub-t"], () => authFetch("/api/v1/twin/state").then(r=>r.json()), { staleTime:60000, refetchOnWindowFocus:false });
  const { data: sigRaw } = useQuery(["hub-s"], () => authFetch("/api/v1/ai/signals").then(r=>r.json()), { staleTime:60000, refetchOnWindowFocus:false });
  const score = twin?.health_score||0;
  const sigs  = toArr(sigRaw?.signals||sigRaw);
  const st    = health?.status||"unknown";
  const modules = [
    {label:"AI Signals",      icon:"📡", path:"/connect-signals",        desc:"Real-time platform signals"},
    {label:"Knowledge Graph", icon:"🔷", path:"/graph",                  desc:"Entity relationships"},
    {label:"Intelligence",    icon:"🧠", path:"/executive/intelligence", desc:"Executive insights"},
    {label:"Digital Twin",    icon:"⚡", path:"/executive",              desc:"Platform health"},
    {label:"Predictive",      icon:"🔮", path:"/executive/predictive",   desc:"Upcoming predictions"},
    {label:"Activity Feed",   icon:"📋", path:"/workspace",              desc:"Real-time activity"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0A1530 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform · AI</div>
          <h1 className="tb-hero-title">AI Hub OS</h1>
          <p className="tb-hero-description">Local AI powered by Qwen 2.5 · Digital twin · Knowledge graph</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"AI Status",value:st.toUpperCase(),color:["ok","healthy"].includes(st)?"#34D399":"#FBBF24"},{label:"Twin Score",value:score+"/100",color:score>=95?"#34D399":"#FBBF24"},{label:"Signals",value:sigs.length,color:"#60A5FA"},{label:"Model",value:"Qwen 2.5",color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">AI Modules</div>
          <div className="tb-grid-3">
            {modules.map((m,i)=>(
              <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div style={{fontSize:"1.75rem",marginBottom:8}}>{m.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{m.label}</div>
                <div className="text-xs text-tertiary">{m.desc}</div>
                <div className="text-xs text-brand mt-3">Open →</div>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="tb-section-title">System Info</div>
          <div className="space-y-1">
            {[["AI Model","Qwen 2.5 7b (local)"],["Vector DB","Qdrant"],["Endpoint","localhost:11434"],["Status",st],["Twin Score",score+"/100"],["Signals",sigs.length]].map(([l,v],i)=>(
              <div key={i} className="tb-info-row"><span className="tb-info-label">{l}</span><span className="tb-info-value">{String(v)}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

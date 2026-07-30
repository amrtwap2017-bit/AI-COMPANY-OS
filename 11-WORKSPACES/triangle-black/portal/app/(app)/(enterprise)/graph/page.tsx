"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function GraphPage() {
  const router = useRouter();
  const { data: twin }    = useQuery(["graph-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: assetRaw} = useQuery(["graph-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: woRaw }   = useQuery(["graph-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const assets = toArr(assetRaw); const wos = toArr(woRaw);
  const score = twin?.health_score||0;
  const nodes = [
    {type:"Assets",      count:assets.length,              icon:"⚙️",  color:"#5B7C8C", path:"/maintenance/assets"},
    {type:"Work Orders", count:wos.length,                 icon:"🔧", color:"#B07A2A", path:"/operations/work-orders"},
    {type:"PM Plans",    count:twin?.domains?.maintenance||0,icon:"📅",color:"#8D7443", path:"/maintenance/pm-plans"},
    {type:"Twin Score",  count:score,                      icon:"🔷", color:"#547C4D", path:"/executive"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0A1A30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">AI · Knowledge</div>
          <h1 className="tb-hero-title">Knowledge Graph</h1>
          <p className="tb-hero-description">Entity relationships, digital twin, and platform knowledge network</p>
          <div className="tb-grid-4 mt-6">
            {nodes.map((n,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:n.color}}>{n.count}</div><div className="tb-hero-kpi-label">{n.type}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Knowledge Domains</div>
          <div className="tb-grid-4">
            {nodes.map((n,i)=>(
              <button key={i} onClick={()=>router.push(n.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="flex items-center justify-between mb-3"><span style={{fontSize:"1.75rem"}}>{n.icon}</span><span className="text-2xl font-black" style={{color:n.color}}>{n.count}</span></div>
                <div className="text-sm font-bold text-primary">{n.type}</div><div className="text-xs text-brand mt-2">Explore →</div>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">AI Platform</div>
          <div className="tb-grid-3">
            {[{label:"AI Hub",icon:"🤖",path:"/hub"},{label:"Digital Twin",icon:"🔷",path:"/executive"},{label:"Connect Signals",icon:"📡",path:"/connect-signals"}].map((a,i)=>(
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

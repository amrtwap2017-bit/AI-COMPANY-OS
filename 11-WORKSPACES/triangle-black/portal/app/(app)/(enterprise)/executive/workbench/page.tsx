"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function WorkbenchPage() {
  const router = useRouter();
  const { data: twin }    = useQuery(["wb-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }    = useQuery(["wb-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: actRaw }  = useQuery(["wb-act"],    () => authFetch("/api/v1/activity-feed?limit=10").then(r=>r.json()));
  const score = twin?.health_score||0;
  const d = dash||{};
  const activities = actRaw?.activities||[];
  const tools = [
    {label:"Daily Review",    icon:"☀️",  path:"/executive/daily-review",   desc:"Today's priorities"},
    {label:"Intelligence",    icon:"🧠", path:"/executive/intelligence",   desc:"AI insights"},
    {label:"Exceptions",      icon:"🚨", path:"/executive/exceptions",     desc:"Issues requiring action"},
    {label:"Scorecard",       icon:"🏆", path:"/executive/scorecard",      desc:"KPI performance"},
    {label:"Portfolio",       icon:"💼", path:"/executive/portfolio",      desc:"Contracts & projects"},
    {label:"Risks",           icon:"⚠️",  path:"/executive/risks",          desc:"Risk register"},
    {label:"Predictive",      icon:"🔮", path:"/executive/predictive",     desc:"Upcoming events"},
    {label:"Command",         icon:"⚡", path:"/executive/command",        desc:"Quick navigation"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
          <h1 className="tb-hero-title">Executive Workbench</h1>
          <p className="tb-hero-description">Personal workspace for executive decision-making</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Twin Score",value:score+"/100",color:score>=95?"#547C4D":"#B07A2A"},{label:"WOs",value:d.work_orders?.total||0,color:"#5B7C8C"},{label:"Contracts",value:d.commercial?.active_contracts||0,color:"#547C4D"},{label:"Alerts",value:d.notifications?.unread||0,color:"#8D7443"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Executive Tools</div>
          <div className="tb-grid-4">
            {tools.map((tool,i)=>(
              <button key={i} onClick={()=>router.push(tool.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div style={{fontSize:"1.75rem",marginBottom:8}}>{tool.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{tool.label}</div>
                <div className="text-xs text-tertiary">{tool.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Recent Activity</div><button onClick={()=>router.push("/inbox")} className="tb-section-link">Inbox →</button></div>
          <div className="space-y-2 mt-3">
            {activities.slice(0,5).map((act,i)=>(
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-alt transition-colors">
                <span>{act.icon}</span><div className="flex-1 min-w-0"><div className="text-xs text-secondary truncate">{act.title}</div></div>
              </div>
            ))}
            {activities.length===0&&<div className="text-xs text-tertiary text-center py-4">No recent activity</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

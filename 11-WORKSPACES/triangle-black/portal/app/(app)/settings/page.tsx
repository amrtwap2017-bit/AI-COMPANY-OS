"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function SettingsPage() {
  const router = useRouter();
  const { data: me } = useQuery(["settings-me"], () => authFetch("/api/v1/auth/me").then(r=>r.json()));
  const { data: twin } = useQuery(["settings-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const score = twin?.health_score||0;
  const sections = [
    {label:"Profile",         icon:"👤", desc:"Name, email, password", path:"/settings/profile"},
    {label:"Notifications",   icon:"🔔", desc:"Alert preferences",     path:"/admin/notification-rules"},
    {label:"Hotel / Site",    icon:"🏢", desc:"Site configuration",    path:"/administration/hotels"},
    {label:"Users",           icon:"👥", desc:"User management",       path:"/administration"},
    {label:"AI Settings",     icon:"🤖", desc:"AI model configuration",path:"/hub"},
    {label:"System Info",     icon:"ℹ️",  desc:"Platform version info", path:"/settings"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1B2E 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Settings</h1>
          <p className="tb-hero-description">Platform configuration and preferences</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"User",value:me?.email||me?.username||"amr@triangleblack.com",color:"#F1F5F9"},{label:"Twin Score",value:score+"/100",color:score>=95?"#34D399":"#FBBF24"},{label:"Version",value:"2.0.1",color:"#60A5FA"},{label:"Status",value:"Active",color:"#34D399"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.8rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Configuration</div>
          <div className="tb-grid-3">
            {sections.map((s: any, i: number) =>(
              <button key={i} onClick={()=>router.push(s.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div style={{fontSize:"1.75rem",marginBottom:8}}>{s.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{s.label}</div>
                <div className="text-xs text-tertiary">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="tb-section-title">Platform Info</div>
          <div className="space-y-1">
            {[["Version","2.0.1"],["Backend","FastAPI + PostgreSQL"],["Frontend","Next.js 16 + React 19"],["AI","Qwen 2.5 7b (local)"],["Twin Score",score+"/100"],["Build","Production"]].map(([l,v],i)=>(
              <div key={i} className="tb-info-row"><span className="tb-info-label">{l}</span><span className="tb-info-value">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

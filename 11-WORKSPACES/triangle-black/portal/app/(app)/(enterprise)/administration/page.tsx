"use client";
// @ts-nocheck
import { useRole } from "@/lib/hooks/useRole";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function AdministrationPage() {
  const router = useRouter();
  const { is_admin, role } = useRole();
  const { data: twin } = useQuery(["adm-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const score = twin?.health_score||0;
  const modules = [
    {label:"Hotels / Sites",    icon:"🏨", path:"/administration/hotels",      desc:"Hotel and site configuration"},
    {label:"Notification Rules", icon:"🔔", path:"/admin/notification-rules",  desc:"Alert and notification settings"},
    {label:"Users",              icon:"👥", path:"/administration/users",       desc:"User accounts and roles"},
    {label:"Settings",           icon:"⚙️",  path:"/settings",                  desc:"Platform configuration"},
    {label:"AI Hub",             icon:"🤖", path:"/hub",                        desc:"AI and knowledge graph"},
    {label:"Integration",        icon:"🔗", path:"/integration",               desc:"External integrations"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Administration</h1>
          <p className="tb-hero-description">System configuration, users, and platform settings</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Twin Score",value:score+"/100",color:score>=95?"#34D399":"#FBBF24"},{label:"Version",value:"2.0.1",color:"#60A5FA"},{label:"Status",value:"Active",color:"#34D399"},{label:"Environment",value:"Production",color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {!is_admin && role && (
          <div className="tb-section" style={{borderColor:"#FBBF2440",background:"#FBBF2408"}}>
            <div className="flex items-center gap-2"><span>⚠️</span><span className="text-sm font-semibold" style={{color:"#FBBF24"}}>Read-only access — role: {role}. Admin required for changes.</span></div>
          </div>
        )}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Admin Modules</div>
          <div className="tb-grid-3">
            {modules.map((m,i)=>(
              <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div style={{fontSize:"1.75rem",marginBottom:8}}>{m.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{m.label}</div>
                <div className="text-xs text-tertiary">{m.desc}</div>
                <div className="text-xs text-brand mt-3">Configure →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

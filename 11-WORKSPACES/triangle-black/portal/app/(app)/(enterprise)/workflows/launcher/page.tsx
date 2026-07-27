"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function WorkflowLauncherPage() {
  const router = useRouter();
  const { data: autoRaw } = useQuery(["wl-auto"], () => authFetch("/api/v1/automation/status").then(r=>r.json()));
  const pending = autoRaw?.pending_actions||{};
  const total = Object.values(pending).reduce((s,v)=>s+Number(v),0);
  const actions = [
    {label:"Create Work Order",  icon:"🔧", desc:"New maintenance or repair task", path:"/operations/work-orders"},
    {label:"New Service Request", icon:"🎫", desc:"Log a service request", path:"/operations/service-requests"},
    {label:"Create Purchase Request",icon:"📋", desc:"Request materials or equipment", path:"/supply-chain/purchase-requests"},
    {label:"Add Asset",          icon:"⚙️",  desc:"Register new equipment", path:"/maintenance/assets"},
    {label:"New Lead",           icon:"👤", desc:"Add a sales lead", path:"/commercial/leads"},
    {label:"New Contract",       icon:"📄", desc:"Create a contract", path:"/commercial/contracts"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0A1A30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform · Workflows</div>
          <h1 className="tb-hero-title">Workflow Launcher</h1>
          <p className="tb-hero-description">Quick-start common platform workflows</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Quick Actions",value:actions.length,color:"#60A5FA"},{label:"Pending",value:total,color:total>0?"#FBBF24":"#34D399"},{label:"Automation",value:"Active",color:"#34D399"},{label:"Status",value:"Ready",color:"#34D399"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Quick Start Actions</div>
          <div className="tb-grid-3">
            {actions.map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div style={{fontSize:"2rem",marginBottom:8}}>{a.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{a.label}</div>
                <div className="text-xs text-tertiary">{a.desc}</div>
                <div className="text-xs text-brand mt-3">Start →</div>
              </button>
            ))}
          </div>
        </div>
        {Object.keys(pending).length>0&&(
          <div className="tb-section">
            <div className="tb-section-title">Pending Automation Actions</div>
            <div className="space-y-2">
              {Object.entries(pending).map(([key,val],i)=>(
                <div key={i} className="tb-info-row"><span className="tb-info-label capitalize">{key.replace(/_/g," ")}</span><span className="tb-badge" style={{color:"#FBBF24"}}>{String(val)}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

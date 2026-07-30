"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function PortfolioPage() {
  const router = useRouter();
  const { data: contRaw } = useQuery(["pf-conts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: projRaw } = useQuery(["pf-projs"], () => authFetch("/api/v1/projects/").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["pf-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const contracts = toArr(contRaw); const projects = toArr(projRaw); const inv = toArr(invRaw);
  const activeContracts = contracts.filter(c=>c.status==="active");
  const contractValue   = activeContracts.reduce((s,c)=>s+Number(c.total_value||c.value||0),0);
  const revenue         = inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const now = new Date();
  const expiringSoon = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)<=new Date(now.getTime()+30*86400000));
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0A28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
          <h1 className="tb-hero-title">Portfolio</h1>
          <p className="tb-hero-description">Active contracts, projects and revenue overview</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Active Contracts",value:activeContracts.length,color:"#34D399"},{label:"Portfolio Value",value:fmtEGP(contractValue),color:"#FBBF24"},{label:"Active Projects",value:projects.filter(p=>p.status==="active").length,color:"#60A5FA"},{label:"Revenue",value:fmtEGP(revenue),color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {expiringSoon.length>0 && (
          <div className="tb-section" style={{borderColor:"#FBBF2440",background:"#FBBF2408"}}>
            <div className="flex items-center gap-2"><span>⏰</span><span className="text-sm font-semibold" style={{color:"#FBBF24"}}>{expiringSoon.length} contract{expiringSoon.length>1?"s":""} expiring within 30 days</span><button onClick={()=>router.push("/commercial/contracts")} className="tb-section-link ml-auto">View →</button></div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Active Contracts</div><button onClick={()=>router.push("/commercial/contracts")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {activeContracts.slice(0,5).map((c,i)=>{
                const days = c.end_date?Math.ceil((new Date(c.end_date)-now)/86400000):null;
                return (
                  <button key={i} onClick={()=>router.push("/commercial/contracts/"+c.id)} className="tb-action-item w-full justify-between">
                    <div className="min-w-0 flex items-center gap-2"><span className="text-base">📄</span><span className="text-sm text-secondary truncate">{c.title||c.id?.slice(0,20)}</span></div>
                    <div className="flex items-center gap-2 flex-shrink-0"><span className="text-xs text-tertiary">{fmtEGP(c.total_value||0)}</span>{days!==null&&days<=30&&<span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem"}}>{days}d</span>}</div>
                  </button>
                );
              })}
              {activeContracts.length===0 && <div className="text-xs text-tertiary py-4 text-center">No active contracts</div>}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Active Projects</div><button onClick={()=>router.push("/projects-center")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {projects.filter(p=>p.status==="active").slice(0,5).map((proj,i)=>(
                <button key={i} onClick={()=>router.push("/projects-center/"+proj.id)} className="tb-action-item w-full justify-between">
                  <div className="min-w-0 flex items-center gap-2"><span className="text-base">🏗️</span><span className="text-sm text-secondary truncate">{proj.name||proj.title||"—"}</span></div>
                  <span className="text-xs text-tertiary flex-shrink-0">{proj.end_date?fmtDate(proj.end_date):"—"}</span>
                </button>
              ))}
              {projects.filter(p=>p.status==="active").length===0 && <div className="text-xs text-tertiary py-4 text-center">No active projects</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

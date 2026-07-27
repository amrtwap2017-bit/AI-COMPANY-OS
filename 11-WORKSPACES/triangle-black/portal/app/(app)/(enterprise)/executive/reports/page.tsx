"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function ExecutiveReportsPage() {
  const router = useRouter();
  const { data: twin }   = useQuery(["er-twin"],  () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }   = useQuery(["er-dash"],  () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: invRaw } = useQuery(["er-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: woRaw }  = useQuery(["er-wos"],   () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const inv = toArr(invRaw); const wos = toArr(woRaw);
  const score = twin?.health_score||0;
  const d = dash||{};
  const totalRev = inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const compRate = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const reports = [
    {label:"Operations Report",    icon:"🔧", desc:"WO completion, SLA, technician performance", path:"/analytics/sla"},
    {label:"Financial Report",     icon:"💰", desc:"Revenue, invoices, collections", path:"/analytics/costs"},
    {label:"Maintenance Report",   icon:"📅", desc:"PM compliance, asset health, overdue plans", path:"/analytics/scorecards"},
    {label:"Commercial Report",    icon:"📊", desc:"Pipeline, contracts, lead conversion", path:"/analytics/trends"},
    {label:"Platform Scorecard",   icon:"🏆", desc:"Twin score, domain health, KPIs", path:"/analytics/scorecards"},
    {label:"Executive Summary",    icon:"🧠", desc:"All domains, risks, opportunities", path:"/executive"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0A28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
          <h1 className="tb-hero-title">Reports</h1>
          <p className="tb-hero-description">Platform intelligence reports and analytics</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Twin Score",value:score+"/100",color:score>=95?"#34D399":"#FBBF24"},{label:"Revenue",value:fmtEGP(totalRev),color:"#34D399"},{label:"WO Completion",value:compRate+"%",color:compRate>=80?"#34D399":"#FBBF24"},{label:"Reports",value:reports.length,color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Available Reports</div>
          <div className="tb-grid-3">
            {reports.map((r,i)=>(
              <button key={i} onClick={()=>router.push(r.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div style={{fontSize:"1.75rem",marginBottom:8}}>{r.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{r.label}</div>
                <div className="text-xs text-tertiary">{r.desc}</div>
                <div className="text-xs text-brand mt-3">View →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

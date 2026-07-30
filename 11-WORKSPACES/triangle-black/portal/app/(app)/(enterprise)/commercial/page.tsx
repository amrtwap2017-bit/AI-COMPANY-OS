"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function CommercialPage() {
  const router = useRouter();
  const { data: leadRaw } = useQuery(["com-leads"], () => authFetch("/api/v1/leads-portal").then(r=>r.json()));
  const { data: contRaw } = useQuery(["com-conts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["com-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const leads = toArr(leadRaw); const contracts = toArr(contRaw); const inv = toArr(invRaw);
  const active = contracts.filter(c=>c.status==="active");
  const won    = leads.filter(l=>l.status==="won");
  const revenue= inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const modules = [
    {label:"Leads",         icon:"👤", path:"/commercial/leads",     count:leads.length,    color:"#60A5FA"},
    {label:"Pipeline",      icon:"📊", path:"/commercial/pipeline",  count:null,            color:"#A78BFA"},
    {label:"Contracts",     icon:"📄", path:"/commercial/contracts", count:active.length,   color:"#34D399"},
    {label:"Customers",     icon:"🏢", path:"/customers",            count:null,            color:"#FBBF24"},
    {label:"Invoices",      icon:"💰", path:"/invoices",             count:inv.length,      color:"#F97316"},
    {label:"Cost Analysis", icon:"📈", path:"/analytics/costs",      count:null,            color:"#94A3B8"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0F28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Commercial</h1>
          <p className="tb-hero-description">{leads.length} leads · {active.length} active contracts · {fmtEGP(revenue)} revenue</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Open Leads",value:leads.filter(l=>l.status!=="won"&&l.status!=="lost").length,color:"#60A5FA"},{label:"Won Deals",value:won.length,color:"#34D399"},{label:"Active Contracts",value:active.length,color:"#A78BFA"},{label:"Revenue",value:fmtEGP(revenue),color:"#FBBF24"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Commercial Modules</div>
          <div className="tb-grid-3">
            {modules.map((m,i)=>(
              <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="flex items-center justify-between mb-3"><span style={{fontSize:"1.75rem"}}>{m.icon}</span>{m.count!==null&&<span className="text-2xl font-black" style={{color:m.color}}>{m.count}</span>}</div>
                <div className="text-sm font-bold text-primary">{m.label}</div><div className="text-xs text-brand mt-2">View →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

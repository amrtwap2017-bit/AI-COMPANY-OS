"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function AnalyticsCosts() {
  const router = useRouter();
  const { data: invRaw }  = useQuery(["ac-inv"],  () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: poRaw }   = useQuery(["ac-pos"],  () => authFetch("/api/v1/purchase-orders/").then(r=>r.json()));
  const { data: prRaw }   = useQuery(["ac-prs"],  () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: contRaw } = useQuery(["ac-cont"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const inv = toArr(invRaw); const pos = toArr(poRaw);
  const prs = toArr(prRaw); const contracts = toArr(contRaw);
  const totalRevenue  = inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const totalPending  = inv.filter(i=>i.status==="pending").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const totalSpend    = pos.reduce((s,p)=>s+Number(p.total_amount||p.total_value||0),0);
  const contractValue = contracts.filter(c=>c.status==="active").reduce((s,c)=>s+Number(c.total_value||c.value||0),0);
  const kpis = [
    { label:"Revenue Collected",  value:fmtEGP(totalRevenue),  color:"#34D399",  icon:"💰" },
    { label:"Pending Revenue",     value:fmtEGP(totalPending),  color:"#FBBF24",  icon:"⏰" },
    { label:"Procurement Spend",   value:fmtEGP(totalSpend),    color:"#F87171",  icon:"🛒" },
    { label:"Active Contracts",    value:fmtEGP(contractValue), color:"#A78BFA",  icon:"📄" },
    { label:"Net Position",        value:fmtEGP(totalRevenue-totalSpend), color:totalRevenue>totalSpend?"#34D399":"#F87171", icon:"📊" },
    { label:"Invoice Count",       value:inv.length,             color:"#60A5FA",  icon:"📋" },
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1B30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Analytics</div>
          <h1 className="tb-hero-title">Cost Analysis</h1>
          <p className="tb-hero-description">Revenue, expenditure and financial position</p>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
            {kpis.slice(0,3).map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-grid-3">
          {kpis.map((k,i)=>(
            <div key={i} className="tb-section text-center">
              <div style={{fontSize:"1.75rem",marginBottom:8}}>{k.icon}</div>
              <div className="text-2xl font-black" style={{color:k.color}}>{k.value}</div>
              <div className="text-xs text-tertiary mt-1">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate to</div>
          <div className="tb-grid-4">
            {[{label:"Invoices",icon:"💰",path:"/invoices"},{label:"Contracts",icon:"📄",path:"/commercial/contracts"},{label:"Purchase Orders",icon:"📦",path:"/supply-chain/purchase-orders"},{label:"Scorecards",icon:"📊",path:"/analytics/scorecards"}].map((a,i)=>(
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

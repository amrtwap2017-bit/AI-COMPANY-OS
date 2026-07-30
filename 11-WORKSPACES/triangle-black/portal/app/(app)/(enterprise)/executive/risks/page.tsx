"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function RisksPage() {
  const router = useRouter();
  const { data: woRaw }   = useQuery(["rsk-wos"],   () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: contRaw } = useQuery(["rsk-conts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["rsk-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: pmRaw }   = useQuery(["rsk-pms"],   () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const wos = toArr(woRaw); const contracts = toArr(contRaw);
  const inv = toArr(invRaw); const pms = toArr(pmRaw);
  const now = new Date();
  const criticalWOs = wos.filter(w=>w.priority==="critical"&&w.status!=="completed").length;
  const overdueWOs  = wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed").length;
  const expiringCts = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)<=new Date(now.getTime()+30*86400000)).length;
  const overduePMs  = pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now).length;
  const overdueInv  = inv.filter(i=>i.status==="overdue").length;
  const riskScore   = criticalWOs*10+overdueWOs*3+expiringCts*5+overduePMs*2+overdueInv*4;
  const riskLevel   = riskScore===0?"None":riskScore<15?"Low":riskScore<30?"Medium":"High";
  const riskColor   = riskScore===0?"#547C4D":riskScore<15?"#5B7C8C":riskScore<30?"#B07A2A":"#A84A3D";
  const risks = [
    {label:"Critical Work Orders", value:criticalWOs, weight:10, color:"#A84A3D", path:"/operations/work-orders", desc:"Unresolved critical priority work orders"},
    {label:"Overdue Work Orders",  value:overdueWOs,  weight:3,  color:"#B07A2A", path:"/analytics/sla",           desc:"Work orders past their due date"},
    {label:"Expiring Contracts",   value:expiringCts, weight:5,  color:"#B07A2A", path:"/commercial/contracts",    desc:"Contracts expiring within 30 days"},
    {label:"Overdue PM Plans",     value:overduePMs,  weight:2,  color:"#B07A2A", path:"/maintenance/pm-plans",    desc:"Preventive maintenance past due"},
    {label:"Overdue Invoices",     value:overdueInv,  weight:4,  color:"#A84A3D", path:"/invoices",                desc:"Unpaid invoices past due date"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0A0A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-red-400 mb-1.5">Executive · Risk</div>
          <h1 className="tb-hero-title">Risk Register</h1>
          <p className="tb-hero-description">Platform risk assessment and mitigation status</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Risk Score",value:riskScore,color:riskColor},{label:"Risk Level",value:riskLevel,color:riskColor},{label:"Risk Items",value:risks.filter(r=>r.value>0).length,color:risks.filter(r=>r.value>0).length>0?"#B07A2A":"#547C4D"},{label:"Status",value:riskScore===0?"Clear":"Active",color:riskColor}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Risk Breakdown</div>
          <div className="space-y-3">
            {risks.map((risk,i)=>{
              const score = risk.value * risk.weight;
              const pct   = Math.min((score/Math.max(riskScore,1))*100,100);
              return (
                <button key={i} onClick={()=>router.push(risk.path)} className="w-full text-left p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors border border-transparent hover:border-border">
                  <div className="tb-flex-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-primary">{risk.label}</div>
                      <div className="text-xs text-tertiary">{risk.desc}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-xl font-black" style={{color:risk.value>0?risk.color:"#547C4D"}}>{risk.value}</div>
                      <div className="text-xs text-tertiary">×{risk.weight} weight</div>
                    </div>
                  </div>
                  {risk.value>0 && <div className="tb-progress"><div className="tb-progress-bar" style={{background:risk.color,width:pct+"%"}}/></div>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Mitigation Actions</div>
          <div className="tb-grid-3">
            {[{label:"View Exceptions",icon:"🚨",path:"/executive/exceptions"},{label:"Dispatch WOs",icon:"📋",path:"/operations/dispatch"},{label:"Review Contracts",icon:"📄",path:"/commercial/contracts"}].map((a,i)=>(
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

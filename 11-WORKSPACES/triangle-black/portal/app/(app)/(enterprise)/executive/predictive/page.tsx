"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function PredictivePage() {
  const router = useRouter();
  const { data: woRaw }   = useQuery(["pred-wos"],   () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: contRaw } = useQuery(["pred-conts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["pred-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: pmRaw }   = useQuery(["pred-pms"],   () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const wos = toArr(woRaw); const contracts = toArr(contRaw);
  const inv = toArr(invRaw); const pms = toArr(pmRaw);
  const now = new Date();
  const next30 = new Date(now.getTime()+30*86400000);
  const next7  = new Date(now.getTime()+7*86400000);
  const pmsDueWeek  = pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=next7);
  const pmsDueMonth = pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)>next7&&new Date(p.next_due_ts)<=next30);
  const ctExpiring  = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=next30);
  const wosDue      = wos.filter(w=>w.due_date&&new Date(w.due_date)>=now&&new Date(w.due_date)<=next7&&w.status!=="completed");
  const predictions = [
    {label:"PM Plans due this week",      value:pmsDueWeek.length,  color:"#FBBF24", action:"Schedule",  path:"/maintenance/pm-plans"},
    {label:"PM Plans due this month",     value:pmsDueMonth.length, color:"#60A5FA", action:"Plan",      path:"/maintenance/pm-plans"},
    {label:"Contracts expiring (30d)",    value:ctExpiring.length,  color:"#FB923C", action:"Renew",     path:"/commercial/contracts"},
    {label:"Work orders due this week",   value:wosDue.length,      color:"#F87171", action:"Dispatch",  path:"/operations/work-orders"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0A1A28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Executive · AI</div>
          <h1 className="tb-hero-title">Predictive Intelligence</h1>
          <p className="tb-hero-description">Upcoming events, predicted issues and recommended actions</p>
          <div className="tb-grid-4 mt-6">
            {predictions.map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Predictions & Recommendations</div>
          <div className="space-y-3">
            {predictions.map((pred,i)=>(
              pred.value>0 ? (
                <button key={i} onClick={()=>router.push(pred.path)} className="w-full flex items-center gap-4 p-4 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left border border-transparent hover:border-border">
                  <div style={{width:48,height:48,borderRadius:12,background:pred.color+"18",border:"1px solid "+pred.color+"30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem",flexShrink:0}}>🔮</div>
                  <div className="flex-1"><div className="text-sm font-bold text-primary">{pred.label}</div><div className="text-xs text-tertiary mt-0.5">Recommended action: {pred.action}</div></div>
                  <div className="text-right flex-shrink-0"><div className="text-2xl font-black" style={{color:pred.color}}>{pred.value}</div><div className="text-xs text-brand">{pred.action} →</div></div>
                </button>
              ) : (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-base-alt opacity-50">
                  <div style={{width:48,height:48,borderRadius:12,background:"#34D39918",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem",flexShrink:0}}>✅</div>
                  <div className="text-sm text-secondary">{pred.label} — none upcoming</div>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Upcoming PM Plans</div>
          {[...pmsDueWeek,...pmsDueMonth].slice(0,5).length===0 ? (
            <div className="tb-empty" style={{padding:"24px 0"}}><div className="tb-empty-icon" style={{fontSize:"2rem"}}>📅</div><div className="tb-empty-desc">No PM plans due in the next 30 days</div></div>
          ) : (
            <div className="space-y-2">
              {[...pmsDueWeek,...pmsDueMonth].slice(0,5).map((pm,i)=>{
                const daysUntil=Math.ceil((new Date(pm.next_due_ts)-now)/86400000);
                return (
                  <button key={i} onClick={()=>router.push("/maintenance/pm-plans/"+pm.id)} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><span className="text-base">📅</span><span className="text-sm text-secondary truncate">{pm.title||"—"}</span></div>
                    <span className="text-xs flex-shrink-0" style={{color:daysUntil<=7?"#FBBF24":"#94A3B8"}}>in {daysUntil}d</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

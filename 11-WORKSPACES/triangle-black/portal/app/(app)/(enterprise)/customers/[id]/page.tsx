"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: ctRaw, isLoading } = useQuery(["cust-d-cts"], () => authFetch("/api/v1/contracts-portal").then(r=>r.json()));
  const { data: invRaw } = useQuery(["cust-d-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const contracts = toArr(ctRaw); const inv = toArr(invRaw);
  const first = contracts[0];
  const clientName = first?.client_name || ("Customer " + (id||"").slice(0,8));
  const active = contracts.filter(c=>c.status==="active");
  const revenue = inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0F28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Commercial · Customer</div>
              <h1 className="tb-hero-title">{clientName}</h1>
              <p className="tb-hero-description">{active.length} active contracts · {fmtEGP(revenue)} revenue</p>
            </div>
            <button onClick={()=>router.push("/customers")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Contracts",value:contracts.length,color:"#34D399"},{label:"Active",value:active.length,color:"#60A5FA"},{label:"Revenue",value:fmtEGP(revenue),color:"#FBBF24"},{label:"Invoices",value:inv.length,color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Contracts ({contracts.length})</div><button onClick={()=>router.push("/commercial/contracts")} className="tb-section-link">All →</button></div>
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : <div className="space-y-2 mt-3">
            {contracts.slice(0,8).map((c,i)=>{
              const sc={active:"#34D399",expired:"#F87171",pending:"#FBBF24"}[c.status]||"#94A3B8";
              return (
                <button key={i} onClick={()=>router.push("/commercial/contracts/"+c.id)} className="tb-action-item w-full justify-between">
                  <div className="flex items-center gap-2 min-w-0"><span>📄</span><div className="min-w-0"><div className="text-sm text-secondary truncate">{c.title||c.id?.slice(0,20)}</div><div className="text-xs text-tertiary">{fmtEGP(c.total_value||0)} · {fmtDate(c.end_date)}</div></div></div>
                  <span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5625rem"}}>{c.status}</span>
                </button>
              );
            })}
          </div>}
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate</div>
          <div className="tb-grid-4">
            {[{label:"Customers",icon:"🏢",path:"/customers"},{label:"Contracts",icon:"📄",path:"/commercial/contracts"},{label:"Leads",icon:"👤",path:"/commercial/leads"},{label:"Invoices",icon:"💰",path:"/invoices"}].map((a,i)=>(
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

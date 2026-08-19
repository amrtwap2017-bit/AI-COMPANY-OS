"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: ctRaw, isLoading } = useQuery(["cust-d-cts"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: invRaw } = useQuery(["cust-d-inv"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const contracts = toArr(ctRaw); const inv = toArr(invRaw);
  const first = contracts[0];
  const clientName = first?.client_name || ("Customer " + (id||"").slice(0,8));
  const active = contracts.filter((c: any) =>c.status==="active");
  const revenue = inv.filter((i: any) =>i.status==="paid").reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0F28 100%)"}}>
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
            {[{label:"Contracts",value:contracts.length,color:"#547C4D"},{label:"Active",value:active.length,color:"#5B7C8C"},{label:"Revenue",value:fmtEGP(revenue),color:"#B07A2A"},{label:"Invoices",value:inv.length,color:"#8D7443"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Contracts ({contracts.length})</div><button onClick={()=>router.push("/commercial/contracts")} className="tb-section-link">All →</button></div>
          {isLoading ? <div className="space-y-2">{[1,2,3].map((i: any) =><div key={i} className="h-12 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : <div className="space-y-2 mt-3">
            {contracts.slice(0,8).map((c: any, i: number) =>{
              const sc={active:"#547C4D",expired:"#A84A3D",pending:"#B07A2A"}[c.status]||"#6D5F53";
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
            {[{label:"Customers",icon:"🏢",path:"/customers"},{label:"Contracts",icon:"📄",path:"/commercial/contracts"},{label:"Leads",icon:"👤",path:"/commercial/leads"},{label:"Invoices",icon:"💰",path:"/invoices"}].map((a: any, i: number) =>(
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

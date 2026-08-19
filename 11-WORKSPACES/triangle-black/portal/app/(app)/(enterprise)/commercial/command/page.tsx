"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();

export default function CommercialCommandPage() {
  const router = useRouter();
  const { data: finDash, isLoading } = useQuery({queryKey:["cc-fin"],queryFn:()=>authFetch("/api/v1/financial/dashboard").then(r => (r as any).data ?? r),staleTime:60000});
  const { data: rawLeads } = useQuery({queryKey:["cc-leads"],queryFn:()=>authFetch("/api/v1/leads-portal-v2").then(r => (r as any).data ?? r),staleTime:60000});
  const { data: rawContracts } = useQuery({queryKey:["cc-contracts"],queryFn:()=>authFetch("/api/v1/contracts-portal").then(r => (r as any).data ?? r),staleTime:60000});
  const { data: rawInv } = useQuery({queryKey:["cc-inv"],queryFn:()=>authFetch("/api/v1/supplier-invoices/dashboard").then(r => (r as any).data ?? r),staleTime:60000});

  const leads = toArr(rawLeads);
  const contracts = toArr(rawContracts);
  const rev = finDash?.revenue||{};
  const activeCont = contracts.filter((c: any) =>c.status==="active").length;
  const expiringSoon = contracts.filter((c: any) =>{if(!c.end_date) return false;const diff=(new Date(c.end_date).getTime()-Date.now())/86400000;return diff>=0&&diff<=30;}).length;

  const MODULES = [
    {label:"Leads & Pipeline",icon:"📊",path:"/commercial/leads",desc:`${leads.length} leads`},
    {label:"Contracts",icon:"📋",path:"/commercial/contracts",desc:`${activeCont} active`},
    {label:"Invoices",icon:"🧾",path:"/commercial/invoices",desc:`${fmtEGP(rev.total_invoiced||0)} invoiced`},
    {label:"Customers",icon:"🏨",path:"/commercial/customers",desc:`${leads.filter((l: any) =>l.status==="won").length} accounts`},
    {label:"Payment History",icon:"💰",path:"/commercial/payment-history",desc:`${fmtEGP(rev.total_collected||0)} collected`},
    {label:"Renewals",icon:"🔄",path:"/commercial/contracts/renewal",desc:`${expiringSoon} expiring soon`},
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">Commercial Command</h1>
              <p className="tb-hero-description">Revenue overview · Pipeline · Contracts · Collections</p>
            </div>
            <button onClick={()=>router.push("/financial")} className="tb-btn tb-btn-primary">P&L Dashboard →</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"14px"}}>{fmtEGP(rev.total_invoiced||0)}</div><div className="tb-hero-kpi-label">Total Invoiced</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)",fontSize:"14px"}}>{fmtEGP(rev.total_collected||0)}</div><div className="tb-hero-kpi-label">Collected</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-danger)",fontSize:"14px"}}>{fmtEGP(rev.total_outstanding||0)}</div><div className="tb-hero-kpi-label">Outstanding</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:expiringSoon>0?"var(--color-warning)":"var(--color-success)"}}>{expiringSoon}</div><div className="tb-hero-kpi-label">Expiring Contracts</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {expiringSoon>0 && (
          <div className="tb-alert tb-alert-warning mb-4">
            <span>⚠️</span>
            <span className="font-bold">{expiringSoon} contracts expiring within 30 days — renewal required</span>
            <button onClick={()=>router.push("/commercial/contracts")} className="tb-btn tb-btn-secondary tb-btn-sm ml-auto">View →</button>
          </div>
        )}

        <div className="tb-grid-3 mb-5">
          {MODULES.map((m: any, i: number) =>(
            <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left flex flex-col gap-1.5 cursor-pointer tb-hover-lift">
              <span className="text-2xl">{m.icon}</span>
              <div className="font-bold text-sm text-primary">{m.label}</div>
              <div className="text-xs text-brand font-semibold">{m.desc}</div>
            </button>
          ))}
        </div>

        <div className="tb-grid-2">
          <div className="tb-section">
            <div className="tb-section-title">Revenue Summary</div>
            {[["Total Invoiced",fmtEGP(rev.total_invoiced||0),"var(--color-brand)"],["Collected",fmtEGP(rev.total_collected||0),"var(--color-success)"],["Outstanding",fmtEGP(rev.total_outstanding||0),"var(--color-danger)"],["Collection Rate",rev.total_invoiced>0?`${Math.round(rev.total_collected/rev.total_invoiced*100)}%`:"—","var(--color-info)"]].map(([label,value,color],i)=>(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{label}</span>
                <span className="tb-detail-value font-bold" style={{color}}>{value}</span>
              </div>
            ))}
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Contracts Summary</div>
            {[["Total Contracts",contracts.length,"var(--color-text-1)"],["Active",activeCont,"var(--color-success)"],["Expiring Soon",expiringSoon,expiringSoon>0?"var(--color-warning)":"var(--color-success)"],["Leads in Pipeline",leads.filter((l: any) =>!["won","lost"].includes(l.status)).length,"var(--color-info)"]].map(([label,value,color],i)=>(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{label}</span>
                <span className="tb-detail-value font-bold" style={{color}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

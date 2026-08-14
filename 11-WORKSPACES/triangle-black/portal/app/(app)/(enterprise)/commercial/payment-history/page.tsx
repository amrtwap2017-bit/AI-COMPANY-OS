"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { data: dash }   = useQuery(["pay-dash"], ()=>authFetch("/api/v1/financial/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: invRaw } = useQuery(["pay-inv"],  ()=>authFetch("/api/v1/supplier-invoices/").then(r=>r.json()), {staleTime:30000});

  const invoices = toArr(invRaw);
  const paid = invoices.filter(i=>i.status==="paid"||i.payment_status==="paid");
  const rev = dash?.revenue||{};
  const costs = dash?.costs||{};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Finance</div>
          <h1 className="tb-hero-title">Payment History</h1>
          <p className="tb-hero-description">{paid.length} payments recorded</p>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Total Invoiced",  value:fmtEGP(rev.total_invoiced||0)},
              {label:"Collected",       value:fmtEGP(rev.total_collected||0),good:true},
              {label:"Outstanding",     value:fmtEGP(rev.total_outstanding||0),warn:true},
              {label:"Collection Rate", value:`${Math.round(rev.collection_rate_pct||0)}%`,good:(rev.collection_rate_pct||0)>=80},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.good?"var(--color-success)":k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-6" style={{gridTemplateColumns:"2fr 1fr"}}>
          <div className="tb-section">
            <div className="font-bold text-primary mb-4">Payment Records</div>
            {paid.length===0 ? (
              <div className="tb-empty">
                <div className="tb-empty-icon" style={{opacity:0.4}}>💳</div>
                <div className="tb-empty-title">No payment records yet</div>
              </div>
            ) : paid.map((inv,i)=>(
              <button key={i} onClick={()=>router.push("/commercial/invoices/"+inv.id)}
                className="flex items-center gap-4 py-3 border-b border-divider w-full text-left bg-transparent cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-base flex-shrink-0">💳</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary">{inv.invoice_number||"—"}</div>
                  <div className="text-xs text-tertiary mt-0.5">{inv.vendor_name||inv.vendor_id||"—"}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-success">{fmtEGP(inv.total_amount||0)}</div>
                  <div className="text-xs text-tertiary">{fmtDate(inv.created_at)}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Financial Summary</div>
              {[["Total Invoiced",fmtEGP(rev.total_invoiced||0)],["Collected",fmtEGP(rev.total_collected||0),"var(--color-success)"],["Outstanding",fmtEGP(rev.total_outstanding||0),"var(--color-warning)"],["Collection Rate",`${Math.round(rev.collection_rate_pct||0)}%`,(rev.collection_rate_pct||0)>=80?"var(--color-success)":"var(--color-warning)"],["SOW Value",fmtEGP(costs.total_sow_value||0)],["Labor Cost",fmtEGP(costs.total_labor||0)]].map(([label,value,color],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value font-bold" style={{color:color||"var(--color-text-1)"}}>{value}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>router.push("/commercial/invoices")} className="tb-btn tb-btn-secondary w-full justify-center">View All Invoices →</button>
            <button onClick={()=>router.push("/financial")} className="tb-btn tb-btn-ghost w-full justify-center">P&L Dashboard →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

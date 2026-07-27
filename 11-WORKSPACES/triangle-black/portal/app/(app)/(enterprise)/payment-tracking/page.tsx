"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const SC = {paid:"#34D399",pending:"#FBBF24",overdue:"#F87171",cancelled:"#94A3B8"};
export default function PaymentTrackingPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: payRaw, isLoading } = useQuery(["pt2-list"], () => authFetch("/api/v1/payment-tracking/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["pt2-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const pays = toArr(payRaw); const inv = toArr(invRaw);
  const source = pays.length>0 ? pays : inv;
  const totalAmount   = source.reduce((s,p)=>s+Number(p.total_amount||0),0);
  const paidAmount    = source.filter(p=>p.status==="paid").reduce((s,p)=>s+Number(p.total_amount||0),0);
  const pendingAmount = source.filter(p=>p.status==="pending").reduce((s,p)=>s+Number(p.total_amount||0),0);
  const overdueCount  = source.filter(p=>p.status==="overdue").length;
  const filtered = filter==="all" ? source : source.filter(p=>p.status===filter);
  const collRate = source.length>0 ? Math.round(source.filter(p=>p.status==="paid").length/source.length*100) : 0;
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1A18 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Finance</div>
          <h1 className="tb-hero-title">Payment Tracking</h1>
          <p className="tb-hero-description">{source.length} invoices · {fmtEGP(paidAmount)} collected · {collRate}% collection rate</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:fmtEGP(totalAmount),color:"#F1F5F9"},{label:"Paid",value:fmtEGP(paidAmount),color:"#34D399"},{label:"Pending",value:fmtEGP(pendingAmount),color:"#FBBF24"},{label:"Overdue",value:overdueCount,color:overdueCount>0?"#F87171":"#34D399"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all","paid","pending","overdue","cancelled"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f.charAt(0).toUpperCase()+f.slice(1)}{f!=="all"&&<span className="ml-1 opacity-60">{source.filter(p=>p.status===f).length}</span>}
              </button>
            ))}
          </div>
          {isLoading ? <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : filtered.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">💰</div><div className="tb-empty-title">No payments</div></div>
          : <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
            <div className="tb-table-head" style={{gridTemplateColumns:"1fr 100px 130px 110px"}}>
              {["Invoice","Status","Amount","Due Date"].map((h,i)=><div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>)}
            </div>
            {filtered.map((p,i)=>{
              const sc=SC[p.status]||"#94A3B8";
              return (
                <button key={i} onClick={()=>router.push("/invoices/"+(p.id||""))} className="tb-table-row" style={{gridTemplateColumns:"1fr 100px 130px 110px"}}>
                  <div className="text-sm font-medium text-primary truncate pr-4">{p.invoice_number||p.id?.slice(0,16)}</div>
                  <div className="text-center"><span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5625rem"}}>{p.status||"—"}</span></div>
                  <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(p.total_amount||0)}</div>
                  <div className="text-center text-xs text-tertiary">{fmtDate(p.due_date)}</div>
                </button>
              );
            })}
          </div>}
        </div>
        <div className="tb-section">
          <div className="tb-section-title">Collection Progress</div>
          <div className="tb-flex-between mb-2"><span className="text-xs text-secondary">Collected</span><span className="text-xs font-bold text-emerald-400">{collRate}%</span></div>
          <div className="tb-progress tb-progress--md">
            <div style={{display:"flex",height:"100%"}}>
              <div className="tb-progress-bar" style={{background:"#34D399",width:(totalAmount>0?paidAmount/totalAmount*100:0)+"%"}}/>
              <div className="tb-progress-bar" style={{background:"#FBBF24",width:(totalAmount>0?pendingAmount/totalAmount*100:0)+"%"}}/>
            </div>
          </div>
          <div className="mt-3"><button onClick={()=>router.push("/invoices")} className="tb-action-item w-full justify-start"><span>💰</span><span className="text-sm text-secondary">All Invoices</span></button></div>
        </div>
      </div>
    </div>
  );
}

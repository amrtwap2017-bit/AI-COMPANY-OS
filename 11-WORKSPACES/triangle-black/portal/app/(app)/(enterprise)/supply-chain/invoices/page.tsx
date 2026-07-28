"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {
  draft:"#94A3B8", submitted:"#60A5FA", matching:"#A78BFA",
  matched:"#34D399", mismatch:"#F87171", approved:"#34D399",
  rejected:"#F87171", paid:"#10B981", cancelled:"#94A3B8"
};
const MC = { matched:"#34D399", partial:"#FBBF24", mismatch:"#F87171", pending:"#94A3B8" };
export default function InvoicesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(
    ["invoices-list", filter],
    () => authFetch(`/api/v1/supplier-invoices/${filter !== "all" ? `?status=${filter}` : ""}`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const { data: dash } = useQuery(["invoice-dash"], () => authFetch("/api/v1/supplier-invoices/dashboard").then(r=>r.json()), { staleTime: 60000 });
  const invoices = toArr(raw);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A2A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <div>
              <div className="text-label-upper text-blue-400 mb-1">Financial Operations</div>
              <h1 className="tb-hero-title">Invoice Management</h1>
              <p className="tb-hero-description">3-Way Match: Purchase Order → Goods Receipt → Invoice</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>router.push("/supply-chain/invoices/new")} className="tb-btn-primary">+ New Invoice</button>
              <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Procurement</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total Invoices",value:dash?.totals?.total||0,color:"#F1F5F9"},
              {label:"Total Value",value:fmtEGP(dash?.totals?.total_value||0),color:"#60A5FA"},
              {label:"Outstanding",value:fmtEGP(dash?.totals?.total_outstanding||0),color:"#FBBF24"},
              {label:"Mismatches",value:dash?.by_status?.mismatch||0,color:(dash?.by_status?.mismatch||0)>0?"#F87171":"#34D399"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all","submitted","matching","approved","mismatch","paid"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                {f!=="all" && <span className="ml-1 opacity-60">{dash?.by_status?.[f]||0}</span>}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : invoices.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">📄</div><div className="tb-empty-title">No invoices found</div></div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 130px 110px 120px 110px 100px 110px"}}>
                {["Invoice / Vendor","Status","Match","Total","Balance","Due Date","Action"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {invoices.map((inv,i)=>{
                const sc=SC[inv.status]||"#94A3B8";
                const mc=MC[inv.match_result]||"#94A3B8";
                const overdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.payment_status !== "paid";
                return (
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"1fr 130px 110px 120px 110px 100px 110px"}}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary truncate">{inv.invoice_number}</div>
                      <div className="text-xs text-tertiary truncate">{inv.vendor_name||"—"}</div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:sc+"18",color:sc,border:`1px solid ${sc}30`,fontSize:"0.5rem"}}>{inv.status}</span>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:mc+"18",color:mc,border:`1px solid ${mc}30`,fontSize:"0.5rem"}}>{inv.match_result||"pending"}</span>
                    </div>
                    <div className="text-center text-sm font-bold text-primary">{fmtEGP(inv.total_amount||0)}</div>
                    <div className="text-center text-sm font-bold" style={{color:Number(inv.balance_due||0)>0?"#FBBF24":"#34D399"}}>{fmtEGP(inv.balance_due||0)}</div>
                    <div className="text-center text-xs" style={{color:overdue?"#F87171":"#94A3B8"}}>{fmtDate(inv.due_date)}</div>
                    <div className="text-center">
                      <button onClick={()=>router.push("/supply-chain/invoices/"+inv.id)} className="tb-btn-secondary" style={{fontSize:"0.6rem",padding:"4px 8px"}}>View →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

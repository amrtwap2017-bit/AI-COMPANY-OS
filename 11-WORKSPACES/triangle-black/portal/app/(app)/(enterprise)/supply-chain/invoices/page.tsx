"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {
  draft:"#6D5F53", submitted:"#5B7C8C", matching:"#8D7443",
  matched:"#547C4D", mismatch:"#A84A3D", approved:"#547C4D",
  rejected:"#A84A3D", paid:"#547C4D", cancelled:"#6D5F53"
};
const MC = { matched:"#547C4D", partial:"#B07A2A", mismatch:"#A84A3D", pending:"#6D5F53" };
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
  const handleExport = (url: string) => {
    import("@/lib/hooks/useAuthFetch").then(m => m.authFetch(url))
      .then(r => r.blob())
      .then(blob => {
        const dl = document.createElement("a");
        dl.href = URL.createObjectURL(blob);
        dl.download = url.split("/").pop() + "_" + new Date().toISOString().slice(0,10) + ".csv";
        dl.click();
      });
  };
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
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
              {label:"Total Invoices",value:dash?.totals?.total||0,color:"#221D1A"},
              {label:"Total Value",value:fmtEGP(dash?.totals?.total_value||0),color:"#5B7C8C"},
              {label:"Outstanding",value:fmtEGP(dash?.totals?.total_outstanding||0),color:"#B07A2A"},
              {label:"Mismatches",value:dash?.by_status?.mismatch||0,color:(dash?.by_status?.mismatch||0)>0?"#A84A3D":"#547C4D"},
            ].map((k: any, i: number) =>(
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
            {["all","submitted","matching","approved","mismatch","paid"].map((f: any) =>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                {f!=="all" && <span className="ml-1 opacity-60">{dash?.by_status?.[f]||0}</span>}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map((i: any) =><div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : invoices.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">📄</div><div className="tb-empty-title">No invoices found</div></div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 130px 110px 120px 110px 100px 110px"}}>
                {["Invoice / Vendor","Status","Match","Total","Balance","Due Date","Action"].map((h: any, i: number) =>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {invoices.map((inv: any, i: any) =>{
                const sc=SC[inv.status]||"#6D5F53";
                const mc=MC[inv.match_result]||"#6D5F53";
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
                    <div className="text-center text-sm font-bold" style={{color:Number(inv.balance_due||0)>0?"#B07A2A":"#547C4D"}}>{fmtEGP(inv.balance_due||0)}</div>
                    <div className="text-center text-xs" style={{color:overdue?"#A84A3D":"#6D5F53"}}>{fmtDate(inv.due_date)}</div>
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

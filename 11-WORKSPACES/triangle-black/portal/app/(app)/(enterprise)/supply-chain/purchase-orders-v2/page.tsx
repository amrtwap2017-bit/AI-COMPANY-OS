"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const SC = {draft:"#94A3B8",pending_approval:"#FBBF24",approved:"#60A5FA",sent:"#A78BFA",acknowledged:"#A78BFA",partial:"#FB923C",received:"#34D399",invoiced:"#34D399",paid:"#34D399",cancelled:"#F87171"};
export default function PurchaseOrdersV2Page() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(
    ["pos-v2-list"],
    () => authFetch("/api/v1/purchase-orders-v2/").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const pos = toArr(raw);
  const filtered = filter==="all" ? pos : pos.filter(p=>p.status===filter);
  const totalValue = filtered.reduce((s,p)=>s+Number(p.total_amount||0),0);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Procurement</div>
              <h1 className="tb-hero-title">Purchase Orders</h1>
              <p className="tb-hero-description">{pos.length} POs · Multi-currency · Full editing</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
            </div>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Total POs",value:pos.length,color:"#F1F5F9"},
              {label:"Pending",value:pos.filter(p=>p.status==="pending_approval").length,color:"#FBBF24"},
              {label:"Approved",value:pos.filter(p=>p.status==="approved").length,color:"#34D399"},
              {label:"Total Value",value:fmtEGP(pos.reduce((s,p)=>s+Number(p.total_amount||0),0)),color:"#A78BFA"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all","draft","pending_approval","approved","sent","received","paid"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All":f.replace(/_/g," ")}
                {f!=="all" && <span className="ml-1 opacity-60">{pos.filter(p=>p.status===f).length}</span>}
              </button>
            ))}
          </div>
          <div className="tb-flex-between mb-3">
            <div className="text-sm text-secondary">{filtered.length} POs</div>
            <div className="text-sm font-bold text-emerald-400">{fmtEGP(totalValue)}</div>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">📦</div><div className="tb-empty-title">No purchase orders</div></div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"1.5fr 160px 100px 120px 110px"}}>
                {["PO / Vendor","Status","Currency","Total","Date"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((po,i)=>{
                const sc = SC[po.status]||"#94A3B8";
                return (
                  <button key={i} onClick={()=>router.push("/supply-chain/purchase-orders-v2/"+po.id)} className="tb-table-row" style={{gridTemplateColumns:"1.5fr 160px 100px 120px 110px"}}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary truncate">{po.po_number||po.id?.slice(0,14)}</div>
                      <div className="text-xs text-tertiary truncate">{po.vendor_name||"—"}</div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5625rem"}}>{(po.status||"").replace(/_/g," ")}</span>
                    </div>
                    <div className="text-center text-xs font-bold text-secondary">{po.currency||"EGP"}</div>
                    <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(po.total_amount||0)}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(po.created_at)}</div>
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

"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = { open:"#60A5FA", sent:"#A78BFA", received:"#FBBF24", closed:"#34D399", cancelled:"#94A3B8" };
export default function RFQsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: rfqRaw, isLoading } = useQuery(["rfq-list"], () => authFetch("/api/v1/rfqs-portal").then(r=>r.json()));
  const rfqs = toArr(rfqRaw);
  const filtered = rfqs.filter(r => !search || (r.rfq_number||r.title||r.id||"").toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
          <h1 className="tb-hero-title">Requests for Quotation</h1>
          <p className="tb-hero-description">{rfqs.length} RFQs · {rfqs.filter(r=>r.status==="open").length} open</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:rfqs.length,color:"#F1F5F9"},{label:"Open",value:rfqs.filter(r=>r.status==="open").length,color:"#60A5FA"},{label:"Received",value:rfqs.filter(r=>r.status==="received").length,color:"#FBBF24"},{label:"Closed",value:rfqs.filter(r=>r.status==="closed").length,color:"#34D399"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex items-center gap-2 mb-4"><span className="text-secondary text-sm">🔍</span><input className="tb-search flex-1" placeholder="Search RFQs..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : filtered.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">📝</div><div className="tb-empty-title">No RFQs found</div></div>
          : <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
            <div className="tb-table-head" style={{gridTemplateColumns:"1fr 100px 120px 110px"}}>
              {["RFQ","Status","Supplier","Date"].map((h,i)=><div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>)}
            </div>
            {filtered.map((rfq,i)=>{
              const sc = SC[rfq.status]||"#94A3B8";
              return (
                <button key={i} onClick={()=>router.push("/supply-chain/rfqs/"+rfq.id)} className="tb-table-row" style={{gridTemplateColumns:"1fr 100px 120px 110px"}}>
                  <div className="text-sm font-medium text-primary truncate pr-4">{rfq.rfq_number||rfq.title||rfq.id?.slice(0,16)}</div>
                  <div className="text-center"><span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5625rem"}}>{rfq.status||"—"}</span></div>
                  <div className="text-center text-xs text-secondary truncate px-1">{rfq.supplier_name||"—"}</div>
                  <div className="text-center text-xs text-tertiary">{fmtDate(rfq.created_at)}</div>
                </button>
              );
            })}
          </div>}
        </div>
        <div className="tb-section">
          <div className="space-y-2">
            {[{label:"Purchase Orders",icon:"📦",path:"/supply-chain/purchase-orders"},{label:"Suppliers",icon:"🏭",path:"/supply-chain/suppliers"},{label:"Purchase Requests",icon:"📋",path:"/supply-chain/purchase-requests"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

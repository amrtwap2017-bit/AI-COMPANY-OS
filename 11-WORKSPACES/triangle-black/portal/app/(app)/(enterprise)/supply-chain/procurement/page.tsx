"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function ProcurementHub() {
  const router = useRouter();
  const { data: dash } = useQuery(["proc-dash"], () => authFetch("/api/v1/procurement/dashboard").then(r=>r.json()), { staleTime:60000 });
  const d = dash || {};
  const modules = [
    {label:"Scope of Work",    icon:"📋", path:"/supply-chain/scope-of-work",   desc:"BOQ & cost estimates",        count:d.sow?.total||0,      color:"#60A5FA"},
    {label:"Vendor Management",icon:"🏭", path:"/supply-chain/vendor-management",desc:"Approved vendor list",        count:d.vendors?.total||0,  color:"#34D399"},
    {label:"RFQ",              icon:"📝", path:"/supply-chain/rfq-management",  desc:"Request for quotations",      count:d.rfqs?.total||0,     color:"#FBBF24"},
    {label:"Bid Comparison",   icon:"⚖️",  path:"/supply-chain/bid-comparison",  desc:"Compare & select vendors",    count:d.rfqs?.with_quotes||0,color:"#A78BFA"},
    {label:"Purchase Orders",  icon:"📦", path:"/supply-chain/purchase-orders-v2",desc:"POs with full editing",    count:d.pos?.total||0,      color:"#F97316"},
    {label:"Goods Receipt",    icon:"✅", path:"/supply-chain/goods-receipts",  desc:"Receive & inspect deliveries",count:d.grns?.total||0,     color:"#34D399"},
    {label:"Approvals",        icon:"✍️",  path:"/supply-chain/approvals-center",desc:"Pending approvals",          count:d.approvals?.pending||0,color:"#F87171"},
    {label:"Procurement Report",icon:"📊",path:"/executive/reports",            desc:"Analytics & KPIs",            count:null,                 color:"#94A3B8"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
          <h1 className="tb-hero-title">Procurement Management</h1>
          <p className="tb-hero-description">End-to-end procurement: SOW → Vendor → RFQ → PO → GRN</p>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Open SOWs",     value:d.sow?.pending||0,        color:"#60A5FA"},
              {label:"Active Vendors",value:d.vendors?.approved||0,   color:"#34D399"},
              {label:"Active RFQs",   value:d.rfqs?.active||0,        color:"#FBBF24"},
              {label:"Pending Approvals",value:d.approvals?.pending||0,color:d.approvals?.pending>0?"#F87171":"#34D399"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Procurement Modules</div>
          <div className="tb-grid-4">
            {modules.map((m,i)=>(
              <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span style={{fontSize:"1.75rem"}}>{m.icon}</span>
                  {m.count!==null&&<span className="text-2xl font-black" style={{color:m.color}}>{m.count}</span>}
                </div>
                <div className="text-sm font-bold text-primary mb-1">{m.label}</div>
                <div className="text-xs text-tertiary">{m.desc}</div>
                <div className="text-xs text-brand mt-3">Open →</div>
              </button>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="tb-section-title">Workflow</div>
          <div className="flex items-center gap-2 flex-wrap">
            {["Service Request","→","Scope of Work / BOQ","→","Cost Approval","→","RFQ to Vendors","→","Bid Comparison","→","PO Approval","→","Goods Receipt","→","Invoice Matching"].map((step,i)=>(
              <span key={i} className={step==="→"?"text-tertiary text-lg":"tb-badge"} style={step!=="→"?{background:"rgba(255,255,255,0.05)",color:"#94A3B8",padding:"4px 8px"}:{}}>{step}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

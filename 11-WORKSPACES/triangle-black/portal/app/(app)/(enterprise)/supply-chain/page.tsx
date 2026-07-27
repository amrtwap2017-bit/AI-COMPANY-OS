"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function SupplyChainHub() {
  const router = useRouter();
  const { data: poRaw } = useQuery(["sc-hub-pos"], () => authFetch("/api/v1/purchase-orders/").then(r=>r.json()));
  const { data: prRaw } = useQuery(["sc-hub-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["sc-hub-inv"], () => authFetch("/api/v1/inventory-items/").then(r=>r.json()));
  const { data: suppRaw } = useQuery(["sc-hub-supps"], () => authFetch("/api/v1/suppliers/").then(r=>r.json()));
  const pos = toArr(poRaw); const prs = toArr(prRaw);
  const inv = toArr(invRaw); const supps = toArr(suppRaw);
  const modules = [
    { label:"Purchase Orders",    icon:"📦", path:"/supply-chain/purchase-orders",    count:pos.length,  color:"#34D399" },
    { label:"Purchase Requests",  icon:"📋", path:"/supply-chain/purchase-requests",  count:prs.length,  color:"#60A5FA" },
    { label:"Inventory",          icon:"📦", path:"/supply-chain/inventory",          count:inv.length,  color:"#FBBF24" },
    { label:"Suppliers",          icon:"🏭", path:"/supply-chain/suppliers",          count:supps.length,color:"#A78BFA" },
    { label:"Warehouses",         icon:"🏗️",  path:"/supply-chain/warehouses",         count:null,        color:"#94A3B8" },
    { label:"Goods Receipts",     icon:"✅", path:"/supply-chain/goods-receipts",     count:null,        color:"#34D399" },
    { label:"RFQs",               icon:"📝", path:"/supply-chain/rfqs",               count:null,        color:"#60A5FA" },
    { label:"Stock Levels",       icon:"⚖️",  path:"/supply-chain/stock-levels",       count:null,        color:"#FBBF24" },
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Supply Chain</h1>
          <p className="tb-hero-description">Procurement, inventory, suppliers and logistics</p>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Purchase Orders",  value:pos.length,   color:"#34D399" },
              { label:"Open PRs",         value:prs.filter(p=>p.status==="pending"||p.status==="open").length, color:"#60A5FA" },
              { label:"Inventory Items",  value:inv.length,   color:"#FBBF24" },
              { label:"Suppliers",        value:supps.length, color:"#A78BFA" },
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Supply Chain Modules</div>
          <div className="tb-grid-4">
            {modules.map((m,i)=>(
              <button key={i} onClick={()=>router.push(m.path)} className="tb-section text-left hover:border-brand transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span style={{fontSize:"1.75rem"}}>{m.icon}</span>
                  {m.count!==null && <span className="text-2xl font-black" style={{color:m.color}}>{m.count}</span>}
                </div>
                <div className="text-sm font-bold text-primary">{m.label}</div>
                <div className="text-xs text-brand mt-2">View →</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { FeatureGate } from "@/components/ui/FeatureGate";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
function SupplyChainHubInner() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter();
  useEffect(() => { setMounted(true) }, [])
  const { data: poRaw } = useQuery(["sc-hub-pos"], () => authFetch("/api/v1/purchase-orders-portal").then(r=>r.json()));
  const { data: prRaw } = useQuery(["sc-hub-prs"], () => authFetch("/api/v1/purchase-requests-portal").then(r=>r.json()));
  const { data: invRaw } = useQuery(["sc-hub-inv"], () => authFetch("/api/v1/inventory-items-portal").then(r=>r.json()));
  const { data: suppRaw } = useQuery(["sc-hub-supps"], () => authFetch("/api/v1/suppliers/").then(r=>r.json()));
  const pos = toArr(poRaw); const prs = toArr(prRaw);
  const inv = toArr(invRaw); const supps = toArr(suppRaw);
  const modules = [
    { label:"Purchase Orders",    icon:"📦", path:"/supply-chain/purchase-orders",    count:pos.length,  color:"#547C4D" },
    { label:"Purchase Requests",  icon:"📋", path:"/supply-chain/purchase-requests",  count:prs.length,  color:"#5B7C8C" },
    { label:"Inventory",          icon:"📦", path:"/supply-chain/inventory",          count:inv.length,  color:"#B07A2A" },
    { label:"Suppliers",          icon:"🏭", path:"/supply-chain/suppliers",          count:supps.length,color:"#8D7443" },
    { label:"Warehouses",         icon:"🏗️",  path:"/supply-chain/warehouses",         count:null,        color:"#6D5F53" },
    { label:"Goods Receipts",     icon:"✅", path:"/supply-chain/goods-receipts",     count:null,        color:"#547C4D" },
    { label:"RFQs",               icon:"📝", path:"/supply-chain/rfqs",               count:null,        color:"#5B7C8C" },
    { label:"Stock Levels",       icon:"⚖️",  path:"/supply-chain/stock-levels",       count:null,        color:"#B07A2A" },
  ];
  if (!mounted) return null
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Platform</div>
          <h1 className="tb-hero-title">Supply Chain</h1>
          <p className="tb-hero-description">Procurement, inventory, suppliers and logistics</p>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Purchase Orders",  value:pos.length,   color:"#547C4D" },
              { label:"Open PRs",         value:prs.filter((p: any) =>p.status==="pending"||p.status==="open").length, color:"#5B7C8C" },
              { label:"Inventory Items",  value:inv.length,   color:"#B07A2A" },
              { label:"Suppliers",        value:supps.length, color:"#8D7443" },
            ].map((k: any, i: number) =>(
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
            {modules.map((m: any, i: number) =>(
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


export default function SupplyChainHub(props: any) {
  return (
    <FeatureGate feature="supply_chain">
      <SupplyChainHubInner {...props} />
    </FeatureGate>
  );
}

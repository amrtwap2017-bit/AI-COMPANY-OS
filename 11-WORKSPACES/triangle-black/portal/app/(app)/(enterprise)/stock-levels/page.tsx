"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function StockLevelsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: stockRaw, isLoading } = useQuery(["sl-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const { data: itemRaw } = useQuery(["sl-items"], () => authFetch("/api/v1/inventory-items-portal").then(r=>r.json()));
  const stocks = toArr(stockRaw); const items = toArr(itemRaw);
  const enriched = stocks.map(s=>{
    const item=items.find(i=>i.id===s.item_id);
    const min=Number(item?.minimum_quantity||item?.min_quantity||5);
    const qty=Number(s.qty_on_hand||0);
    return {...s,item_name:item?.name||"—",category:item?.category||"—",min_qty:min,qty,is_low:qty<=min};
  });
  const lowStock = enriched.filter(s=>s.is_low);
  const filtered = filter==="all" ? enriched : filter==="low" ? lowStock : enriched.filter(s=>!s.is_low);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
          <h1 className="tb-hero-title">Stock Levels</h1>
          <p className="tb-hero-description">{stocks.length} stock records · {lowStock.length} below minimum</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Records",value:stocks.length,color:"#221D1A"},{label:"Low Stock",value:lowStock.length,color:lowStock.length>0?"#A84A3D":"#547C4D"},{label:"In Stock",value:enriched.filter(s=>!s.is_low).length,color:"#547C4D"},{label:"Items",value:items.length,color:"#5B7C8C"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {lowStock.length>0&&(
          <div className="tb-section" style={{borderColor:"#A84A3D40",background:"#A84A3D08"}}>
            <div className="flex items-center gap-2"><span>⚠️</span><span className="text-sm font-semibold text-red-400">{lowStock.length} items below minimum stock level</span><button onClick={()=>router.push("/supply-chain/purchase-requests")} className="tb-section-link ml-auto">Create PR →</button></div>
          </div>
        )}
        <div className="tb-section">
          <div className="flex gap-2 mb-4">
            {["all","low","ok"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All Stock":f==="low"?"Low Stock":"In Stock"}
                {f==="low"&&lowStock.length>0&&<span className="ml-1 opacity-80">{lowStock.length}</span>}
              </button>
            ))}
          </div>
          {isLoading ? <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-12 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
            <div className="tb-table-head" style={{gridTemplateColumns:"2fr 100px 80px 80px 100px"}}>
              {["Item","Category","On Hand","Min","Status"].map((h,i)=><div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>)}
            </div>
            {filtered.map((s,i)=>{
              const c=s.is_low?"#A84A3D":"#547C4D";
              return (
                <button key={i} onClick={()=>router.push("/supply-chain/inventory/"+(s.item_id||s.id))} className="tb-table-row" style={{gridTemplateColumns:"2fr 100px 80px 80px 100px"}}>
                  <div className="text-sm font-medium text-primary truncate pr-4">{s.item_name}</div>
                  <div className="text-center"><span className="tb-badge" style={{fontSize:"0.5625rem"}}>{s.category}</span></div>
                  <div className="text-center text-sm font-bold" style={{color:c}}>{s.qty}</div>
                  <div className="text-center text-xs text-tertiary">{s.min_qty}</div>
                  <div className="text-center"><span className="tb-badge" style={{background:c+"18",color:c,border:"1px solid "+c+"30",fontSize:"0.5625rem"}}>{s.is_low?"Low":"OK"}</span></div>
                </button>
              );
            })}
          </div>}
        </div>
      </div>
    </div>
  );
}

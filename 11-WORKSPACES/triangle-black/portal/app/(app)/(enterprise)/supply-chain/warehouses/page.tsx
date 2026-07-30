"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function WarehousesPage() {
  const router = useRouter();
  const { data: whRaw, isLoading } = useQuery(["wh-list"], () => authFetch("/api/v1/warehouses-portal").then(r=>r.json()));
  const { data: stockRaw } = useQuery(["wh-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const whs = toArr(whRaw); const stocks = toArr(stockRaw);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
          <h1 className="tb-hero-title">Warehouses</h1>
          <p className="tb-hero-description">{whs.length} warehouses · {stocks.length} stock balance records</p>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total",          value:whs.length,    color:"#F1F5F9" },
              { label:"Stock Records",  value:stocks.length, color:"#34D399" },
              { label:"Active",         value:whs.filter(w=>w.status==="active"||!w.status).length, color:"#60A5FA" },
              { label:"Locations",      value:whs.length,    color:"#A78BFA" },
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-flex-between mb-4"><div className="text-sm text-secondary">{whs.length} warehouses</div><button onClick={()=>router.push("/supply-chain/inventory")} className="tb-section-link">Inventory →</button></div>
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : whs.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">🏗️</div><div className="tb-empty-title">No warehouses found</div></div>
          : <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {whs.map((wh,i)=>{
              const whStocks = stocks.filter(s=>s.warehouse_id===wh.id);
              return (
                <button key={i} onClick={()=>router.push("/supply-chain/warehouses/"+wh.id)} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{fontSize:"1.5rem"}}>🏗️</span>
                    <div><div className="text-sm font-bold text-primary">{wh.name||"—"}</div><div className="text-xs text-tertiary">{wh.location||"—"}</div></div>
                  </div>
                  <div className="text-xs text-tertiary">{whStocks.length} stock items</div>
                </button>
              );
            })}
          </div>}
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Related</div>
          <div className="tb-grid-3">
            {[{label:"Inventory",icon:"📦",path:"/supply-chain/inventory"},{label:"Purchase Orders",icon:"📦",path:"/supply-chain/purchase-orders"},{label:"Goods Receipts",icon:"✅",path:"/supply-chain/goods-receipts"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span><span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

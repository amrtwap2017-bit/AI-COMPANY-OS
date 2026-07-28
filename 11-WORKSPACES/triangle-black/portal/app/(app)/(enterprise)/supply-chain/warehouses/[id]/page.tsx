"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: whRaw, isLoading } = useQuery(["wh-d", id], () => authFetch("/api/v1/warehouses-portal").then(r=>r.json()));
  const { data: stockRaw } = useQuery(["wh-d-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const { data: itemRaw } = useQuery(["wh-d-items"], () => authFetch("/api/v1/inventory-items-portal").then(r=>r.json()));
  const whs = toArr(whRaw); const stocks = toArr(stockRaw); const items = toArr(itemRaw);
  const wh = whs.find(w=>w.id===id)||whs[0];
  const whStocks = stocks.filter(s=>s.warehouse_id===(wh?.id||id));
  const totalValue = whStocks.reduce((s,b)=>{
    const item=items.find(i=>i.id===b.item_id);
    return s+(Number(b.qty_on_hand||b.qty||0)*Number(item?.unit_price||item?.cost||0));
  },0);
  const lowStock = whStocks.filter(b=>{
    const item=items.find(i=>i.id===b.item_id);
    return Number(b.qty_on_hand||b.qty||0)<=Number(item?.minimum_quantity||item?.min_quantity||5);
  });
  if (!isLoading && !wh) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty"><div className="tb-empty-icon">🏗️</div><div className="tb-empty-title">Warehouse not found</div>
        <button onClick={()=>router.push("/supply-chain/warehouses")} className="tb-btn-primary mt-4">Back</button></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain · Warehouses</div>
              <h1 className="tb-hero-title">{wh?.name||"Warehouse"}</h1>
              <p className="tb-hero-description">{wh?.location||"—"} · {whStocks.length} items · {fmtEGP(totalValue)} value</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/warehouses")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Stock Items",value:whStocks.length,color:"#34D399"},{label:"Low Stock",value:lowStock.length,color:lowStock.length>0?"#F87171":"#34D399"},{label:"Total Value",value:fmtEGP(totalValue),color:"#FBBF24"},{label:"Status",value:wh?.status||"Active",color:"#60A5FA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {lowStock.length>0&&(
          <div className="tb-section" style={{borderColor:"#F8717140",background:"#F8717108"}}>
            <div className="flex items-center gap-2"><span>⚠️</span><span className="text-sm font-semibold text-red-400">{lowStock.length} items below minimum in this warehouse</span><button onClick={()=>router.push("/supply-chain/purchase-requests")} className="tb-section-link ml-auto">Create PR →</button></div>
          </div>
        )}
        <div className="tb-section">
          <div className="tb-section-title">Warehouse Details</div>
          <div className="space-y-1">
            {[["Name",wh?.name||"—"],["Location",wh?.location||"—"],["Capacity",wh?.capacity||"—"],["Status",wh?.status||"Active"],["Manager",wh?.manager||"—"],["Warehouse ID",wh?.id||id]].map(([l,v],i)=>(
              <div key={i} className="tb-info-row"><span className="tb-info-label">{l}</span><span className="tb-info-value">{v}</span></div>
            ))}
          </div>
        </div>
        {whStocks.length>0&&(
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Stock Items ({whStocks.length})</div><button onClick={()=>router.push("/supply-chain/inventory")} className="tb-section-link">Inventory →</button></div>
            <div className="space-y-2 mt-3">
              {whStocks.slice(0,10).map((s,i)=>{
                const item=items.find(it=>it.id===s.item_id);
                const qty=Number(s.qty_on_hand||s.qty||0);
                const min=Number(item?.minimum_quantity||item?.min_quantity||5);
                const isLow=qty<=min;
                return (
                  <button key={i} onClick={()=>router.push("/supply-chain/inventory/"+(s.item_id||s.id))} className="tb-action-item w-full justify-between">
                    <div className="flex items-center gap-2 min-w-0"><span>📦</span><span className="text-sm text-secondary truncate">{item?.name||s.item_id?.slice(0,16)||"—"}</span></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold" style={{color:isLow?"#F87171":"#34D399"}}>{qty}</span>
                      {isLow&&<span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem"}}>Low</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="tb-section">
          <div className="tb-section-title">Quick Actions</div>
          <div className="space-y-2">
            {[{label:"All Warehouses",icon:"🏗️",path:"/supply-chain/warehouses"},{label:"Inventory",icon:"📦",path:"/supply-chain/inventory"},{label:"Purchase Requests",icon:"📋",path:"/supply-chain/purchase-requests"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

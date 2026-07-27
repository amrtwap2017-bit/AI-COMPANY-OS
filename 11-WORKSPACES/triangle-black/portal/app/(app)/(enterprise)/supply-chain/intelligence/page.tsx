"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function SupplyChainIntelligence() {
  const router = useRouter();
  const { data: stockRaw } = useQuery(["sci-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["sci-inv"], () => authFetch("/api/v1/inventory-items/").then(r=>r.json()));
  const { data: prRaw } = useQuery(["sci-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: supplierRaw } = useQuery(["sci-suppliers"], () => authFetch("/api/v1/suppliers/").then(r=>r.json()));
  const stock=toArr(stockRaw); const invItems=toArr(invRaw); const prs=toArr(prRaw); const suppliers=toArr(supplierRaw);
  const totalValue=stock.reduce((s,i)=>s+Number(i.total_value||0),0);
  const lowStock=stock.filter(s=>{const item=invItems.find(i=>i.id===s.item_id);return Number(s.qty_on_hand||0)<Number(item?.min_stock||999);});
  const autoPRs=prs.filter(p=>p.title?.startsWith("Auto-PR:"));
  const preferredSuppliers=suppliers.filter(s=>s.preferred_flag);
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Supply Chain Intelligence</div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Supply Chain Intelligence</h1>
      <p className="text-slate-500 mt-1">Inventory insights, supplier performance, and procurement analytics</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total Stock Value",value:fmtEGP(totalValue),color:"emerald",path:"/supply-chain/stock-balances"},
          {label:"Low Stock Items",value:lowStock.length,color:lowStock.length>0?"red":"emerald",path:"/supply-chain/reorder"},
          {label:"Auto PRs Created",value:autoPRs.length,color:"blue",path:"/supply-chain/purchase-requests"},
          {label:"Preferred Suppliers",value:preferredSuppliers.length,color:"amber",path:"/supply-chain/suppliers"},
        ].map((k,i)=>(
          <button key={i} onClick={()=>router.push(k.path)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-slate-500 mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Low Stock Alerts</h2>
          {lowStock.length===0?(<div className="text-center py-6 text-slate-400">✅ All items above minimum</div>):(
            lowStock.slice(0,6).map((s,i)=>(
              <div key={i} className="flex items-center justify-between p-3 mb-1 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div><div className="text-sm font-medium">{s.item_name}</div><div className="text-xs text-slate-500">{s.warehouse_name}</div></div>
                <div className="text-right"><div className="font-black text-red-500">{Math.round(s.qty_on_hand)}</div><div className="text-xs text-slate-400">on hand</div></div>
              </div>
            ))
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Supplier Overview</h2>
          <div className="space-y-2">
            {suppliers.slice(0,6).map((s,i)=>(
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div><div className="text-sm font-medium">{s.company_name}</div><div className="text-xs text-slate-400">{s.supplier_type}</div></div>
                <div className="flex gap-1">
                  {s.preferred_flag&&<span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 rounded">★</span>}
                  <span className={`text-xs px-1.5 rounded ${s.risk_level==="low"?"bg-emerald-100 text-emerald-700":s.risk_level==="high"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{s.risk_level||"?"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
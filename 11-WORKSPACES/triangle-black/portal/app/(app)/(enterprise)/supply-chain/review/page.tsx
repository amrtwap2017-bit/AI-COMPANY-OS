"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function SupplyChainReview() {
  const router = useRouter();
  const { data: prRaw } = useQuery(["scr-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: poRaw } = useQuery(["scr-pos"], () => authFetch("/api/v1/purchase-orders/").then(r=>r.json()));
  const { data: stockRaw } = useQuery(["scr-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["scr-inv"], () => authFetch("/api/v1/inventory-items/").then(r=>r.json()));
  const prs=toArr(prRaw); const pos=toArr(poRaw); const stock=toArr(stockRaw); const invItems=toArr(invRaw);
  const totalStockValue=stock.reduce((s,i)=>s+Number(i.total_value||0),0);
  const lowStock=stock.filter(s=>{const item=invItems.find(i=>i.id===s.item_id);return Number(s.qty_on_hand||0)<Number(item?.min_stock||999);});
  const prByStatus=prs.reduce((acc,p)=>{acc[p.status||"unknown"]=(acc[p.status||"unknown"]||0)+1;return acc;},{});
  const poByStatus=pos.reduce((acc,p)=>{acc[p.status||"unknown"]=(acc[p.status||"unknown"]||0)+1;return acc;},{});
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Supply Chain Review</div>
      <h1 className="text-page-title text-primary">Supply Chain Review</h1>
      <p className="text-secondary mt-1">Procurement performance and inventory health</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total PRs",value:prs.length,color:"blue"},
          {label:"Total POs",value:pos.length,color:"purple"},
          {label:"Stock Value",value:fmtEGP(totalStockValue),color:"emerald"},
          {label:"Low Stock",value:lowStock.length,color:lowStock.length>0?"red":"emerald"},
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Purchase Requests by Status</h2>
          {Object.entries(prByStatus).map(([status,count],i)=>(
            <div key={i} className="flex justify-between py-2 border-b border-divider last:border-0">
              <span className="text-sm capitalize text-secondary">{status}</span>
              <span className="font-black text-primary">{count}</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Purchase Orders by Status</h2>
          {Object.entries(poByStatus).map(([status,count],i)=>(
            <div key={i} className="flex justify-between py-2 border-b border-divider last:border-0">
              <span className="text-sm capitalize text-secondary">{status}</span>
              <span className="font-black text-primary">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
        <h2 className="font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:"New PR",icon:"📝",path:"/supply-chain/purchase-requests"},
            {label:"Stock Levels",icon:"📦",path:"/supply-chain/stock-balances"},
            {label:"Reorder Alerts",icon:"🚨",path:"/supply-chain/reorder"},
            {label:"Suppliers",icon:"🏢",path:"/supply-chain/suppliers"},
          ].map((a,i)=>(
            <button key={i} onClick={()=>router.push(a.path)}
              className="bg-base-alt dark:bg-surface-alt rounded-xl p-4 text-center hover:bg-amber-50 transition-colors">
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-xs font-bold text-slate-700 dark:text-tertiary">{a.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
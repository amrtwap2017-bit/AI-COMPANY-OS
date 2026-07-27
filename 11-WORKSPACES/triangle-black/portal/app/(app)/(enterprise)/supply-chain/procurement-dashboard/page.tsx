"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function ProcurementDashboard() {
  const router = useRouter();
  const { data: prRaw } = useQuery(["pd-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: poRaw } = useQuery(["pd-pos"], () => authFetch("/api/v1/purchase-orders/").then(r=>r.json()));
  const { data: supplierRaw } = useQuery(["pd-sup"], () => authFetch("/api/v1/suppliers/").then(r=>r.json()));
  const { data: stockRaw } = useQuery(["pd-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["pd-inv"], () => authFetch("/api/v1/inventory-items/").then(r=>r.json()));
  const prs=toArr(prRaw); const pos=toArr(poRaw); const suppliers=toArr(supplierRaw);
  const stock=toArr(stockRaw); const invItems=toArr(invRaw);
  const pendingPRs=prs.filter(p=>p.status==="pending"||p.status==="submitted");
  const approvedPRs=prs.filter(p=>p.status==="approved");
  const activePOs=pos.filter(p=>p.status==="pending"||p.status==="submitted"||p.status==="sent");
  const totalPoValue=pos.reduce((s,p)=>s+Number(p.total_amount||p.amount||0),0);
  const lowStock=stock.filter(s=>{const item=invItems.find(i=>i.id===s.item_id);return Number(s.qty_on_hand||0)<Number(item?.min_stock||999);});
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Procurement</div>
      <h1 className="text-3xl font-black text-primary">Procurement Dashboard</h1>
      <p className="text-secondary mt-1">Purchase requests, orders, and supplier management</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Pending PRs",value:pendingPRs.length,sub:"awaiting approval",color:"amber",path:"/supply-chain/purchase-requests"},
          {label:"Active POs",value:activePOs.length,sub:`${fmtEGP(totalPoValue)} total`,color:"blue",path:"/supply-chain/purchase-orders"},
          {label:"Low Stock Items",value:lowStock.length,sub:"below minimum",color:lowStock.length>0?"red":"emerald",path:"/supply-chain/reorder"},
          {label:"Suppliers",value:suppliers.length,sub:`${suppliers.filter(s=>s.preferred_flag).length} preferred`,color:"purple",path:"/supply-chain/suppliers"},
        ].map((k,i)=>(
          <button key={i} onClick={()=>router.push(k.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Purchase Request Status</h2>
            <button onClick={()=>router.push("/supply-chain/purchase-requests")} className="text-xs text-amber-500">All →</button>
          </div>
          {[
            {label:"Pending",count:prs.filter(p=>p.status==="pending").length,color:"amber"},
            {label:"Submitted",count:prs.filter(p=>p.status==="submitted").length,color:"blue"},
            {label:"Approved",count:approvedPRs.length,color:"emerald"},
            {label:"Rejected",count:prs.filter(p=>p.status==="rejected").length,color:"red"},
          ].map((s,i)=>(
            <div key={i} className="flex items-center justify-between py-3 border-b border-divider last:border-0">
              <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${s.color}-500`}/><span className="text-sm">{s.label}</span></div>
              <span className={`font-black text-${s.color}-500 text-lg`}>{s.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Purchase Orders</h2>
            <button onClick={()=>router.push("/supply-chain/purchase-orders")} className="text-xs text-amber-500">All →</button>
          </div>
          {pos.slice(0,6).map((po,i)=>(
            <button key={i} onClick={()=>router.push(`/supply-chain/purchase-orders/${po.id}`)}
              className="w-full flex items-center justify-between p-2 mb-1 bg-base-alt dark:bg-surface-alt rounded-lg hover:bg-blue-50 text-left">
              <div><div className="text-sm font-medium truncate">{po.po_number||po.id?.slice(0,12)}</div><div className="text-xs text-tertiary">{fmtDate(po.created_at)}</div></div>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${po.status==="delivered"?"bg-emerald-100 text-emerald-700":po.status==="pending"?"bg-amber-100 text-amber-700":"bg-slate-100 text-secondary"}`}>{po.status||"—"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
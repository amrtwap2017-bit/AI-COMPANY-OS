"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_BADGE = {
  pending:   "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  sent:      "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  received:  "bg-emerald-100 text-emerald-700 font-semibold",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(["po-list"], () => authFetch("/api/v1/purchase-orders/").then(r=>r.json()));
  const { data: suppRaw } = useQuery(["po-suppliers"], () => authFetch("/api/v1/suppliers/").then(r=>r.json()));
  const pos       = toArr(raw);
  const suppliers = toArr(suppRaw);

  const pending   = pos.filter(p => p.status==="pending"||p.status==="submitted");
  const sent      = pos.filter(p => p.status==="sent");
  const received  = pos.filter(p => p.status==="received"||p.status==="delivered");
  const totalValue = pos.reduce((s,p) => s+Number(p.total_amount||p.amount||0), 0);
  const pendingValue = pending.reduce((s,p) => s+Number(p.total_amount||p.amount||0), 0);

  const filtered = pos.filter(p => {
    const matchSearch = !search || p.po_number?.toLowerCase().includes(search.toLowerCase()) || p.id?.slice(0,8).includes(search);
    const matchStatus = statusFilter==="all" || p.status===statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1.5">Supply Chain</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Purchase Orders</h1>
          <p className="text-slate-500 text-sm mt-1.5">{pos.length} total · {fmtEGP(totalValue)} spend · {pending.length} pending approval</p>
        </div>
        <button onClick={()=>router.push("/supply-chain/purchase-requests")}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all">
          View PRs →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Pending",    value:pending.length,   color:pending.length>0?"amber":"slate", sub:fmtEGP(pendingValue), filter:"pending" },
          { label:"Sent",       value:sent.length,      color:"blue",                            sub:"awaiting delivery",  filter:"sent" },
          { label:"Received",   value:received.length,  color:"emerald",                         sub:"completed",          filter:"received" },
          { label:"Total Spend",value:fmtEGP(totalValue),color:"purple",                         sub:`${pos.length} orders`,filter:"all" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(i<3?(statusFilter===k.filter?"all":k.filter):"all")}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 text-center transition-all hover:shadow-md ${statusFilter===k.filter&&i<3?`border-${k.color}-400 shadow-sm`:"border-slate-200 dark:border-slate-800 hover:border-amber-300"}`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{k.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{k.sub}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by PO number or ID..."
          className="flex-1 min-w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(search||statusFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");}} className="px-3 py-2 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">Clear ×</button>
        )}
        <div className="text-xs text-slate-400 self-center">{filtered.length} orders</div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <div className="font-bold text-slate-900 dark:text-white text-lg">No purchase orders found</div>
            <button onClick={()=>router.push("/supply-chain/purchase-requests")} className="mt-4 px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700">View PRs →</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_120px_120px_120px_110px] bg-slate-50 dark:bg-slate-800/50 px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div>Purchase Order</div>
              <div className="text-center">Status</div>
              <div className="text-right">Amount</div>
              <div>Supplier</div>
              <div className="text-center">Created</div>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map((po,i)=>{
                const supplier = suppliers.find(s=>s.id===po.supplier_id);
                return (
                  <button key={i} onClick={()=>router.push(`/supply-chain/purchase-orders/${po.id}`)}
                    className="w-full grid grid-cols-[1fr_120px_120px_120px_110px] items-center px-5 py-4 text-left hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors group">
                    <div className="min-w-0 pr-4">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-amber-600">{po.po_number||po.id?.slice(0,12)}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{po.notes?.slice(0,50)||"—"}</div>
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_BADGE[po.status]||"bg-slate-100 text-slate-600"}`}>{po.status||"—"}</span>
                    </div>
                    <div className="text-right text-sm font-bold text-emerald-600">{fmtEGP(po.total_amount||po.amount)}</div>
                    <div className="text-xs text-slate-500 truncate">{supplier?.company_name||po.supplier_id||"—"}</div>
                    <div className="text-center text-xs text-slate-400">{fmtDate(po.created_at)}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

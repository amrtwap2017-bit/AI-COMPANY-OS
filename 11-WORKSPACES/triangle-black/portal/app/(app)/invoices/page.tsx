// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_BADGE = {
  paid:      "bg-emerald-100 text-emerald-700 font-semibold",
  pending:   "bg-amber-100 text-amber-700",
  overdue:   "bg-red-100 text-red-700 font-bold",
  cancelled: "bg-slate-100 text-secondary",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(["inv-all"], () => authFetch("/api/v1/invoices/").then(r=>r.json()), {refetchInterval:120000});
  const invoices = toArr(raw);

  const paid      = invoices.filter(i => i.status==="paid");
  const pending   = invoices.filter(i => i.status==="pending");
  const overdue   = invoices.filter(i => i.status==="overdue");
  const cancelled = invoices.filter(i => i.status==="cancelled");

  const totalValue    = invoices.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const paidValue     = paid.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const pendingValue  = pending.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const overdueValue  = overdue.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const collectionRate = totalValue > 0 ? Math.round(paidValue/totalValue*100) : 0;

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) || inv.id?.slice(0,8).includes(search);
    const matchStatus = statusFilter==="all" || inv.status===statusFilter;
    return matchSearch && matchStatus;
  }).sort((a,b)=>{
    const order={overdue:0,pending:1,paid:2,cancelled:3};
    return (order[a.status]??2)-(order[b.status]??2);
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}</div>
    </div>
  );

  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-label-upper text-emerald-500 mb-1.5">Finance</div>
          <h1 className="text-page-title text-primary">Invoice Management</h1>
          <p className="text-secondary text-sm mt-1.5">{invoices.length} invoices · {collectionRate}% collection rate · {fmtEGP(pendingValue+overdueValue)} outstanding</p>
        </div>
        <div className={`rounded-2xl border px-6 py-4 text-center ${collectionRate>=90?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className={`text-4xl font-black ${collectionRate>=90?"text-emerald-500":"text-amber-500"}`}>{collectionRate}%</div>
          <div className="text-xs text-secondary mt-1">Collection Rate</div>
        </div>
      </div>

      {/* Revenue progress */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex justify-between text-xs text-secondary mb-2">
          <span>Revenue Collection Progress</span>
          <span>{fmtEGP(paidValue)} of {fmtEGP(totalValue)}</span>
        </div>
        <div className="w-full bg-base-alt rounded-full h-5 overflow-hidden">
          <div className="flex h-5">
            <div className="bg-emerald-500 h-5 transition-all" style={{width:`${paidValue/Math.max(totalValue,1)*100}%`}}/>
            <div className="bg-amber-400 h-5 transition-all" style={{width:`${pendingValue/Math.max(totalValue,1)*100}%`}}/>
            <div className="bg-red-500 h-5 transition-all" style={{width:`${overdueValue/Math.max(totalValue,1)*100}%`}}/>
          </div>
        </div>
        <div className="flex gap-5 mt-2 text-xs text-tertiary">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>{fmtEGP(paidValue)} Paid</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/>{fmtEGP(pendingValue)} Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>{fmtEGP(overdueValue)} Overdue</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Paid",       value:paid.length,      sub:fmtEGP(paidValue),    color:"emerald", filter:"paid" },
          { label:"Pending",    value:pending.length,   sub:fmtEGP(pendingValue), color:"amber",   filter:"pending" },
          { label:"Overdue",    value:overdue.length,   sub:fmtEGP(overdueValue), color:overdue.length>0?"red":"emerald", filter:"overdue" },
          { label:"Cancelled",  value:cancelled.length, sub:"closed",             color:"slate",   filter:"cancelled" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(statusFilter===k.filter?"all":k.filter)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 text-center transition-all hover:shadow-md ${statusFilter===k.filter?`border-${k.color}-400 shadow-sm`:"border-border hover:border-amber-300"}`}>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-sm font-medium text-slate-700 dark:text-tertiary mt-1">{k.label}</div>
            <div className="text-xs text-tertiary mt-0.5 truncate">{k.sub}</div>
          </button>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="tb-alert tb-alert-critical rounded-2xl">
          <div className="text-2xl">💰</div>
          <div className="flex-1">
            <div className="font-bold text-red-800 dark:text-red-300">{overdue.length} Overdue Invoices — {fmtEGP(overdueValue)} Uncollected</div>
            <div className="text-sm text-red-600 mt-0.5">Contact clients immediately to initiate collection</div>
          </div>
          <button onClick={()=>setStatusFilter("overdue")}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 flex-shrink-0">
            View Overdue
          </button>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by invoice number..."
          className="flex-1 min-w-48 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Status</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(search||statusFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");}} className="px-3 py-2 text-xs text-secondary bg-surface border border-border rounded-xl">Clear ×</button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} invoices</div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💰</div>
            <div className="font-bold text-primary text-lg">No invoices found</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_150px_130px_130px_120px] bg-base-alt dark:bg-surface-alt px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
              <div>Invoice</div>
              <div className="text-center">Status</div>
              <div className="text-right">Amount</div>
              <div className="text-center">Due Date</div>
              <div className="text-center">Created</div>
            </div>
            <div className="divide-y divide-y-border">
              {filtered.map((inv,i)=>(
                <button key={i} onClick={()=>router.push(`/invoices/${inv.id}`)}
                  className={`w-full grid grid-cols-[1fr_150px_130px_130px_120px] items-center px-5 py-4 text-left transition-colors group ${inv.status==="overdue"?"bg-red-50/30 dark:bg-red-900/5 hover:bg-red-50":"hover:bg-brand-light/20"}`}>
                  <div className="min-w-0 pr-4">
                    <div className="font-semibold text-sm text-primary truncate group-hover:text-amber-600">{inv.invoice_number||`INV-${inv.id?.slice(0,8)}`}</div>
                    <div className="text-xs text-tertiary mt-0.5">Invoice ID: {inv.id?.slice(0,12)}</div>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${STATUS_BADGE[inv.status]||"bg-slate-100 text-secondary"}`}>{inv.status||"—"}</span>
                  </div>
                  <div className="text-right text-sm font-bold text-primary">{fmtEGP(inv.total_amount)}</div>
                  <div className={`text-center text-xs ${inv.status==="overdue"?"text-red-500 font-bold":"text-secondary"}`}>
                    {fmtDate(inv.due_date)}
                    {inv.status==="overdue" && <div className="text-[10px] text-red-400">OVERDUE</div>}
                  </div>
                  <div className="text-center text-xs text-tertiary">{fmtDate(inv.created_at)}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

export default function InvoicesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(["inv-all"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const invoices = toArr(raw);
  const filtered = filter === "all" ? invoices : invoices.filter((i: any) => i.status === filter);

  const paid = invoices.filter((i: any) => i.status === "paid");
  const pending = invoices.filter((i: any) => i.status === "pending");
  const overdue = invoices.filter((i: any) => i.status === "overdue");
  const totalValue = invoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const paidValue = paid.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const pendingValue = pending.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const overdueValue = overdue.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const collectionRate = totalValue > 0 ? Math.round(paidValue / totalValue * 100) : 0;

  const statusConfig: any = {
    paid: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Paid" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
    overdue: { bg: "bg-red-100", text: "text-red-700", label: "Overdue" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-600", label: "Cancelled" },
  };

  if (isLoading) return <div className="p-6 text-slate-400">Loading invoices...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Finance</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Invoice Management</h1>
          <p className="text-slate-500 mt-1">Billing, payment tracking, and collection performance</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-6 py-4 text-center">
          <div className={`text-4xl font-black ${collectionRate >= 90 ? "text-emerald-500" : collectionRate >= 75 ? "text-amber-500" : "text-red-500"}`}>{collectionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">Collection Rate</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: fmtEGP(totalValue), sub: `${invoices.length} invoices`, color: "blue" },
          { label: "Collected", value: fmtEGP(paidValue), sub: `${paid.length} paid`, color: "emerald" },
          { label: "Pending", value: fmtEGP(pendingValue), sub: `${pending.length} invoices`, color: "amber" },
          { label: "Overdue", value: fmtEGP(overdueValue), sub: `${overdue.length} invoices`, color: "red" },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-xs text-slate-500 mb-2">{k.label}</div>
            <div className={`text-xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Collection Progress</span>
          <span>{fmtEGP(paidValue)} / {fmtEGP(totalValue)}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
          <div className="flex h-4">
            <div className="bg-emerald-500 h-4 transition-all" style={{ width: `${paidValue / Math.max(totalValue, 1) * 100}%` }} />
            <div className="bg-amber-400 h-4 transition-all" style={{ width: `${pendingValue / Math.max(totalValue, 1) * 100}%` }} />
            <div className="bg-red-500 h-4 transition-all" style={{ width: `${overdueValue / Math.max(totalValue, 1) * 100}%` }} />
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Paid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Overdue</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "paid", "pending", "overdue", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "bg-amber-600 text-white shadow-md" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs opacity-70">({f === "all" ? invoices.length : invoices.filter((i: any) => i.status === f).length})</span>
          </button>
        ))}
      </div>

      {/* Invoice table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Invoice</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Due Date</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filtered.map((inv: any, i: number) => {
              const cfg = statusConfig[inv.status] || { bg: "bg-slate-100", text: "text-slate-600", label: inv.status };
              const isOverdue = inv.status === "overdue";
              return (
                <tr key={inv.id || i}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className={`cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors ${isOverdue ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{inv.invoice_number || `INV-${inv.id?.slice(0, 8)}`}</div>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{fmtEGP(inv.total_amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                  </td>
                  <td className={`px-5 py-3 ${isOverdue ? "text-red-500 font-semibold" : "text-slate-500"}`}>{fmtDate(inv.due_date)}</td>
                  <td className="px-5 py-3 text-slate-400">{fmtDate(inv.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">No invoices found for this filter</div>
        )}
      </div>
    </div>
  );
}

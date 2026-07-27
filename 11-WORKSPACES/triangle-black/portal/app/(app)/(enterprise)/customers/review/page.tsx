"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

export default function CustomersReview() {
  const router = useRouter();
  const { data: contractRaw } = useQuery(["cr-contracts"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["cr-invoices"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: woRaw } = useQuery(["cr-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srRaw } = useQuery(["cr-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));

  const contracts = toArr(contractRaw);
  const invoices = toArr(invoiceRaw);
  const wos = toArr(woRaw);
  const srs = toArr(srRaw);
  const now = new Date();

  const activeContracts = contracts.filter((c: any) => c.status === "active");
  const expiring = activeContracts.filter((c: any) => c.end_date && new Date(c.end_date) <= new Date(now.getTime() + 30 * 86400000));
  const pendingInvoices = invoices.filter((i: any) => i.status === "pending");
  const overdueInvoices = invoices.filter((i: any) => i.status === "overdue");
  const linkedSRs = srs.filter((s: any) => s.work_order_id);
  const completedWOs = wos.filter((w: any) => w.status === "completed");

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Customer Review</div>
        <h1 className="text-page-title text-primary">Customer Review Board</h1>
        <p className="text-secondary mt-1">Account health, billing status, and service delivery review</p>
      </div>

      {/* Health indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Accounts", value: activeContracts.length, status: "good", icon: "✅" },
          { label: "Expiring Contracts", value: expiring.length, status: expiring.length > 0 ? "warn" : "good", icon: "⏰" },
          { label: "Pending Invoices", value: pendingInvoices.length, status: pendingInvoices.length > 5 ? "warn" : "good", icon: "📄" },
          { label: "Overdue Invoices", value: overdueInvoices.length, status: overdueInvoices.length > 0 ? "bad" : "good", icon: "🔴" },
        ].map((k, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${k.status === "bad" ? "bg-red-50 border-red-200" : k.status === "warn" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-xs text-secondary mb-1">{k.label}</div>
            <div className={`text-3xl font-black ${k.status === "bad" ? "text-red-500" : k.status === "warn" ? "text-amber-500" : "text-emerald-500"}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expiring contracts requiring action */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Contracts Requiring Renewal</h2>
            <button onClick={() => router.push("/customers/renewals")} className="text-xs text-amber-500 hover:underline">Renewals →</button>
          </div>
          {expiring.length === 0 ? (
            <div className="text-center py-8 text-tertiary text-sm">✅ No urgent renewals</div>
          ) : expiring.map((c: any, i: number) => {
            const daysLeft = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
            return (
              <button key={i} onClick={() => router.push(`/commercial/contracts/${c.id}`)}
                className="w-full flex items-center justify-between p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 text-left">
                <div>
                  <div className="text-sm font-semibold truncate">{c.title || c.id?.slice(0, 16)}</div>
                  <div className="text-xs text-amber-600">Expires {fmtDate(c.end_date)}</div>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded ${daysLeft <= 7 ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>{daysLeft}d</span>
              </button>
            );
          })}
        </div>

        {/* Billing status */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Billing Review</h2>
            <button onClick={() => router.push("/invoices")} className="text-xs text-amber-500 hover:underline">All invoices →</button>
          </div>
          <div className="space-y-3">
            {[
              { label: "Paid", count: invoices.filter((i: any) => i.status === "paid").length, value: invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0), color: "emerald" },
              { label: "Pending", count: pendingInvoices.length, value: pendingInvoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0), color: "amber" },
              { label: "Overdue", count: overdueInvoices.length, value: overdueInvoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0), color: "red" },
              { label: "Cancelled", count: invoices.filter((i: any) => i.status === "cancelled").length, value: 0, color: "slate" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-base-alt dark:bg-surface-alt rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${s.color}-500`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-tertiary">{s.label}</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black text-${s.color}-500`}>{s.count}</div>
                  {s.value > 0 && <div className="text-xs text-tertiary">{fmtEGP(s.value)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service delivery */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold text-primary mb-4">Service Delivery Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "WOs Completed", value: completedWOs.length, color: "emerald" },
            { label: "SRs Resolved", value: linkedSRs.length, color: "blue" },
            { label: "WOs In Progress", value: wos.filter((w: any) => w.status === "in_progress").length, color: "amber" },
            { label: "SRs Open", value: srs.filter((s: any) => s.status === "open" || s.status === "new").length, color: "red" },
          ].map((k, i) => (
            <div key={i} className="bg-base-alt dark:bg-surface-alt rounded-xl p-4">
              <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
              <div className="text-xs text-secondary mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

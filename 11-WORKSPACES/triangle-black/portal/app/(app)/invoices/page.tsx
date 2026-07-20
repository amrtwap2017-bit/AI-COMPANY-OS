// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageHeader, PageWrapper, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { invoicesApi } from "@/lib/api";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";
import { ChevronRight, Receipt, RefreshCw, CheckCircle, Clock, Send, XCircle } from "lucide-react";

const STATUS: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-slate-100 text-slate-500" },
  sent:      { label: "Sent",      cls: "bg-blue-50 text-blue-700" },
  paid:      { label: "Paid",      cls: "bg-emerald-50 text-emerald-700" },
  overdue:   { label: "Overdue",   cls: "bg-red-50 text-red-700" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-400" },
};

const FILTERS = ["all", "draft", "sent", "paid", "overdue"];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const { data: invoices = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["invoices", statusFilter],
    queryFn: () => invoicesApi.list(statusFilter === "all" ? undefined : statusFilter)
      .then((r: any) => Array.isArray(r) ? r : r?.data || r?.items || []),
    staleTime: 30_000,
  });

  const paid    = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);
  const pending = invoices.filter((i: any) => i.status === "sent").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);
  const draft   = invoices.filter((i: any) => i.status === "draft").reduce((s: number, i: any) => s + (i.total_amount || 0), 0);

  return (
    <PageWrapper>
      <PageHeader
        title="Invoices"
        subtitle="Auto-generated when contracts are activated"
        badge="INV"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Paid",          value: paid,    cls: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Sent / Pending",value: pending, cls: "text-blue-700",    bg: "bg-blue-50 border-blue-100"      },
          { label: "Draft",         value: draft,   cls: "text-slate-700",   bg: "bg-slate-50 border-slate-200"    },
        ].map(card => (
          <div key={card.label} className={"rounded-2xl border p-5 " + card.bg}>
            <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
            <p className={"text-2xl font-bold " + card.cls}>{fmtCurrency(card.value)}</p>
          </div>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={"px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all " + (statusFilter === f ? "bg-amber-600 text-white" : "text-slate-500 hover:bg-slate-100")}>
            {f === "all" ? "All Invoices" : f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState type="table" rows={5} />
      ) : invoices.length === 0 ? (
        <EmptyState icon="🧾" title="No invoices" description="Invoices are created when contracts are activated" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Invoice #", "Title", "Amount", "VAT", "Total", "Status", "Due Date", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => {
                const isOverdue = inv.status === "sent" && inv.due_date && new Date(inv.due_date) < new Date();
                const st = isOverdue ? { label: "Overdue", cls: "bg-red-50 text-red-700" } : STATUS[inv.status] || STATUS.draft;
                return (
                  <tr key={inv.id} onClick={() => router.push("/invoices/" + inv.id)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-amber-700 font-semibold">{inv.invoice_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">{inv.title}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtCurrency(inv.amount || 0)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtCurrency(inv.tax_amount || 0)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{fmtCurrency(inv.total_amount || 0)}</td>
                    <td className="px-4 py-3">
                      <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold " + st.cls}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{inv.due_date ? fmtDate(inv.due_date) : "—"}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-300" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}

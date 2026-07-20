// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { invoicesApi } from "@/lib/api";
import { formatEGP, formatDate } from "@/lib/utils";
import { Receipt, ChevronRight, CheckCircle, Clock, Send, XCircle } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string;
  lead_id: string;
  title: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  renewal_number: number;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:     { label: "Draft",     color: "text-gray-600",   bg: "bg-gray-100",   icon: <Clock className="w-4 h-4" />       },
  sent:      { label: "Sent",      color: "text-blue-700",   bg: "bg-blue-100",   icon: <Send className="w-4 h-4" />        },
  paid:      { label: "Paid",      color: "text-green-700",  bg: "bg-green-100",  icon: <CheckCircle className="w-4 h-4" /> },
  overdue:   { label: "Overdue",   color: "text-red-700",    bg: "bg-red-100",    icon: <XCircle className="w-4 h-4" />    },
  cancelled: { label: "Cancelled", color: "text-gray-500",   bg: "bg-gray-100",   icon: <XCircle className="w-4 h-4" />    },
};

const FILTERS = ["all", "draft", "sent", "paid", "overdue"];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", statusFilter],
    queryFn: () =>
      invoicesApi
        .list(statusFilter === "all" ? undefined : statusFilter)
        .then((r) => r as Invoice[]),
    refetchInterval: 30_000,
  });

  const totalPaid     = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
  const totalPending  = invoices.filter((i) => i.status === "sent").reduce((s, i) => s + i.total_amount, 0);
  const totalDraft    = invoices.filter((i) => i.status === "draft").reduce((s, i) => s + i.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-[#1B2B4B]" aria-hidden="true" />
          Invoices
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Auto-generated when contracts are activated
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Paid", value: totalPaid,    color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
          { label: "Sent / Pending", value: totalPending, color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-200"  },
          { label: "Draft",  value: totalDraft,   color: "text-gray-700",   bg: "bg-gray-50",   border: "border-gray-200"  },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border ${card.border} ${card.bg} p-5`}>
            <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{formatEGP(card.value)}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors
              ${statusFilter === f
                ? "bg-[#1B2B4B] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#1B2B4B]"
              }`}
          >
            {f === "all" ? "All Invoices" : f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12" role="status">
          <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading invoices...</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && invoices.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No invoices yet</h3>
          <p className="text-gray-500 text-sm">
            Invoices are auto-created when a contract is activated.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && invoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Invoices table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Invoice #", "Title", "Amount (excl. tax)", "VAT 14%", "Total", "Status", "Due Date", ""].map((h) => (
                  <th key={h} scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft;
                const isOverdue =
                  inv.status === "sent" &&
                  inv.due_date &&
                  new Date(inv.due_date) < new Date();
                return (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer
                      ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                  >
                    <td className="px-5 py-4 font-mono text-xs font-medium text-[#1B2B4B]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate">
                      {inv.title}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{formatEGP(inv.amount)}</td>
                    <td className="px-5 py-4 text-gray-500">{formatEGP(inv.tax_amount)}</td>
                    <td className="px-5 py-4 font-bold text-[#1B2B4B]">{formatEGP(inv.total_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
                        px-2.5 py-1 rounded-full ${isOverdue ? "text-red-700 bg-red-100" : `${cfg.color} ${cfg.bg}`}`}>
                        {isOverdue ? <XCircle className="w-3.5 h-3.5" /> : cfg.icon}
                        {isOverdue ? "Overdue" : cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

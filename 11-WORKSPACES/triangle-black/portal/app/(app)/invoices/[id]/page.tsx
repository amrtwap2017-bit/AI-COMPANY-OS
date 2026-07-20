// @ts-nocheck
"use client";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {invoicesApi, extendedInvoicesApi} from "@/lib/api";
import { formatEGP, formatDate } from "@/lib/utils";
import {
  ArrowLeft, Receipt, CheckCircle, Send,
  Clock, XCircle, Calendar, DollarSign,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string;
  lead_id: string;
  title: string;
  description?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  renewal_number: number;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:     { label: "Draft",     color: "text-gray-600",  bg: "bg-gray-100",  icon: <Clock className="w-5 h-5" />       },
  sent:      { label: "Sent",      color: "text-blue-700",  bg: "bg-blue-100",  icon: <Send className="w-5 h-5" />        },
  paid:      { label: "Paid",      color: "text-green-700", bg: "bg-green-100", icon: <CheckCircle className="w-5 h-5" /> },
  overdue:   { label: "Overdue",   color: "text-red-700",   bg: "bg-red-100",   icon: <XCircle className="w-5 h-5" />    },
  cancelled: { label: "Cancelled", color: "text-gray-500",  bg: "bg-gray-100",  icon: <XCircle className="w-5 h-5" />    },
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesApi.get(id).then((r) => r as Invoice),
  });

  async function doSend() {
    setLoading("send"); setError(null);
    try {
      await extendedInvoicesApi.send(id);
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch { setError("Failed to send invoice."); }
    finally { setLoading(null); }
  }

  async function doMarkPaid() {
    setLoading("paid"); setError(null);
    try {
      await extendedInvoicesApi.markPaid(id);
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch { setError("Failed to mark invoice as paid."); }
    finally { setLoading(null); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Loading invoice...</span>
    </div>
  );

  if (!invoice) return <div role="alert" className="text-red-600 p-6">Invoice not found.</div>;

  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.draft;
  const isOverdue = invoice.status === "sent" && invoice.due_date && new Date(invoice.due_date) < new Date();
  const displayCfg = isOverdue ? STATUS_CONFIG.overdue : cfg;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${displayCfg.bg} flex items-center justify-center flex-shrink-0 ${displayCfg.color}`}>
              {displayCfg.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-gray-900">{invoice.title}</h1>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${displayCfg.color} ${displayCfg.bg}`}>
                  {isOverdue ? "Overdue" : displayCfg.label}
                </span>
              </div>
              <p className="font-mono text-sm text-[#1B2B4B] font-medium">{invoice.invoice_number}</p>
              {invoice.description && <p className="text-gray-500 text-sm mt-1">{invoice.description}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#1B2B4B]">{formatEGP(invoice.total_amount)}</p>
            <p className="text-sm text-gray-500 mt-1">Total inc. VAT</p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
          {[
            { icon: <DollarSign className="w-4 h-4 text-gray-400" />, label: "Subtotal",   value: formatEGP(invoice.amount)     },
            { icon: <DollarSign className="w-4 h-4 text-gray-400" />, label: "VAT (14%)",  value: formatEGP(invoice.tax_amount)  },
            { icon: <Calendar  className="w-4 h-4 text-gray-400" />, label: "Issue Date",  value: formatDate(invoice.issue_date) },
            { icon: <Calendar  className="w-4 h-4 text-gray-400" />, label: "Due Date",    value: invoice.due_date ? formatDate(invoice.due_date) : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">{item.icon}<span className="text-xs text-gray-500">{item.label}</span></div>
              <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        {invoice.paid_date && (
          <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 text-sm font-medium">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Paid on {formatDate(invoice.paid_date)}
          </div>
        )}
      </div>

      {/* Actions */}
      {invoice.status !== "paid" && invoice.status !== "cancelled" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
          {error && <p role="alert" className="text-sm text-red-500 mb-3">{error}</p>}
          <div className="flex flex-wrap gap-3">
            {invoice.status === "draft" && (
              <button onClick={doSend} disabled={loading === "send"}
                aria-busy={loading === "send"}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <Send className="w-4 h-4" aria-hidden="true" />
                {loading === "send" ? "Sending..." : "Send Invoice"}
              </button>
            )}
            {invoice.status === "sent" && (
              <button onClick={doMarkPaid} disabled={loading === "paid"}
                aria-busy={loading === "paid"}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                {loading === "paid" ? "Processing..." : "Mark as Paid"}
              </button>
            )}
            <button onClick={() => router.push(`/contracts/${invoice.contract_id}`)}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1B2B4B] text-[#1B2B4B] text-sm font-semibold rounded-xl hover:bg-[#1B2B4B] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]">
              View Contract
            </button>
          </div>
        </div>
      )}

      {/* Paid state */}
      {invoice.status === "paid" && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-green-800">Invoice Paid</p>
              <p className="text-sm text-green-700">
                Payment received on {invoice.paid_date ? formatDate(invoice.paid_date) : "—"}.
                Total collected: {formatEGP(invoice.total_amount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="font-semibold text-amber-800 mb-2">Notes</h3>
          <p className="text-sm text-amber-700">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}

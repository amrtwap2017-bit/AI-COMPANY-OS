"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { invoicesApi } from "@/lib/api";

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  description: string | null;
  status: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  contract_id: string;
  renewal_number: number;
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  draft:   { label: "Draft",   color: "text-gray-600",  bg: "bg-gray-100"  },
  sent:    { label: "Sent",    color: "text-blue-700",  bg: "bg-blue-100"  },
  paid:    { label: "Paid",    color: "text-green-700", bg: "bg-green-100" },
  overdue: { label: "Overdue", color: "text-red-700",   bg: "bg-red-100"   },
};

const EGP = (n: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }) : "—";

export default function ClientInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!id) return;
    invoicesApi.get(id)
      .then(setInvoice)
      .catch(() => setError("Invoice not found or access denied."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error || !invoice)
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-sm mb-4">{error || "Invoice not found."}</p>
        <Link href="/invoices" className="text-sm text-[#1B2B4B] hover:underline">
          ← Back to Invoices
        </Link>
      </div>
    );

  const status = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.draft;
  const vat_pct = invoice.amount > 0
    ? ((invoice.tax_amount / invoice.amount) * 100).toFixed(0)
    : "14";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/invoices"
        className="text-sm text-gray-500 hover:text-[#1B2B4B] transition-colors flex items-center gap-1"
      >
        ← Back to Invoices
      </Link>

      {/* Invoice card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B2B4B] px-8 py-6 flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Invoice</p>
            <p className="text-white font-mono text-lg font-bold">
              {invoice.invoice_number}
            </p>
            {invoice.renewal_number > 0 && (
              <p className="text-white/50 text-xs mt-1">
                Renewal #{invoice.renewal_number}
              </p>
            )}
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize
            ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Title */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-gray-800 font-medium">{invoice.title}</p>
            {invoice.description && (
              <p className="text-sm text-gray-500 mt-1">{invoice.description}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Issue Date",   value: fmtDate(invoice.issue_date) },
              { label: "Due Date",     value: fmtDate(invoice.due_date)   },
              { label: "Paid Date",    value: fmtDate(invoice.paid_date)  },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Financial breakdown */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Financial Summary
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex justify-between px-6 py-4">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-800">
                  {EGP(invoice.amount)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-4">
                <span className="text-sm text-gray-600">VAT ({vat_pct}%)</span>
                <span className="text-sm font-medium text-gray-800">
                  {EGP(invoice.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-5 bg-[#1B2B4B]/5">
                <span className="font-bold text-[#1B2B4B]">Total Due</span>
                <span className="font-bold text-xl text-[#1B2B4B]">
                  {EGP(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Status banner */}
          {invoice.status === "paid" && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 text-center">
              <p className="text-green-700 font-semibold">✓ Payment Received</p>
              <p className="text-green-600 text-sm mt-1">
                Paid on {fmtDate(invoice.paid_date)}
              </p>
            </div>
          )}
          {invoice.status === "sent" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 text-center">
              <p className="text-blue-700 font-semibold">Payment Pending</p>
              <p className="text-blue-600 text-sm mt-1">
                Due by {fmtDate(invoice.due_date)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { invoicesApi } from "@/lib/api";

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  status: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  contract_id: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft:   "bg-gray-100 text-gray-600",
  sent:    "bg-blue-100 text-blue-700",
  paid:    "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

const EGP = (n: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB") : "—";

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    invoicesApi.list()
      .then(setInvoices)
      .catch(() => setError("Failed to load invoices. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-600 text-sm">{error}</div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your billing history and payment status
        </p>
      </div>

      {/* Summary cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Invoiced",
              value: EGP(invoices.reduce((s, i) => s + i.total_amount, 0)),
              color: "text-[#1B2B4B]",
              bg:    "bg-slate-50",
            },
            {
              label: "Paid",
              value: EGP(invoices.filter(i => i.status === "paid")
                         .reduce((s, i) => s + i.total_amount, 0)),
              color: "text-green-600",
              bg:    "bg-green-50",
            },
            {
              label: "Outstanding",
              value: EGP(invoices.filter(i => i.status === "sent")
                         .reduce((s, i) => s + i.total_amount, 0)),
              color: "text-blue-600",
              bg:    "bg-blue-50",
            },
            {
              label: "Invoices",
              value: String(invoices.length),
              color: "text-amber-600",
              bg:    "bg-amber-50",
            },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No invoices yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-slate-50">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-medium">Invoice #</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-right">VAT</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4 text-gray-800 max-w-[200px] truncate">
                    {inv.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${STATUS_STYLES[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {EGP(inv.amount)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs">
                    {EGP(inv.tax_amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[#1B2B4B]">
                    {EGP(inv.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {fmtDate(inv.due_date)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-xs font-medium text-[#1B2B4B] hover:text-amber-500 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

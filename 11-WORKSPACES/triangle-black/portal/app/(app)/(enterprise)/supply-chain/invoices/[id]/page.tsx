// @ts-nocheck
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { CreditCard, FileText, CheckCircle, Clock, AlertCircle, DollarSign, Loader2 } from "lucide-react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


const STATUS_STYLES: Record<string, string> = {
  paid:           "bg-emerald-100 text-emerald-700",
  partially_paid: "bg-blue-100 text-blue-700",
  unpaid:         "bg-amber-100 text-amber-700",
  overdue:        "bg-red-100 text-red-700",
  cancelled:      "bg-slate-100 text-slate-500",
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [payRef, setPayRef] = useState("");
  const [payResult, setPayResult] = useState<any>(null);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => authFetch(`/api/v1/invoices/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: paymentsData = {} } = useQuery({
    queryKey: ["invoice-payments", id],
    queryFn: () => authFetch(`/api/v1/invoices/${id}/payments`).then(r => r.json()),
    enabled: !!id,
  });

  const recordPayment = useMutation({
    mutationFn: () => authFetch(`/api/v1/invoices/${id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        reference_no: payRef,
        currency: "EGP",
      }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setPayResult(data);
      setPayAmount("");
      setPayRef("");
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoice-payments", id] });
    },
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading invoice..." /></PageWrapper>;
  if (!invoice || invoice.detail) return <PageWrapper><p className="p-8 text-slate-400">Invoice not found</p></PageWrapper>;

  const total     = Number(invoice.total_amount || 0);
  const paid      = Number(paymentsData?.total_paid || 0);
  const outstanding = Number(paymentsData?.outstanding || 0);
  const payments  = paymentsData?.payments ?? [];
  const paidPct   = total > 0 ? Math.min(100, Math.round(paid / total * 100)) : 0;

  return (
    <PageWrapper>
      <PageHeader
        title={invoice.invoice_number ?? `Invoice ${String(invoice.id).slice(0,8)}`}
        subtitle={String(invoice.created_at ?? "").slice(0,10)}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[invoice.status] ?? ""}`}>
            {invoice.status}
          </span>
        }
      />

      {payResult && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="font-semibold text-emerald-800">✅ {payResult.message}</div>
          <div className="text-sm text-emerald-600 mt-1">
            Outstanding: {Number(payResult.outstanding || 0).toLocaleString()} EGP
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Invoice details + payment input */}
        <div className="space-y-6">
          <SectionCard title="Invoice Summary">
            {/* Value display */}
            <div className="text-center p-4 bg-slate-50 rounded-xl mb-4">
              <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-800">{total.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Total Amount (EGP)</div>
            </div>

            {/* Payment progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Payment Progress</span>
                <span className="font-semibold">{paidPct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${paidPct >= 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Paid: {paid.toLocaleString()} EGP</span>
                <span>Outstanding: {outstanding.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {[
                ["Status",    invoice.status],
                ["Hotel",     invoice.hotel_id],
                ["Due Date",  String(invoice.due_date ?? "—").slice(0,10)],
                ["Created",   String(invoice.created_at ?? "").slice(0,10)],
                ["Currency",  "EGP"],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Record Payment */}
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <SectionCard title="Record Payment">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Amount (EGP)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder={`Max: ${outstanding.toLocaleString()}`}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Reference No.</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    placeholder="Transaction reference"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => recordPayment.mutate()}
                  disabled={!payAmount || parseFloat(payAmount) <= 0 || recordPayment.isPending}
                  className="w-full h-10 bg-blue-600 text-white text-sm font-medium rounded-lg
                             hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {recordPayment.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CreditCard className="w-4 h-4" />}
                  Record Payment
                </button>
              </div>
            </SectionCard>
          )}

          {/* PDF Export */}
          <SectionCard title="Export">
            <a
              href={`http://localhost:8030/api/v1/pdf-export/invoice/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200
                         rounded-lg text-sm hover:bg-slate-50 text-slate-700"
            >
              <FileText className="w-4 h-4" /> Download Invoice (HTML)
            </a>
          </SectionCard>
        </div>

        {/* Right: Payment history */}
        <div className="lg:col-span-2">
          <SectionCard title={`Payment History (${payments.length})`}>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {toArr(payments).map((p: any) => (
                  <div key={p.id}
                       className="flex items-center justify-between p-4
                                  bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {Number(p.amount || 0).toLocaleString()} EGP
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {p.payment_method?.replace(/_/g, " ")}
                          {p.reference_no && ` · Ref: ${p.reference_no}`}
                        </div>
                        <div className="text-xs text-slate-400">
                          {String(p.payment_date ?? p.created_at ?? "").slice(0, 16)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">EGP</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No payments recorded yet</p>
                {outstanding > 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    Outstanding: {outstanding.toLocaleString()} EGP
                  </p>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}

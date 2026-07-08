"use client";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clientQuotesApi } from "@/lib/api";
import { formatEGP, formatDate, QUOTE_STATUS, QuoteStatus } from "@/lib/utils";
import { ArrowLeft, CheckCircle, XCircle, Download, AlertCircle } from "lucide-react";

interface Quote {
  id: string; lead_id?: string; title: string; description?: string;
  items: { service: string; qty: number; unit_price: number; total: number }[];
  total: number; status: string; validity_date?: string;
  created_at: string; updated_at: string;
}

export default function ClientQuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["client-quote", id],
    queryFn: () => clientQuotesApi.get(id).then((r) => r.data as Quote),
  });

  async function doApprove() {
    setLoading("approve");
    try {
      await clientQuotesApi.approve(id);
      qc.invalidateQueries({ queryKey: ["client-quote", id] });
      qc.invalidateQueries({ queryKey: ["client-quotes"] });
      setActionDone("approved");
    } catch { alert("Failed to approve. Please try again."); }
    finally { setLoading(null); }
  }

  async function doReject() {
    if (!rejectNote.trim()) { alert("Please provide a reason for rejection."); return; }
    setLoading("reject");
    try {
      await clientQuotesApi.reject(id, rejectNote);
      qc.invalidateQueries({ queryKey: ["client-quote", id] });
      qc.invalidateQueries({ queryKey: ["client-quotes"] });
      setActionDone("rejected");
      setShowReject(false);
    } catch { alert("Failed to reject. Please try again."); }
    finally { setLoading(null); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Loading proposal...</span>
    </div>
  );

  if (!quote) return <div role="alert" className="text-red-600">Proposal not found.</div>;

  const cfg = QUOTE_STATUS[quote.status as QuoteStatus];
  const canAct = quote.status === "sent" && !actionDone;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
        aria-label="Go back to proposals list"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Proposals
      </button>

      {/* Success Banner */}
      {actionDone && (
        <div
          role="alert" aria-live="assertive"
          className={`flex items-center gap-3 p-4 rounded-xl border font-medium
            ${actionDone === "approved"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
        >
          {actionDone === "approved"
            ? <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
            : <XCircle className="w-5 h-5 text-gray-500" aria-hidden="true" />
          }
          {actionDone === "approved"
            ? "Proposal approved! Triangle Black will be in touch shortly."
            : "Proposal rejected. Triangle Black has been notified."}
        </div>
      )}

      {/* Action Required Banner */}
      {canAct && (
        <div
          role="alert"
          className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700">
              Please review this proposal and approve or reject it below.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
            </div>
            {quote.description && (
              <p className="text-gray-600 mt-1">{quote.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#1B2B4B]">{formatEGP(quote.total)}</p>
            <p className="text-sm text-gray-500 mt-1">Total contract value</p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium">{formatDate(quote.created_at)}</p>
          </div>
          {quote.validity_date && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Valid Until</p>
              <p className="text-sm font-medium">{formatDate(quote.validity_date)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-1">Services</p>
            <p className="text-sm font-medium">{quote.items.length} items</p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Service Breakdown</h2>
          <p className="text-sm text-gray-500 mt-0.5">Detailed pricing for each service</p>
        </div>
        <table className="w-full text-sm" aria-label="Service breakdown table">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th scope="col" className="px-8 py-4 text-left">Service</th>
              <th scope="col" className="px-8 py-4 text-right">Duration</th>
              <th scope="col" className="px-8 py-4 text-right">Monthly Rate</th>
              <th scope="col" className="px-8 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-8 py-4 font-medium text-gray-900">{item.service}</td>
                <td className="px-8 py-4 text-right text-gray-600">{item.qty} months</td>
                <td className="px-8 py-4 text-right text-gray-600">{formatEGP(item.unit_price)}/mo</td>
                <td className="px-8 py-4 text-right font-semibold text-gray-900">{formatEGP(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-[#1B2B4B]">
              <td colSpan={3} className="px-8 py-5 font-bold text-white text-right text-base">
                Annual Contract Total
              </td>
              <td className="px-8 py-5 font-bold text-[#F59E0B] text-right text-xl">
                {formatEGP(quote.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Client Actions */}
      {canAct && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-2">Your Decision</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please review the proposal above and let us know your decision.
          </p>

          {!showReject ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={doApprove}
                disabled={loading === "approve"}
                aria-busy={loading === "approve"}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              >
                <CheckCircle className="w-5 h-5" aria-hidden="true" />
                {loading === "approve" ? "Processing..." : "Approve Proposal"}
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-white text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
                Request Changes / Reject
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="reject-note" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="reject-note"
                  rows={4}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Please explain why you are rejecting this proposal or what changes you'd like..."
                  required
                  aria-required="true"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={doReject}
                  disabled={loading === "reject"}
                  aria-busy={loading === "reject"}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  {loading === "reject" ? "Submitting..." : "Submit Rejection"}
                </button>
                <button
                  onClick={() => setShowReject(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Already decided */}
      {!canAct && !actionDone && quote.status !== "draft" && quote.status !== "review" && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600 font-medium">
            {quote.status === "approved"
              ? "✅ You approved this proposal. Triangle Black will contact you to proceed."
              : quote.status === "rejected"
                ? "This proposal was rejected. Contact us to discuss alternatives."
                : "This proposal is currently under review by Triangle Black."
            }
          </p>
        </div>
      )}

      {/* Contact */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Questions about this proposal?{" "}
          <a
            href="mailto:amr@triangleblack.com"
            className="text-[#1B2B4B] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
          >
            Contact Triangle Black
          </a>
        </p>
      </div>
    </div>
  );
}

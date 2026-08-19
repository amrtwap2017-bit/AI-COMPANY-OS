"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { quotesApi } from "@/lib/api/quotes";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    async function load() {
      const r = await tbFetch(`/api/v1/quotes/${id}`);
      if (r.error) setError(r.error);
      else setQuote(r.data);
      setLoading(false);
    }
    load();
  }, [mounted, id]);

  async function doAction(fn: (id: string) => Promise<any>, label: string) {
    setLoading(true);
    setActionMsg(null);
    const r = await fn(id!);
    if (r?.error) setActionMsg(`Failed: ${r.error}`);
    else setActionMsg(`${label} successful`);
    const updated = await tbFetch(`/api/v1/quotes/${id}`);
    if (updated.data) setQuote(updated.data);
    setLoading(false);
  }

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="p-8"><div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-700">{error}</p>
      <button onClick={() => router.push("/quotes")} className="mt-2 text-sm text-blue-600 underline">Back</button>
    </div></div>
  );

  if (!quote) return null;

  return (
    <div className="p-6 max-w-4xl">
      <button onClick={() => router.push("/quotes")} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Quotes
      </button>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">{quote.title || `Quote ${id?.slice(0,8)}`}</h1>
          <p className="text-gray-500 text-sm mt-1">{quote.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${(STATUS_COLORS as Record<string, any>)[quote.status] || "bg-gray-100 text-gray-700"}`}>
          {quote.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase">Total</p>
          <p className="text-2xl font-bold text-[var(--color-text-1)] mt-1">{(quote.total || 0).toLocaleString()} EGP</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase">Valid Until</p>
          <p className="text-lg font-medium text-[var(--color-text-1)] mt-1">
            {quote.validity_date ? new Date(quote.validity_date).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase">Items</p>
          <p className="text-2xl font-bold text-[var(--color-text-1)] mt-1">{(quote.items || []).length}</p>
        </div>
      </div>

      {(quote.items || []).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">Service</th>
                <th className="text-left px-4 py-2 text-gray-600">Qty</th>
                <th className="text-left px-4 py-2 text-gray-600">Unit Price</th>
                <th className="text-left px-4 py-2 text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quote.items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-[var(--color-text-1)]">{item.service}</td>
                  <td className="px-4 py-2 text-gray-600">{item.qty} {item.unit}</td>
                  <td className="px-4 py-2 text-gray-600">{(item.unit_price || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-[var(--color-text-1)]">{(item.total || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${actionMsg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {actionMsg}
        </div>
      )}

      <div className="flex gap-3">
        {quote.status === "draft" && (
          <button onClick={() => doAction(quotesApi.send, "Send")} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Send to Client
          </button>
        )}
        {quote.status === "sent" && (
          <>
            <button onClick={() => doAction(quotesApi.approve, "Approve")} disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              Approve
            </button>
            <button onClick={() => doAction(quotesApi.reject, "Reject")} disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

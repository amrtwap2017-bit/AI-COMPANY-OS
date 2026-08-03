"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { quotesApi } from "@/lib/api/quotes";

interface Quote {
  id: string;
  lead_id: string;
  title: string;
  total: number;
  status: string;
  validity_date: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  review: "bg-yellow-100 text-yellow-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    async function load() {
      const r = await tbFetch<Quote[]>("/api/v1/quotes/?limit=100");
      if (r.error) {
        setError(r.error);
      } else {
        setQuotes(Array.isArray(r.data) ? r.data : []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = statusFilter === "all"
    ? quotes
    : quotes.filter((q) => q.status === statusFilter);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-3 text-gray-600">Loading quotes...</span>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Failed to load quotes</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm underline text-red-700">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">{quotes.length} total</p>
        </div>
        <button
          onClick={() => router.push("/quotes/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Quote
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["all", "draft", "review", "sent", "approved", "rejected", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No quotes found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total (EGP)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Valid Until</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => router.push(`/quotes/${q.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {q.title || `Quote ${q.id.slice(0, 8)}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[q.status] || "bg-gray-100 text-gray-700"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {q.total ? q.total.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {q.validity_date ? new Date(q.validity_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(q.created_at).toLocaleDateString()}
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

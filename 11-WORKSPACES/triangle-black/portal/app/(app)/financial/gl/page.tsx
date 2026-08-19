"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

export default function GLPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    Promise.all([
      tbFetch("/api/v1/financial/gl/?limit=50"),
      tbFetch("/api/v1/financial/gl/summary"),
    ]).then(([e, s]: any[]) => {
      setEntries(Array.isArray(e.data) ? e.data : []);
      setSummary(s.data);
      setLoading(false);
    });
  }, [mounted]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">General Ledger</h1>
        <button onClick={() => router.push("/financial/gl/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New Entry
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase">Total Entries</p>
            <p className="text-2xl font-bold text-[var(--color-text-1)] mt-1">{summary.total_entries}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase">Total Debit</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{(summary.total_debit || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase">Total Credit</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{(summary.total_credit || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase">Balance</p>
            <p className={`text-2xl font-bold mt-1 ${(summary.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {(summary.balance || 0).toLocaleString()} EGP
            </p>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No journal entries yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entry #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Debit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Credit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{e.entry_number}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(e.entry_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[var(--color-text-1)]">{e.description || "—"}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{(e.total_debit || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{(e.total_credit || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">{e.status}</span>
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

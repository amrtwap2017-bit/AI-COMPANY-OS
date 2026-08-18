"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_signature: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/contracts/${id}`).then((r) => {
      if (r.error) setError(r.error);
      else setContract(r.data);
      setLoading(false);
    });
  }, [mounted, id]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !contract) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error || "Contract not found"}</p>
        <button onClick={() => router.push("/contracts")} className="mt-2 text-sm text-blue-600 underline">
          Back to Contracts
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      <button onClick={() => router.push("/contracts")} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Contracts
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">{contract.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{contract.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[contract.status] || "bg-gray-100 text-gray-700"}`}>
          {contract.status?.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase">Total Value</p>
          <p className="text-2xl font-bold text-[var(--color-text-1)] mt-1">
            {(contract.total_value || 0).toLocaleString()} EGP
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase">Start Date</p>
          <p className="text-lg font-medium text-[var(--color-text-1)] mt-1">
            {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase">End Date</p>
          <p className="text-lg font-medium text-[var(--color-text-1)] mt-1">
            {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {(contract.services || []).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide px-4 py-3 border-b bg-gray-50">
            Services
          </h2>
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
              {contract.services.map((s: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-[var(--color-text-1)]">{s.service}</td>
                  <td className="px-4 py-2 text-gray-600">{s.qty} {s.unit}</td>
                  <td className="px-4 py-2 text-gray-600">{(s.unit_price || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-[var(--color-text-1)]">{(s.total || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Created: </span><span>{new Date(contract.created_at).toLocaleDateString()}</span></div>
          <div><span className="text-gray-400">Lead ID: </span><span className="font-mono text-xs">{contract.lead_id || "—"}</span></div>
          <div><span className="text-gray-400">Quote ID: </span><span className="font-mono text-xs">{contract.quote_id || "—"}</span></div>
        </div>
      </div>
    </div>
  );
}

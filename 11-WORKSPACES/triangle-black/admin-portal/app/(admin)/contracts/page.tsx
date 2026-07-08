"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { contractsApi } from "@/lib/api";
import { CONTRACT_STATUS, formatEGP, formatDate } from "@/lib/utils";
import { FileCheck, Play, RefreshCw } from "lucide-react";

interface Contract {
  id: string; title: string; status: string;
  total_value: number; monthly_value: number;
  duration_months: number; renewal_count: number;
  start_date?: string; end_date?: string;
  created_at: string;
}

export default function AdminContractsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["admin-contracts", filter],
    queryFn: () => contractsApi.list(filter || undefined).then((r) => r.data as Contract[]),
    refetchInterval: 15000,
  });

  const totalValue = contracts.reduce((s, c) => s + c.total_value, 0);
  const activeValue = contracts
    .filter((c) => ["active","renewed"].includes(c.status))
    .reduce((s, c) => s + c.total_value, 0);

  async function activate(id: string) {
    setLoading(id);
    try {
      await contractsApi.activate(id);
      qc.invalidateQueries({ queryKey: ["admin-contracts"] });
    } catch { alert("Failed to activate contract."); }
    finally { setLoading(null); }
  }

  async function renew(id: string) {
    setLoading(`renew-${id}`);
    try {
      await contractsApi.renew(id, 12);
      qc.invalidateQueries({ queryKey: ["admin-contracts"] });
    } catch { alert("Failed to renew contract."); }
    finally { setLoading(null); }
  }

  const FILTERS = [
    { value: "", label: "All" },
    { value: "pending_signature", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "renewed", label: "Renewed" },
    { value: "expired", label: "Expired" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <p className="text-sm text-gray-500">
          {contracts.length} contracts · {formatEGP(activeValue)} active · {formatEGP(totalValue)} total
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: contracts.length, color: "text-gray-900" },
          { label: "Pending Signature", value: contracts.filter(c => c.status === "pending_signature").length, color: "text-amber-600" },
          { label: "Active", value: contracts.filter(c => c.status === "active").length, color: "text-green-600" },
          { label: "Renewed", value: contracts.filter(c => c.status === "renewed").length, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.value} role="tab" aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]
              ${filter === f.value ? "bg-[#7C3AED] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div role="status" className="text-center py-12 text-gray-400">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <FileCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No contracts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Contracts table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Contract","Status","Value","Monthly","Duration","Actions"].map((h) => (
                  <th key={h} scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contracts.map((c) => {
                const cfg = CONTRACT_STATUS[c.status] ||
                  { label: c.status, color: "text-gray-600", bg: "bg-gray-100" };
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{c.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1e1b4b]">{formatEGP(c.total_value)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatEGP(c.monthly_value)}</td>
                    <td className="px-4 py-3 text-gray-500">{c.duration_months}mo</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.status === "pending_signature" && (
                          <button onClick={() => activate(c.id)}
                            disabled={loading === c.id}
                            aria-label={`Activate ${c.title}`}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white
                              rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                          >
                            <Play className="w-3 h-3" />
                            {loading === c.id ? "..." : "Activate"}
                          </button>
                        )}
                        {["active","renewed"].includes(c.status) && (
                          <button onClick={() => renew(c.id)}
                            disabled={loading === `renew-${c.id}`}
                            aria-label={`Renew ${c.title}`}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white
                              rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {loading === `renew-${c.id}` ? "..." : "Renew"}
                          </button>
                        )}
                      </div>
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

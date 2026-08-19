"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { leadsApi, Lead } from "@/lib/api/leads";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  qualified: "bg-green-100 text-green-800",
  negotiation: "bg-yellow-100 text-yellow-800",
  won: "bg-purple-100 text-purple-800",
  lost: "bg-red-100 text-red-800",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    async function load() {
      const r = await leadsApi.list({ limit: 100 });
      if (r.error) {
        setError(r.error);
      } else {
        const raw = r.data;
        const arr = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.results) ? raw.results
          : Array.isArray(raw?.results) ? raw.results
          : [];
        setLeads(arr);
      }
      setLoading(false);
    }
    load();
  }, [mounted]);

  const filtered = leads.filter((l: any) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (l.name ?? "").toLowerCase().includes(q) ||
      (l.email ?? "").toLowerCase().includes(q) ||
      (l.company ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-3 text-gray-600">Loading leads...</span>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Failed to load leads</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-700 underline">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} total</p>
        </div>
        <button
          onClick={() => router.push("/leads/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Lead
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, email, company..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No leads found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || statusFilter !== "all" ? "Try adjusting your filters" : "Add your first lead"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--color-text-1)]">{lead.name}</div>
                    <div className="text-gray-400 text-xs">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lead.company || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(STATUS_COLORS as Record<string, any>)[lead.status] || "bg-gray-100 text-gray-700"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{lead.source || "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(lead.created_at).toLocaleDateString()}
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

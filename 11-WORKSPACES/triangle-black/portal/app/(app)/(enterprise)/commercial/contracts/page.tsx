"use client"; // @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { FileText, Filter, RefreshCw, AlertTriangle, CheckCircle, Search, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-100 text-emerald-700",
  expired:  "bg-red-100 text-red-700",
  renewed:  "bg-blue-100 text-blue-700",
  draft:    "bg-slate-100 text-slate-600",
  cancelled: "bg-red-200 text-red-800",
};

export default function ContractsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQ, setSearchQ]           = useState("");
  const [sortBy, setSortBy]             = useState("end_date");
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [renewResult, setRenewResult]   = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contracts-list"],
    queryFn: () => authFetch("/api/v1/contracts/?limit=200").then(r => r.json()),
    refetchInterval: 120000,
  });

  const bulkRenew = useMutation({
    mutationFn: () =>
      Promise.all(
        Array.from(selectedIds).map(id =>
          authFetch(`/api/v1/contracts/${id}/renew`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ renewal_months: 12, renewed_by: "portal_bulk" }),
          }).then(r => r.json())
        )
      ),
    onSuccess: (results) => {
      const succeeded = results.filter(r => r.success).length;
      setRenewResult({ succeeded, total: results.length });
      setSelectedIds(new Set());
      qc.invalidateQueries({ queryKey: ["contracts-list"] });
      setTimeout(() => setRenewResult(null), 4000);
    },
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading contracts..." /></PageWrapper>;

  const contracts = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = contracts;
    if (statusFilter !== "all") list = list.filter((c: any) => c.status === statusFilter);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter((c: any) =>
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.hotel_id ?? "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a: any, b: any) => {
      if (sortBy === "end_date") return (a.end_date ?? "").localeCompare(b.end_date ?? "");
      if (sortBy === "value")    return Number(b.total_value||0) - Number(a.total_value||0);
      if (sortBy === "title")    return (a.title ?? "").localeCompare(b.title ?? "");
      return 0;
    });
    return list;
  }, [contracts, statusFilter, searchQ, sortBy]);

  const now = new Date();
  const expiringSoon = contracts.filter((c: any) =>
    c.status === "active" && c.end_date &&
    new Date(c.end_date).getTime() - now.getTime() < 30 * 86400000
  ).length;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c: any) => c.id)));
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Contracts"
        subtitle={`${contracts.length} total · ${expiringSoon} expiring in 30 days`}
        badge="Program J"
      />

      {renewResult && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="font-semibold text-emerald-800">
            ✅ {renewResult.succeeded}/{renewResult.total} contracts renewed for 12 months
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["active","expired","renewed","draft"].map(status => {
          const count = contracts.filter((c: any) => c.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              className={`p-4 rounded-xl border text-center transition-all
                ${statusFilter === status ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="text-2xl font-bold text-slate-800">{count}</div>
              <div className="text-xs text-slate-500 mt-1 capitalize">{status}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search contracts..."
            className="flex-1 text-sm border-0 outline-none text-slate-700 bg-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2"
        >
          <option value="end_date">Sort: Expiry Date</option>
          <option value="value">Sort: Value (High-Low)</option>
          <option value="title">Sort: Title</option>
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={() => bulkRenew.mutate()}
            disabled={bulkRenew.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm
                       font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {bulkRenew.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
            Renew {selectedIds.size} selected (12m)
          </button>
        )}
      </div>

      {/* Contracts table */}
      <SectionCard title={`${filtered.length} Contracts`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="py-2 pr-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="text-left py-2 font-medium">Contract</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Value (EGP)</th>
                <th className="text-left py-2 font-medium">Start</th>
                <th className="text-left py-2 font-medium">Expires</th>
                <th className="text-right py-2 font-medium">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => {
                const daysLeft = c.end_date
                  ? Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
                  : null;
                const isExpiringSoon = daysLeft !== null && daysLeft < 30 && daysLeft >= 0;
                const isExpired      = daysLeft !== null && daysLeft < 0;
                return (
                  <tr key={c.id}
                      className={`border-b border-slate-50 hover:bg-slate-50
                        ${isExpiringSoon ? "bg-amber-50/30" : ""}
                        ${isExpired ? "bg-red-50/30" : ""}`}>
                    <td className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-800 truncate max-w-48">{c.title}</div>
                      <div className="text-xs text-slate-400">{c.contract_type}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium
                        ${STATUS_COLORS[c.status] ?? STATUS_COLORS.draft}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-800">
                      {Number(c.total_value||0).toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {String(c.start_date ?? "").slice(0,10)}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium
                        ${isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-600" : "text-slate-600"}`}>
                        {String(c.end_date ?? "").slice(0,10)}
                        {isExpiringSoon && " ⚠️"}
                        {isExpired && " ❌"}
                      </span>
                    </td>
                    <td className={`py-3 text-right text-xs font-semibold
                      ${isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-600" : "text-slate-500"}`}>
                      {daysLeft !== null ? (isExpired ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`) : "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No contracts match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}

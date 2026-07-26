// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

const STATUSES = ["all","complete","partial","pending","rejected"];
const S = {complete:"bg-emerald-100 text-emerald-800",partial:"bg-amber-100 text-amber-800",pending:"bg-blue-100 text-blue-700",rejected:"bg-red-100 text-red-700"};

export default function GoodsReceiptsPage() {
  const [sf, setSf] = useState("all");
  const [q,  setQ]  = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["goods-receipts-page"],
    () => authFetch("/api/v1/goods-receipts/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const receipts = toArr(raw);
  const filtered = receipts.filter(r => {
    if (sf !== "all" && r.status !== sf) return false;
    if (q && !(r.grn_number?.toLowerCase().includes(q.toLowerCase()) ||
               r.received_by?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total    = receipts.length;
  const complete = receipts.filter(r => r.status === "complete").length;
  const partial  = receipts.filter(r => r.status === "partial").length;
  const pending  = receipts.filter(r => r.status === "pending").length;

  return (
    <PageWrapper>
      <PageHeader
        title="Goods Receipts"
        subtitle={`${total} receipts · ${complete} complete · ${partial} partial`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Goods Receipts"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",    value:total,    color:"text-slate-800"},
          {label:"Complete", value:complete, color:"text-emerald-700"},
          {label:"Partial",  value:partial,  color:"text-amber-700"},
          {label:"Pending",  value:pending,  color:"text-blue-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Goods Receipts (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search GRN number or received by…" value={q}
            onChange={e => setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e => setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s}</option>)}
          </select>
          {(sf !== "all" || q) && (
            <button onClick={() => { setSf("all"); setQ(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No goods receipts found" subtitle="Receipts appear here when purchase orders are received" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["GRN Number","Status","Received Date","Received By","Notes"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-semibold text-slate-700">{r.grn_number || "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (S[r.status] || "bg-slate-100 text-slate-600")}>
                        {r.status || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">{fmtDate(r.received_date || r.receipt_date || r.created_at)}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{r.received_by || "—"}</td>
                    <td className="py-3 px-3 text-xs text-slate-400 max-w-xs truncate">{r.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

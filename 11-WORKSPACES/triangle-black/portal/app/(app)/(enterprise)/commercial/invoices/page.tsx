// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const STATUSES = ["all","draft","sent","paid","overdue","cancelled"];
const S = {draft:"bg-slate-100 text-slate-600",sent:"bg-blue-100 text-blue-800",paid:"bg-emerald-100 text-emerald-800",overdue:"bg-red-100 text-red-800",cancelled:"bg-slate-100 text-slate-400"};

export default function InvoicesPage() {
  const [statFilter, setStatFilter] = useState("all");
  const [search,     setSearch]     = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["invoices-page"],
    () => authFetch("/api/v1/invoices/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const invs     = toArr(raw);
  const filtered = invs.filter(i => {
    if (statFilter !== "all" && i.status !== statFilter) return false;
    if (search && !(i.invoice_number?.toLowerCase().includes(search.toLowerCase()) || i.title?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const paid     = invs.filter(i => i.status === "paid").length;
  const sent     = invs.filter(i => i.status === "sent").length;
  const overdue  = invs.filter(i => i.status === "overdue").length;
  const totalVal = invs.reduce((s,i) => s + (i.amount||0), 0);
  const paidVal  = invs.filter(i => i.status === "paid").reduce((s,i) => s + (i.amount||0), 0);

  return (
    <PageWrapper>
      <PageHeader
        title="Invoices"
        subtitle={`${invs.length} invoices · EGP ${fmtNum(totalVal)} total · ${paid} paid`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Invoices"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",        value:invs.length, color:"text-slate-800"},
          {label:"Paid",         value:paid,        color:"text-emerald-700"},
          {label:"Sent/Pending", value:sent,        color:"text-blue-700"},
          {label:"Overdue",      value:overdue,     color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-emerald-700 mb-1">Total Revenue</div>
            <div className="text-xl font-bold text-emerald-800">EGP {fmtNum(totalVal)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-blue-700 mb-1">Collected</div>
            <div className="text-xl font-bold text-blue-800">EGP {fmtNum(paidVal)}</div>
            <div className="text-xs text-blue-500 mt-0.5">{totalVal > 0 ? Math.round((paidVal/totalVal)*100) : 0}% collection rate</div>
          </div>
        </div>
      )}

      <SectionCard title={`Invoices (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search invoice number or title…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s}</option>)}
          </select>
          {(statFilter !== "all" || search) && (
            <button onClick={() => { setStatFilter("all"); setSearch(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No invoices found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice #</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3"><span className="font-mono text-xs font-semibold text-slate-700">{i.invoice_number || "—"}</span></td>
                    <td className="py-3 px-3"><p className="font-medium text-slate-700 truncate max-w-[180px]">{i.title || "—"}</p></td>
                    <td className="py-3 px-3"><span className="font-semibold text-slate-800">EGP {fmtNum(i.amount)}</span></td>
                    <td className="py-3 px-3"><span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (S[i.status] || "bg-slate-100 text-slate-600")}>{i.status || "—"}</span></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(i.issue_date || i.created_at)}</td>
                    <td className={`py-3 px-3 text-xs font-medium ${i.status === "overdue" ? "text-red-600" : "text-slate-400"}`}>{fmtDate(i.due_date)}</td>
                    <td className="py-3 px-3 text-xs text-emerald-600">{i.paid_date ? fmtDate(i.paid_date) : <span className="text-slate-300">—</span>}</td>
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

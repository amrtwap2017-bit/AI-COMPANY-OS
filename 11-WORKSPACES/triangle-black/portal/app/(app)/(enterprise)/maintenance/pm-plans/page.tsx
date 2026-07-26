// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

const STATUSES    = ["all","active","overdue","inactive","completed"];
const FREQUENCIES = ["all","daily","weekly","monthly","quarterly","biannual","yearly"];

export default function PMPlansPage() {
  const [statFilter, setStatFilter] = useState("all");
  const [freqFilter, setFreqFilter] = useState("all");
  const [search,     setSearch]     = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["pm-plans-page"],
    () => authFetch("/api/v1/maintenance/pm-plans/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const plans    = toArr(raw);
  const filtered = plans.filter(p => {
    if (statFilter !== "all" && p.status    !== statFilter)  return false;
    if (freqFilter !== "all" && p.frequency !== freqFilter)  return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active  = plans.filter(p => p.status === "active").length;
  const overdue = plans.filter(p => p.status === "overdue").length;
  const dueSoon = plans.filter(p => {
    if (!p.next_due_date) return false;
    try { const diff = (new Date(p.next_due_date) - new Date()) / (1000*60*60*24); return diff >= 0 && diff <= 7; }
    catch { return false; }
  }).length;

  return (
    <PageWrapper>
      <PageHeader
        title="Preventive Maintenance Plans"
        subtitle={`${plans.length} plans · ${active} active · ${overdue} overdue · ${dueSoon} due this week`}
        breadcrumbs={[{label:"Maintenance",href:"/maintenance"},{label:"PM Plans"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total Plans",   value:plans.length, color:"text-slate-800"},
          {label:"Active",        value:active,       color:"text-emerald-700"},
          {label:"Overdue",       value:overdue,      color:"text-red-700"},
          {label:"Due This Week", value:dueSoon,      color:"text-amber-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`PM Plans (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search plans…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s}</option>)}
          </select>
          <select value={freqFilter} onChange={e => setFreqFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {FREQUENCIES.map(f => <option key={f} value={f}>{f === "all" ? "All Frequency" : f}</option>)}
          </select>
          {(statFilter !== "all" || freqFilter !== "all" || search) && (
            <button onClick={() => { setStatFilter("all"); setFreqFilter("all"); setSearch(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No PM plans found" subtitle="Adjust filters or check maintenance settings" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan Title</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Frequency</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Due</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const isOverdue = p.next_due_date && new Date(p.next_due_date) < new Date() && p.status === "active";
                  const isSoon    = p.next_due_date && !isOverdue && (new Date(p.next_due_date) - new Date()) / (1000*60*60*24) <= 7;
                  const S = {active:"bg-emerald-100 text-emerald-800",overdue:"bg-red-100 text-red-800",inactive:"bg-slate-100 text-slate-500",completed:"bg-blue-100 text-blue-800"};
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{p.title}</p>
                        <p className="text-xs text-slate-400">{p.notes || ""}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{p.plan_type || p.type || "preventive"}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{p.frequency || "—"}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (S[p.status] || "bg-slate-100 text-slate-600")}>
                          {p.status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium ${isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-slate-500"}`}>
                          {fmtDate(p.next_due_date)}
                        </span>
                        {isOverdue && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1 rounded">OVERDUE</span>}
                        {isSoon    && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded">SOON</span>}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">{p.owner || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

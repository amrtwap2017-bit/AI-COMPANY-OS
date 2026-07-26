// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const S = {Operational:"bg-emerald-100 text-emerald-800","Under Maintenance":"bg-amber-100 text-amber-800","In Fault":"bg-red-100 text-red-800",Decommissioned:"bg-slate-100 text-slate-500"};

const CATEGORIES = ["all","HVAC","Electrical","Plumbing","Elevator","Fire Safety","BMS","Mechanical","Other"];
const STATUSES   = ["all","Operational","Under Maintenance","In Fault","Decommissioned"];

export default function AssetsPage() {
  const [catFilter,  setCatFilter]  = useState("all");
  const [statFilter, setStatFilter] = useState("all");
  const [search,     setSearch]     = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["assets-page"],
    () => authFetch("/api/v1/assets/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const assets   = toArr(raw);
  const filtered = assets.filter(a => {
    if (catFilter  !== "all" && a.category !== catFilter)  return false;
    if (statFilter !== "all" && a.status   !== statFilter) return false;
    if (search && !a.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const operational = assets.filter(a => a.status === "Operational").length;
  const fault       = assets.filter(a => a.status === "In Fault").length;
  const maintenance = assets.filter(a => a.status === "Under Maintenance").length;
  const catCounts   = assets.reduce((acc, a) => { acc[a.category] = (acc[a.category]||0)+1; return acc; }, {});

  return (
    <PageWrapper>
      <PageHeader
        title="Asset Registry"
        subtitle={`${assets.length} total · ${operational} operational · ${fault} in fault`}
        breadcrumbs={[{label:"Maintenance",href:"/maintenance"},{label:"Assets"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total Assets",   value:assets.length,  color:"text-slate-800"},
          {label:"Operational",    value:operational,    color:"text-emerald-700"},
          {label:"In Maintenance", value:maintenance,    color:"text-amber-700"},
          {label:"In Fault",       value:fault,          color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && Object.keys(catCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(catCounts).map(([cat, count]) => (
            <button key={cat}
              onClick={() => setCatFilter(catFilter === cat ? "all" : cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${catFilter === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              {cat} <span className={catFilter === cat ? "text-blue-200" : "text-slate-400"}>({count})</span>
            </button>
          ))}
          {catFilter !== "all" && (
            <button onClick={() => setCatFilter("all")} className="text-xs text-slate-400 hover:text-red-500 underline px-1">Clear</button>
          )}
        </div>
      )}

      <SectionCard title={`Assets (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search assets…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s}</option>)}
          </select>
          {(catFilter !== "all" || statFilter !== "all" || search) && (
            <button onClick={() => { setCatFilter("all"); setStatFilter("all"); setSearch(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear all</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No assets found" subtitle="Try adjusting your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Asset Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Criticality</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Installed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.model || a.manufacturer || ""}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{a.category || "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (S[a.status] || "bg-slate-100 text-slate-600")}>
                        {a.status || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {a.criticality
                        ? <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border " + (P[a.criticality] || P.low)}>{a.criticality}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">{a.location || "—"}</td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(a.installation_date || a.created_at)}</td>
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

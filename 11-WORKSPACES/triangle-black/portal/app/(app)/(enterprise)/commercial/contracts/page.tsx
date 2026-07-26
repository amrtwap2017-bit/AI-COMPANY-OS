// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const STATUSES = ["all","active","draft","pending","expired","terminated","completed"];
const S = {active:"bg-emerald-100 text-emerald-800",draft:"bg-slate-100 text-slate-600",pending:"bg-amber-100 text-amber-800",expired:"bg-red-100 text-red-700",terminated:"bg-red-100 text-red-700",completed:"bg-blue-100 text-blue-800"};

export default function ContractsPage() {
  const [sf, setSf] = useState("all");
  const [q,  setQ]  = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["contracts-page"],
    () => authFetch("/api/v1/contracts/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const contracts = toArr(raw);
  const filtered  = contracts.filter(c => {
    if (sf !== "all" && c.status !== sf) return false;
    if (q && !(c.title?.toLowerCase().includes(q.toLowerCase()) ||
               c.client_name?.toLowerCase().includes(q.toLowerCase()) ||
               c.contract_number?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total    = contracts.length;
  const active   = contracts.filter(c => c.status === "active").length;
  const expiring = contracts.filter(c => {
    if (!c.end_date || c.status !== "active") return false;
    try { return (new Date(c.end_date) - new Date()) / (1000*60*60*24) <= 30; }
    catch { return false; }
  }).length;
  const totalVal = contracts.filter(c=>c.status==="active").reduce((s,c)=>s+(c.total_value||c.value||0),0);

  return (
    <PageWrapper>
      <PageHeader
        title="Contracts"
        subtitle={`${total} contracts · ${active} active · ${expiring} expiring soon`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Contracts"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",          value:total,                          color:"text-slate-800"},
          {label:"Active",         value:active,                         color:"text-emerald-700"},
          {label:"Expiring (30d)", value:expiring,                       color:"text-amber-700"},
          {label:"Active Value",   value:`EGP ${fmtNum(totalVal)}`,      color:"text-blue-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Contracts (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search contract, client…" value={q}
            onChange={e => setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e => setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          {(sf!=="all"||q) && (
            <button onClick={()=>{setSf("all");setQ("");}}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length===0 ? (
          <EmptyState title="No contracts found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Contract","Client","Value","Status","Start Date","End Date"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  const expiringSoon = c.end_date && c.status==="active" &&
                    (new Date(c.end_date)-new Date())/(1000*60*60*24) <= 30;
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${expiringSoon?"bg-amber-50/40":""}`}>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{c.title || c.contract_number || "—"}</p>
                        <p className="text-xs text-slate-400">{c.contract_number || c.reference || ""}</p>
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600">{c.client_name || "—"}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">EGP {fmtNum(c.total_value||c.value||0)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (S[c.status] || "bg-slate-100 text-slate-600")}>
                          {c.status || "—"}
                        </span>
                        {expiringSoon && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded font-semibold">EXPIRING</span>}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(c.start_date)}</td>
                      <td className={`py-3 px-3 text-xs font-medium ${expiringSoon?"text-amber-600":"text-slate-400"}`}>
                        {fmtDate(c.end_date)}
                      </td>
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

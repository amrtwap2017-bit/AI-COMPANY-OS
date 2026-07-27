"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUSES = ["all","open","closed","awarded","cancelled"];
const S = {open:"bg-blue-100 text-blue-800",closed:"bg-slate-100 text-slate-600",awarded:"bg-emerald-100 text-emerald-800",cancelled:"bg-red-100 text-red-600"};

export default function RFQsPage() {
  const [sf, setSf] = useState("all");
  const [q,  setQ]  = useState("");

  const { data: raw=[], isLoading } = useQuery(
    ["rfqs-page"],
    () => authFetch("/api/v1/rfqs/?limit=100").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const rfqs = toArr(raw);
  const filtered = rfqs.filter(r => {
    if (sf!=="all"&&r.status!==sf) return false;
    if (q&&!(r.rfq_number?.toLowerCase().includes(q.toLowerCase())||r.title?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total   = rfqs.length;
  const open    = rfqs.filter(r=>r.status==="open").length;
  const awarded = rfqs.filter(r=>r.status==="awarded").length;
  const closed  = rfqs.filter(r=>r.status==="closed").length;

  const now = new Date();
  const overdue = rfqs.filter(r=>{
    if(r.status!=="open"||!r.deadline) return false;
    try { return new Date(r.deadline) < now; } catch { return false; }
  }).length;

  return (
    <PageWrapper>
      <PageHeader
        title="RFQs — Request for Quotation"
        subtitle={`${total} total · ${open} open · ${awarded} awarded · ${overdue} overdue`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"RFQs"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",   value:total,   color:"text-slate-800"},
          {label:"Open",    value:open,    color:"text-blue-700"},
          {label:"Awarded", value:awarded, color:"text-emerald-700"},
          {label:"Overdue", value:overdue, color:overdue>0?"text-red-700":"text-slate-500"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`RFQs (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search RFQ number or title…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          {(sf!=="all"||q)&&<button onClick={()=>{setSf("all");setQ("");}} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>

        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No RFQs found"/>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["RFQ Number","Title","Status","Deadline","Created"].map(h=>(
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r=>{
                  const isOver = r.status==="open"&&r.deadline&&new Date(r.deadline)<now;
                  const isSoon = r.status==="open"&&r.deadline&&!isOver&&(new Date(r.deadline)-now)/(1000*60*60*24)<=7;
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${isOver?"bg-red-50/30":""}`}>
                      <td className="py-3 px-3"><span className="font-mono text-xs font-semibold text-slate-700">{r.rfq_number||"—"}</span></td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800 truncate max-w-[220px]">{r.title||"—"}</p>
                        <p className="text-xs text-slate-400">{r.description?.slice(0,60)||""}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[r.status]||"bg-slate-100 text-slate-600")}>
                          {r.status||"—"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium ${isOver?"text-red-600":isSoon?"text-amber-600":"text-slate-500"}`}>
                          {fmtDate(r.deadline)}
                        </span>
                        {isOver&&<span className="ml-1 text-xs bg-red-100 text-red-700 px-1 rounded font-semibold">OVERDUE</span>}
                        {isSoon&&<span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded font-semibold">SOON</span>}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(r.created_at)}</td>
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

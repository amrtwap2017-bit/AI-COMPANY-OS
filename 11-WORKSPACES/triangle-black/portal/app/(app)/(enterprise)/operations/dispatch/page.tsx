// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const S = {open:"bg-blue-100 text-blue-800",in_progress:"bg-indigo-100 text-indigo-800",completed:"bg-emerald-100 text-emerald-800",cancelled:"bg-slate-100 text-slate-500"};

const STATUSES  = ["all","open","in_progress","completed","cancelled"];
const PRIORITIES = ["all","critical","high","medium","low"];

export default function DispatchPage() {
  const [q,   setQ]   = useState("");
  const [sf,  setSf]  = useState("all");
  const [pf,  setPf]  = useState("all");

  const { data: woRaw=[], isLoading: woL } = useQuery(
    ["dispatch-wo"],
    () => authFetch("/api/v1/work-orders/?limit=200").then(r=>r.json()),
    { refetchInterval: 30000 }
  );

  const { data: techRaw=[], isLoading: techL } = useQuery(
    ["dispatch-tech"],
    () => authFetch("/api/v1/technicians/?limit=100").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const wos   = toArr(woRaw);
  const techs = toArr(techRaw);
  const isLoading = woL || techL;

  const techMap = techs.reduce((m,t) => { m[t.id] = t.name; return m; }, {});

  const filtered = wos.filter(w => {
    if (sf !== "all" && w.status !== sf) return false;
    if (pf !== "all" && w.priority !== pf) return false;
    if (q && !w.title?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const open      = wos.filter(w => w.status === "open").length;
  const inProg    = wos.filter(w => w.status === "in_progress").length;
  const critical  = wos.filter(w => w.priority === "critical" && !["completed","cancelled"].includes(w.status)).length;
  const unassigned = wos.filter(w => !w.technician_id && !["completed","cancelled"].includes(w.status)).length;
  const techAvail  = techs.filter(t => t.is_active !== false && (t.current_work_orders||0) < (t.max_work_orders||5)).length;

  return (
    <PageWrapper>
      <PageHeader
        title="Dispatch Center"
        subtitle={`${wos.length} work orders · ${open} open · ${critical} critical · ${unassigned} unassigned`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Dispatch"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          {label:"Total WOs",    value:wos.length, color:"text-slate-800"},
          {label:"Open",         value:open,       color:"text-blue-700"},
          {label:"In Progress",  value:inProg,     color:"text-indigo-700"},
          {label:"Critical",     value:critical,   color:critical>0?"text-red-700":"text-emerald-700"},
          {label:"Techs Available",value:techAvail,color:techAvail>0?"text-emerald-700":"text-amber-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && unassigned > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-amber-600 font-bold text-lg">!</span>
          <p className="text-sm font-semibold text-amber-800">{unassigned} work orders not yet assigned to a technician</p>
        </div>
      )}

      <SectionCard title={`Work Orders (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search work orders…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s.replace("_"," ")}</option>)}
          </select>
          <select value={pf} onChange={e=>setPf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {PRIORITIES.map(p=><option key={p} value={p}>{p==="all"?"All Priority":p}</option>)}
          </select>
          {(sf!=="all"||pf!=="all"||q)&&(
            <button onClick={()=>{setSf("all");setPf("all");setQ("");}}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No work orders found"/>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["Work Order","Type","Priority","Status","Technician","Date"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(w=>(
                  <tr key={w.id} className={`hover:bg-slate-50 transition-colors ${w.priority==="critical"?"bg-red-50/30":""}`}>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 truncate max-w-xs">{w.title}</p>
                      {w.description&&<p className="text-xs text-slate-400 truncate">{w.description?.slice(0,50)}</p>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{w.type||"maintenance"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[w.priority]||P.low)}>{w.priority||"—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[w.status]||"bg-slate-100 text-slate-600")}>{w.status?.replace(/_/g," ")||"—"}</span>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      {w.technician_id
                        ? <span className="text-slate-700 font-medium">{techMap[w.technician_id]||"Assigned"}</span>
                        : <span className="text-amber-600 font-semibold">Unassigned</span>
                      }
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(w.created_at)}</td>
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

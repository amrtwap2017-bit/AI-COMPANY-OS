// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

export default function WorkHistoryPage() {
  const [q,  setQ]  = useState("");
  const [sf, setSf] = useState("all");

  const { data: raw=[], isLoading } = useQuery(
    ["work_orders-page"],
    () => authFetch("/api/v1/work-orders/?limit=100").then(r=>r.json()),
    { refetchInterval: 60000 }
  );

  const items    = toArr(raw);
  const filtered = items.filter(x => {
    if (sf !== "all" && x.status !== sf) return false;
    if (q && !String(x.title||"").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <PageWrapper>
      <PageHeader
        title="Work History"
        subtitle={`${items.length} work orders records`}
        breadcrumbs={[{label:"Maintenance",href:"/maintenance"},{label:"Work History"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[{label:"Total",value:items.length,color:"text-slate-800"},{label:"Open",value:items.filter(x=>x.status==="open").length,color:"text-blue-700"},{label:"Critical",value:items.filter(x=>x.priority==="critical"&&x.status!=="completed").length,color:"text-red-700"},{label:"Completed",value:items.filter(x=>x.status==="completed").length,color:"text-emerald-700"}].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Work Orders (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search work history…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"><option value="all">All Status</option><option value="open">open</option><option value="in_progress">in progress</option><option value="completed">completed</option><option value="active">active</option><option value="approved">approved</option><option value="paid">paid</option></select>
          {(sf!=="all"||q)&&<button onClick={()=>{setSf("all");setQ("")}} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No work orders found" subtitle="Adjust filters or check your data"/>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Title/Name</th> <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Priority</th> <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th> <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(x=>(
                  <tr key={x.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3"><p className="font-medium text-slate-800 truncate max-w-xs">{x.title||"—"}</p>{x.description&&<p className="text-xs text-slate-400 truncate">{x.description?.slice(0,60)}</p>}</td>
                    <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${(x.priority==="critical"?"bg-red-100 text-red-800 border-red-200":x.priority==="high"?"bg-orange-100 text-orange-800 border-orange-200":x.priority==="medium"?"bg-amber-100 text-amber-800 border-amber-200":"bg-slate-100 text-slate-600 border-slate-200")}`}>{x.priority||"—"}</span></td>
                    <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${(x.status==="open"?"bg-blue-100 text-blue-800":x.status==="completed"?"bg-emerald-100 text-emerald-800":x.status==="in_progress"?"bg-indigo-100 text-indigo-800":x.status==="active"?"bg-emerald-100 text-emerald-800":x.status==="paid"?"bg-emerald-100 text-emerald-800":x.status==="approved"?"bg-teal-100 text-teal-800":x.status==="overdue"?"bg-red-100 text-red-800":"bg-slate-100 text-slate-600")}`}>{x.status?.replace(/_/g," ")||"—"}</span></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(x.created_at)}</td>
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

"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const S = {new:"bg-blue-100 text-blue-800",qualified:"bg-indigo-100 text-indigo-800",converted:"bg-emerald-100 text-emerald-800",won:"bg-emerald-100 text-emerald-800",assigned:"bg-amber-100 text-amber-800",lost:"bg-red-100 text-red-700",negotiation:"bg-orange-100 text-orange-800"};

export default function CustomersPage() {
  const [q,  setQ]  = useState("");
  const [sf, setSf] = useState("all");

  const { data: raw=[], isLoading } = useQuery(
    ["customers-leads"],
    () => authFetch("/api/v1/leads/?limit=300").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const leads    = toArr(raw);
  const filtered = leads.filter(l => {
    if (sf !== "all" && l.status !== sf) return false;
    if (q && !(l.name?.toLowerCase().includes(q.toLowerCase()) ||
               l.company?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total     = leads.length;
  const converted = leads.filter(l => ["converted","won"].includes(l.status)).length;
  const newL      = leads.filter(l => l.status === "new").length;
  const avgScore  = leads.length ? Math.round(leads.reduce((s,l)=>s+(l.score||0),0)/leads.length) : 0;

  const STATUSES = ["all","new","qualified","assigned","negotiation","converted","won","lost"];

  return (
    <PageWrapper>
      <PageHeader
        title="Customers & CRM"
        subtitle={`${total} leads · ${converted} converted · avg score ${avgScore}`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Customers"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total Leads",   value:total,     color:"text-slate-800"},
          {label:"New",           value:newL,      color:"text-blue-700"},
          {label:"Converted/Won", value:converted, color:"text-emerald-700"},
          {label:"Avg Score",     value:avgScore,  color:avgScore>=70?"text-emerald-700":"text-amber-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Customers (${filtered.length})`}>
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search name or company…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          {(sf!=="all"||q)&&<button onClick={()=>{setSf("all");setQ("");}} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No customers found"/>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["Name","Company","Email","Status","Score","Date"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(l=>(
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800">{l.name}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{l.company||"—"}</td>
                    <td className="py-3 px-3 text-xs text-slate-500">{l.email||"—"}</td>
                    <td className="py-3 px-3"><span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[l.status]||"bg-slate-100 text-slate-600")}>{l.status||"—"}</span></td>
                    <td className="py-3 px-3"><span className={`text-sm font-bold ${(l.score||0)>=80?"text-emerald-600":(l.score||0)>=50?"text-amber-600":"text-slate-500"}`}>{l.score||0}</span></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(l.created_at)}</td>
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

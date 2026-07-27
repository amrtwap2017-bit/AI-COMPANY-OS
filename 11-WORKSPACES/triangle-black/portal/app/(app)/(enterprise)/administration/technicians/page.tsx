"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function AdminTechniciansPage() {
  const [q, setQ] = useState("");

  const { data: raw=[], isLoading } = useQuery(
    ["admin-technicians"],
    () => authFetch("/api/v1/technicians/?limit=100").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const techs    = toArr(raw);
  const filtered = techs.filter(t =>
    !q || t.name?.toLowerCase().includes(q.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(q.toLowerCase())
  );

  const active   = techs.filter(t => t.is_active !== false).length;
  const atCap    = techs.filter(t => (t.current_work_orders||0) >= (t.max_work_orders||5)).length;
  const avail    = techs.filter(t => t.is_active !== false && (t.current_work_orders||0) < (t.max_work_orders||5)).length;

  return (
    <PageWrapper>
      <PageHeader
        title="Technician Management"
        subtitle={`${techs.length} total · ${active} active · ${avail} available`}
        breadcrumbs={[{label:"Administration",href:"/administration"},{label:"Technicians"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",      value:techs.length, color:"text-slate-800"},
          {label:"Active",     value:active,       color:"text-emerald-700"},
          {label:"Available",  value:avail,        color:"text-blue-700"},
          {label:"At Capacity",value:atCap,        color:atCap>0?"text-red-700":"text-secondary"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-secondary mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Technicians (${filtered.length})`}>
        <div className="mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search technician or specialization…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-400" />
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No technicians found"/>:(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(t=>{
              const wos = t.current_work_orders||0;
              const max = t.max_work_orders||5;
              const pct = Math.min(100,(wos/max)*100);
              const isActive = t.is_active !== false;
              return (
                <div key={t.id} className={`rounded-xl border p-4 ${isActive?"bg-white border-slate-200":"bg-slate-50 border-slate-200 opacity-70"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-semibold text-slate-800 truncate">{t.name}</p>
                      <p className="text-xs text-secondary mt-0.5">{t.specialization||t.trade||"General"}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isActive?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-secondary"}`}>
                      {isActive?"Active":"Inactive"}
                    </span>
                  </div>
                  {t.phone&&<p className="text-xs text-tertiary mb-2">{t.phone}</p>}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-secondary">
                      <span>Workload</span>
                      <span className="font-semibold">{wos}/{max} WOs</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${pct>=100?"bg-red-500":pct>=70?"bg-amber-500":"bg-emerald-500"}`}
                        style={{width:`${pct}%`}} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

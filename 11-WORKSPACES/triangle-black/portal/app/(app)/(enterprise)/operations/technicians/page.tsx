"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const fmtDateTime = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const P_COLOR = {
  critical: "bg-red-100 text-red-800 border border-red-200",
  high:     "bg-orange-100 text-orange-800 border border-orange-200",
  medium:   "bg-amber-100 text-amber-800 border border-amber-200",
  low:      "bg-slate-100 text-slate-600 border border-slate-200",
};
const S_COLOR = {
  open:        "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed:   "bg-emerald-100 text-emerald-800",
  cancelled:   "bg-slate-100 text-slate-500",
  resolved:    "bg-emerald-100 text-emerald-800",
  closed:      "bg-slate-100 text-slate-500",
};
function PBadge({v}) {
  return <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold "+(P_COLOR[v?.toLowerCase()]||P_COLOR.low)}>{v||"—"}</span>;
}
function SBadge({v}) {
  return <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S_COLOR[v?.toLowerCase()]||"bg-slate-100 text-slate-600")}>{v?.replace("_"," ")||"—"}</span>;
}

export default function TechniciansPage() {
  const [search, setSearch] = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["technicians-page"],
    () => authFetch("/api/v1/technicians/?limit=100").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const techs    = toArr(raw);
  const filtered = techs.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const active   = techs.filter(t => t.is_active !== false).length;
  const atCap    = techs.filter(t => t.current_work_orders >= t.max_work_orders).length;
  const available = techs.filter(t => (t.current_work_orders||0) < (t.max_work_orders||5)).length;

  return (
    <PageWrapper>
      <PageHeader
        title="Technicians"
        subtitle={`${techs.length} total · ${active} active · ${available} available`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Technicians"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",     value:techs.length, color:"text-slate-800"},
          {label:"Active",    value:active,        color:"text-emerald-700"},
          {label:"Available", value:available,     color:"text-blue-700"},
          {label:"At Capacity",value:atCap,        color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Technicians (${filtered.length})`}>
        <div className="mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search technicians…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
        </div>
        {isLoading ? <LoadingState /> : filtered.length === 0 ? <EmptyState title="No technicians found" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(t => {
              const wos = t.current_work_orders || 0;
              const max = t.max_work_orders || 5;
              const pct = Math.min(100, (wos/max)*100);
              const isActive = t.is_active !== false;
              return (
                <div key={t.id} className={`rounded-xl border p-4 ${isActive ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-70"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.specialization || t.trade || "General"}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {t.phone && <p className="text-xs text-slate-400 mb-2">{t.phone}</p>}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Work Orders</span>
                      <span className="font-semibold">{wos} / {max}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
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

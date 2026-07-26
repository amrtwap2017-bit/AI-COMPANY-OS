// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const STATUSES = ["all","active","planning","on_hold","completed","cancelled"];
const S = {active:"bg-blue-100 text-blue-800",planning:"bg-amber-100 text-amber-800",on_hold:"bg-slate-100 text-slate-600",completed:"bg-emerald-100 text-emerald-800",cancelled:"bg-red-100 text-red-700"};

export default function ProjectsPage() {
  const [sf, setSf] = useState("all");
  const [q,  setQ]  = useState("all");
  const [qv, setQv] = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["projects-page"],
    () => authFetch("/api/v1/projects/?limit=100").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const projects = toArr(raw);
  const filtered = projects.filter(p => {
    if (sf !== "all" && p.status !== sf) return false;
    if (qv && !(p.name?.toLowerCase().includes(qv.toLowerCase()) ||
                p.title?.toLowerCase().includes(qv.toLowerCase()) ||
                p.description?.toLowerCase().includes(qv.toLowerCase()))) return false;
    return true;
  });

  const total     = projects.length;
  const active    = projects.filter(p => p.status === "active").length;
  const planning  = projects.filter(p => p.status === "planning").length;
  const completed = projects.filter(p => p.status === "completed").length;
  const totalBudget = projects.filter(p => p.status === "active").reduce((s,p) => s+(p.budget||0), 0);

  return (
    <PageWrapper>
      <PageHeader
        title="Projects"
        subtitle={`${total} projects · ${active} active · ${planning} planning · EGP ${fmtNum(totalBudget)} active budget`}
        breadcrumbs={[{label:"Projects Center",href:"/projects-center"},{label:"Projects"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",        value:total,     color:"text-slate-800"},
          {label:"Active",       value:active,    color:"text-blue-700"},
          {label:"Planning",     value:planning,  color:"text-amber-700"},
          {label:"Completed",    value:completed, color:"text-emerald-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Projects (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search projects…" value={qv}
            onChange={e => setQv(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e => setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s.replace("_"," ")}</option>)}
          </select>
          {(sf !== "all" || qv) && (
            <button onClick={() => { setSf("all"); setQv(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No projects found" />
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const progress = p.progress_pct || p.completion_percentage || 0;
              const title    = p.name || p.title || "—";
              const budget   = p.budget || 0;
              const spent    = p.spent || p.actual_cost || 0;
              const budgetPct = budget > 0 ? Math.min(100, (spent/budget)*100) : 0;

              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-semibold text-slate-800 text-base">{title}</p>
                      {p.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{p.description}</p>}
                    </div>
                    <span className={"shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " + (S[p.status] || "bg-slate-100 text-slate-600")}>
                      {p.status?.replace("_"," ") || "—"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                    {budget > 0 && <span>💰 Budget: <span className="font-semibold text-slate-700">EGP {fmtNum(budget)}</span></span>}
                    {spent  > 0 && <span>📊 Spent: <span className="font-semibold text-slate-700">EGP {fmtNum(spent)}</span></span>}
                    {p.start_date && <span>📅 Start: {fmtDate(p.start_date)}</span>}
                    {p.end_date   && <span>🏁 End: {fmtDate(p.end_date)}</span>}
                    {p.site_name  && <span>📍 {p.site_name}</span>}
                    {p.manager    && <span>👤 {p.manager}</span>}
                  </div>

                  {progress > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-slate-700">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : progress >= 60 ? "bg-blue-500" : "bg-amber-500"}`}
                          style={{width:`${Math.min(100,progress)}%`}} />
                      </div>
                    </div>
                  )}

                  {budget > 0 && spent > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Budget used</span>
                        <span className={`font-semibold ${budgetPct > 90 ? "text-red-600" : budgetPct > 70 ? "text-amber-600" : "text-slate-700"}`}>{Math.round(budgetPct)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{width:`${Math.min(100,budgetPct)}%`}} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

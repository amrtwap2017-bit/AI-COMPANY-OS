// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const CATEGORIES = ["all","HVAC","Electrical","Plumbing","Elevator","Fire Safety","General","IT","Tools"];

export default function SuppliersPage() {
  const [catFilter, setCatFilter] = useState("all");
  const [q,         setQ]         = useState("");

  const { data: raw = [], isLoading } = useQuery(
    ["suppliers-page"],
    () => authFetch("/api/v1/suppliers/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const suppliers = toArr(raw);
  const filtered  = suppliers.filter(s => {
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (q && !(s.name?.toLowerCase().includes(q.toLowerCase()) ||
               s.contact_email?.toLowerCase().includes(q.toLowerCase()) ||
               s.city?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const active   = suppliers.filter(s => s.is_active !== false).length;
  const catCounts = suppliers.reduce((a, s) => { if (s.category) { a[s.category] = (a[s.category]||0)+1; } return a; }, {});

  const RATING_COLOR = (r) => {
    if (!r) return "text-slate-400";
    if (r >= 4) return "text-emerald-600";
    if (r >= 3) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} total suppliers · ${active} active`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Suppliers"}]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",     value:suppliers.length, color:"text-slate-800"},
          {label:"Active",    value:active,           color:"text-emerald-700"},
          {label:"Categories",value:Object.keys(catCounts).length, color:"text-blue-700"},
          {label:"Filtered",  value:filtered.length,  color:"text-slate-600"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && Object.keys(catCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(catCounts).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
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

      <SectionCard title={`Suppliers (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search supplier name, email, city…" value={q}
            onChange={e => setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:border-blue-400" />
          {(catFilter !== "all" || q) && (
            <button onClick={() => { setCatFilter("all"); setQ(""); }}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No suppliers found" subtitle="Adjust filters to find suppliers" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(s => (
              <div key={s.id} className={`rounded-xl border p-4 transition-all hover:shadow-sm ${s.is_active !== false ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-70"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                    {s.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 mt-1">{s.category}</span>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {s.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="space-y-1 mt-3">
                  {s.contact_email && <p className="text-xs text-slate-500 truncate">📧 {s.contact_email}</p>}
                  {s.contact_phone && <p className="text-xs text-slate-500">📞 {s.contact_phone}</p>}
                  {s.city          && <p className="text-xs text-slate-400">📍 {s.city}{s.country ? `, ${s.country}` : ""}</p>}
                  {s.rating != null && (
                    <p className={`text-xs font-semibold ${RATING_COLOR(s.rating)}`}>
                      ⭐ Rating: {s.rating}/5
                    </p>
                  )}
                  {s.payment_terms && <p className="text-xs text-slate-400">💳 {s.payment_terms}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}

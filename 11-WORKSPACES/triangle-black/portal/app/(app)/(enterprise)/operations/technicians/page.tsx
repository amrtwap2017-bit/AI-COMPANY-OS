"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function TechniciansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(["tech-list"], () => authFetch("/api/v1/technicians/").then(r=>r.json()), {refetchInterval:60000});
  const { data: woRaw } = useQuery(["tech-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const techs = toArr(raw);
  const wos   = toArr(woRaw);

  const active   = techs.filter(t => t.is_active !== false);
  const busy     = techs.filter(t => (t.current_work_orders||0) > 0);
  const atCap    = techs.filter(t => (t.current_work_orders||0) >= (t.max_work_orders||5));
  const available = techs.filter(t => t.is_active !== false && (t.current_work_orders||0) === 0);

  const filtered = techs.filter(t => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" ||
      (filter==="active" && t.is_active!==false) ||
      (filter==="available" && t.is_active!==false && (t.current_work_orders||0)===0) ||
      (filter==="busy" && (t.current_work_orders||0)>0) ||
      (filter==="capacity" && (t.current_work_orders||0)>=(t.max_work_orders||5));
    return matchSearch && matchFilter;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">Operations</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Technicians</h1>
          <p className="text-slate-500 text-sm mt-1.5">{techs.length} total · {active.length} active · {available.length} available · {busy.length} on duty</p>
        </div>
        <button onClick={()=>router.push("/operations/dispatch")}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all">
          👷 Dispatch Center
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total",       value:techs.length,    color:"slate",   filter:"all" },
          { label:"Available",   value:available.length,color:"emerald", filter:"available" },
          { label:"On Duty",     value:busy.length,     color:"amber",   filter:"busy" },
          { label:"At Capacity", value:atCap.length,    color:atCap.length>0?"red":"emerald", filter:"capacity" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setFilter(filter===k.filter?"all":k.filter)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 text-center transition-all hover:shadow-md ${filter===k.filter?`border-${k.color}-400 shadow-sm`:"border-slate-200 dark:border-slate-800 hover:border-amber-300"}`}>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{k.label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search technicians..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"/>
        {search && <button onClick={()=>setSearch("")} className="px-3 py-2 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">Clear ×</button>}
        <div className="text-xs text-slate-400 self-center">{filtered.length} technicians</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t,i)=>{
          const load = Math.min(Math.round((t.current_work_orders||0)/Math.max(t.max_work_orders||5,1)*100), 100);
          const techWOs = wos.filter(w => w.technician_id===t.id);
          const isActive = t.is_active !== false;
          const loadColor = load>=90?"red":load>=70?"amber":"emerald";
          return (
            <button key={i} onClick={()=>router.push(`/operations/technicians/${t.id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-black">{(t.name||"?")[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600">{t.name}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isActive?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{isActive?"Active":"Inactive"}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">{t.email}</div>
                  {t.specializations && t.specializations.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {t.specializations.slice(0,2).map((s,j)=>(
                        <span key={j} className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">{s}</span>
                      ))}
                      {t.specializations.length>2 && <span className="text-[10px] text-slate-400">+{t.specializations.length-2}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Capacity</span>
                  <span className={`font-bold text-${loadColor}-500`}>{t.current_work_orders||0} / {t.max_work_orders||5} WOs</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full bg-${loadColor}-500 transition-all`} style={{width:`${load}%`}}/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                {[
                  { label:"Total", value:techWOs.length, color:"slate" },
                  { label:"Done",  value:techWOs.filter(w=>w.status==="completed").length, color:"emerald" },
                  { label:"Open",  value:techWOs.filter(w=>w.status==="open"||w.status==="in_progress").length, color:"amber" },
                ].map((s,j)=>(
                  <div key={j} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5">
                    <div className={`text-base font-black text-${s.color}-500`}>{s.value}</div>
                    <div className="text-[10px] text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function TechniciansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["tech-list"],()=>authFetch("/api/v1/technicians/").then(r=>r.json()),{refetchInterval:60000}
  );
  const { data: woRaw } = useQuery(["tech-wos"],()=>authFetch("/api/v1/work-orders/").then(r=>r.json()));

  const techs = toArr(raw);
  const wos   = toArr(woRaw);

  const active    = techs.filter((t: any) =>t.is_active!==false);
  const busy      = techs.filter((t: any) =>(t.current_work_orders||0)>0);
  const atCap     = techs.filter((t: any) =>(t.current_work_orders||0)>=(t.max_work_orders||5));
  const available = techs.filter((t: any) =>t.is_active!==false&&(t.current_work_orders||0)===0);

  const filtered = techs.filter((t: any) =>{
    const ms = !search||t.name?.toLowerCase().includes(search.toLowerCase())||t.email?.toLowerCase().includes(search.toLowerCase());
    const mf = filter==="all"||
      (filter==="active"&&t.is_active!==false)||
      (filter==="available"&&t.is_active!==false&&(t.current_work_orders||0)===0)||
      (filter==="busy"&&(t.current_work_orders||0)>0)||
      (filter==="capacity"&&(t.current_work_orders||0)>=(t.max_work_orders||5));
    return ms&&mf;
  });

  if (isLoading) return <div className="tb-canvas"><div className="tb-shimmer-block" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Technicians</h1>
              <p className="tb-hero-description">{techs.length} total · {active.length} active · {available.length} available · {busy.length} on duty</p>
              <div className="mt-2"><ExportButton data={toArr(raw)} filename="technicians" title="Technicians"/></div>
            </div>
            <button onClick={()=>router.push("/operations/dispatch")} className="tb-btn tb-btn-primary">👷 Dispatch Center</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Total",      value:techs.length,    color:"var(--color-text-2)",  f:"all"},
              {label:"Available",  value:available.length,color:"var(--color-success)", f:"available"},
              {label:"On Duty",    value:busy.length,     color:"var(--color-warning)", f:"busy"},
              {label:"At Capacity",value:atCap.length,    color:atCap.length>0?"var(--color-danger)":"var(--color-success)",f:"capacity"},
            ].map((k: any, i: number) =>(
              <button key={i} onClick={()=>setFilter(filter===k.f?"all":k.f)} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-action-bar mb-4">
          <button onClick={()=>router.push("/operations/work-orders/new")} className="tb-btn tb-btn-primary">+ New Work Order</button>
          <button onClick={()=>router.push("/operations/dispatch")} className="tb-btn tb-btn-secondary">📋 Dispatch Board</button>
          <button onClick={()=>router.push("/operations/time-tracking")} className="tb-btn tb-btn-secondary">⏱ Time Tracking</button>
        </div>

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search technicians..."
            className="tb-input" style={{maxWidth:"400px"}}/>
          {search&&<button onClick={()=>setSearch("")} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} technicians</span>
        </div>

        {filtered.length===0 ? (
          <div className="tb-section">
            <div className="tb-empty">
              <div className="tb-empty-icon">👷</div>
              <div className="tb-empty-title">No technicians found</div>
            </div>
          </div>
        ) : (
          <div className="tb-grid-3">
            {filtered.map((t: any, i: number) =>{
              const load         = Math.min(Math.round((t.current_work_orders||0)/Math.max(t.max_work_orders||5,1)*100),100);
              const techWOs      = wos.filter((w: any) =>w.technician_id===t.id);
              const completedWOs = techWOs.filter((w: any) =>w.status==="completed");
              const openWOs      = techWOs.filter((w: any) =>w.status==="open"||w.status==="in_progress");
              const loadColor    = load>=90?"#A84A3D":load>=70?"#B07A2A":"#547C4D";
              return (
                <button key={i} onClick={()=>router.push(`/operations/technicians/${t.id}`)}
                  className="tb-section text-left tb-hover-lift cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="tb-avatar tb-avatar--lg tb-avatar--brand">{(t.name||"?")[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-sm font-bold text-primary truncate">{t.name}</div>
                        <span className={`tb-badge flex-shrink-0 ${t.is_active!==false?"tb-badge-success":"tb-badge-neutral"}`} style={{fontSize:"0.5rem",padding:"1px 5px"}}>
                          {t.is_active!==false?"Active":"Inactive"}
                        </span>
                      </div>
                      <div className="text-xs text-tertiary truncate">{t.email}</div>
                      {t.specializations?.length>0&&(
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {t.specializations.slice(0,2).map((s: any, j: number) =>(
                            <span key={j} className="tb-badge tb-badge-brand" style={{fontSize:"0.5rem",padding:"1px 6px"}}>{s}</span>
                          ))}
                          {t.specializations.length>2&&<span className="text-xs text-tertiary">+{t.specializations.length-2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-secondary">Capacity</span>
                      <span className="font-bold" style={{color:loadColor}}>{t.current_work_orders||0} / {t.max_work_orders||5} WOs</span>
                    </div>
                    <div className="tb-progress">
                      <div className="tb-progress-bar" style={{background:loadColor,width:`${load}%`}}/>
                    </div>
                  </div>
                  <div className="tb-grid-3 mt-3">
                    {[
                      {label:"Total",value:techWOs.length,    color:"text-secondary"},
                      {label:"Done", value:completedWOs.length,color:"text-success"},
                      {label:"Open", value:openWOs.length,    color:"text-warning"},
                    ].map((s: any, j: number) =>(
                      <div key={j} className="text-center bg-surface-alt rounded-lg py-2">
                        <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-tertiary">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

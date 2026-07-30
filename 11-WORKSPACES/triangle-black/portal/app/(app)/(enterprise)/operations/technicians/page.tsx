"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function TechniciansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["tech-list"], () => authFetch("/api/v1/technicians/").then(r=>r.json()), {refetchInterval:60000}
  );
  const { data: woRaw } = useQuery(["tech-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));

  const techs = toArr(raw);
  const wos   = toArr(woRaw);

  const active    = techs.filter(t=>t.is_active!==false);
  const busy      = techs.filter(t=>(t.current_work_orders||0)>0);
  const atCap     = techs.filter(t=>(t.current_work_orders||0)>=(t.max_work_orders||5));
  const available = techs.filter(t=>t.is_active!==false&&(t.current_work_orders||0)===0);

  const filtered = techs.filter(t => {
    const ms = !search||t.name?.toLowerCase().includes(search.toLowerCase())||t.email?.toLowerCase().includes(search.toLowerCase());
    const mf = filter==="all"||
      (filter==="active"&&t.is_active!==false)||
      (filter==="available"&&t.is_active!==false&&(t.current_work_orders||0)===0)||
      (filter==="busy"&&(t.current_work_orders||0)>0)||
      (filter==="capacity"&&(t.current_work_orders||0)>=(t.max_work_orders||5));
    return ms&&mf;
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  const handleExport = (url: string) => {
    const token = localStorage.getItem("tb_token") || localStorage.getItem("tb_access_token") || "";
    const a = document.createElement("a");
    a.href = "http://localhost:8030" + url + "?token=" + token;
    fetch("http://localhost:8030" + url, {headers: {"Authorization": "Bearer " + token}})
      .then(r => r.blob())
      .then(blob => {
        const dl = document.createElement("a");
        dl.href = URL.createObjectURL(blob);
        dl.download = url.split("/").pop() + "_" + new Date().toISOString().slice(0,10) + ".csv";
        dl.click();
      });
  };
  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A1208 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-orange-500 mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Technicians</h1>
              <p className="tb-hero-description">{techs.length} total · {active.length} active · {available.length} available · {busy.length} on duty</p>
              <ExportButton data={toArr(raw)} filename="technicians" title="Technicians"/>
            </div>
            <button onClick={()=>router.push("/operations/dispatch")} className="tb-hero-btn tb-hero-btn--primary">👷 Dispatch Center</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Total",     value:techs.length,     color:"rgba(148,163,184,0.9)", f:"all"},
              {label:"Available", value:available.length, color:"#547C4D",               f:"available"},
              {label:"On Duty",   value:busy.length,      color:"#B07A2A",               f:"busy"},
              {label:"At Capacity",value:atCap.length,   color:atCap.length>0?"#A84A3D":"#547C4D", f:"capacity"},
            ].map((k,i)=>{
              const act=filter===k.f;
              return (
                <button key={i} onClick={()=>setFilter(act?"all":k.f)}
                  className="tb-hero-kpi"
                  style={{background:act?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${act?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-flex-gap-3">
          <div className="tb-search" style={{flex:1,maxWidth:400}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search technicians..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          {search&&<button onClick={()=>setSearch("")} className="tb-pill">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} technicians</span>
        </div>

        {/* Technician cards */}
        {filtered.length === 0 ? (
          <div className="tb-section">
            <div className="tb-empty">
              <div className="tb-empty-icon">👷</div>
              <div className="tb-empty-title">No technicians found</div>
            </div>
          </div>
        ) : (
          <div className="tb-grid-3">
            {filtered.map((t,i)=>{
              const load      = Math.min(Math.round((t.current_work_orders||0)/Math.max(t.max_work_orders||5,1)*100),100);
              const techWOs   = wos.filter(w=>w.technician_id===t.id);
              const completedWOs = techWOs.filter(w=>w.status==="completed");
              const openWOs   = techWOs.filter(w=>w.status==="open"||w.status==="in_progress");
              const loadColor = load>=90?"#A84A3D":load>=70?"#B07A2A":"#547C4D";

              return (
                <button key={i} onClick={()=>router.push(`/operations/technicians/${t.id}`)}
                  className="tb-section text-left hover:border-brand transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="tb-avatar tb-avatar--lg tb-avatar--brand">{(t.name||"?")[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-sm font-bold text-primary truncate group-hover:text-brand">{t.name}</div>
                        <span className={`tb-badge flex-shrink-0 ${t.is_active!==false?"tb-badge--success":"tb-badge--neutral"}`} style={{fontSize:"0.5rem",padding:"1px 5px"}}>
                          {t.is_active!==false?"Active":"Inactive"}
                        </span>
                      </div>
                      <div className="text-xs text-tertiary truncate">{t.email}</div>
                      {t.specializations?.length>0&&(
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {t.specializations.slice(0,2).map((s,j)=>(
                            <span key={j} className="tb-badge" style={{fontSize:"0.5rem",padding:"1px 6px",background:"rgba(180,83,9,0.1)",color:"var(--color-brand)",border:"1px solid rgba(180,83,9,0.2)"}}>{s}</span>
                          ))}
                          {t.specializations.length>2&&<span className="text-xs text-tertiary">+{t.specializations.length-2}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="tb-flex-between text-xs mb-1.5">
                      <span className="text-secondary">Capacity</span>
                      <span className="font-bold" style={{color:loadColor}}>{t.current_work_orders||0} / {t.max_work_orders||5} WOs</span>
                    </div>
                    <div className="tb-progress tb-progress--md">
                      <div className="tb-progress-bar" style={{background:loadColor,width:`${load}%`}}/>
                    </div>
                  </div>

                  <div className="tb-grid-3 mt-3">
                    {[
                      {label:"Total",value:techWOs.length,    color:"text-secondary"},
                      {label:"Done", value:completedWOs.length,color:"text-emerald-400"},
                      {label:"Open", value:openWOs.length,    color:"text-amber-400"},
                    ].map((s,j)=>(
                      <div key={j} className="text-center bg-base-alt rounded-lg py-2">
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

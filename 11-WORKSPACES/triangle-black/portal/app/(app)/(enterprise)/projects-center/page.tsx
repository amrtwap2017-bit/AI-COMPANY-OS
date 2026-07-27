"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  active:"#34D399", planning:"#60A5FA", completed:"#94A3B8", on_hold:"#FBBF24", cancelled:"#F87171"
};

export default function ProjectsCenterPage() {
  const router = useRouter();
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("all");

  const { data: raw, isLoading } = useQuery(["proj-list"], () => authFetch("/api/v1/projects/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["proj-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));

  const projects = toArr(raw);
  const wos      = toArr(woRaw);

  const active    = projects.filter(p=>p.status==="active");
  const planning  = projects.filter(p=>p.status==="planning");
  const completed = projects.filter(p=>p.status==="completed");
  const totalBudget  = projects.reduce((s,p)=>s+Number(p.budget||0),0);
  const avgCompletion= projects.length>0?Math.round(projects.reduce((s,p)=>s+Number(p.completion_pct||0),0)/projects.length):0;

  const filtered = projects.filter(p => {
    const ms = !search||p.title?.toLowerCase().includes(search.toLowerCase())||p.name?.toLowerCase().includes(search.toLowerCase());
    return ms && (statusF==="all"||p.status===statusF);
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1228 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-indigo-400 mb-1.5">Projects</div>
              <h1 className="tb-hero-title">Project Portfolio</h1>
              <p className="tb-hero-description">{projects.length} projects · {active.length} active · {fmtEGP(totalBudget)} total budget</p>
            </div>
            <div className={`tb-score-badge ${avgCompletion>=70?"tb-score-badge--success":"tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:avgCompletion>=70?"#34D399":"#FBBF24"}}>{avgCompletion}%</div>
              <div className="tb-score-label">Avg Completion</div>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Active",     value:active.length,    color:"#34D399", f:"active"},
              {label:"Planning",   value:planning.length,  color:"#60A5FA", f:"planning"},
              {label:"Completed",  value:completed.length, color:"#94A3B8", f:"completed"},
              {label:"Total Budget",value:fmtEGP(totalBudget), color:"#A78BFA", f:"all"},
            ].map((k,i)=>{
              const active_f=statusF===k.f;
              return (
                <button key={i} onClick={()=>setStatusF(active_f&&i<3?"all":k.f)}
                  className="tb-hero-kpi"
                  style={{background:active_f?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${active_f?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:i===3?"1rem":"1.375rem"}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Search */}
        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <div className="tb-flex-gap-2">
            {["all","active","planning","completed"].map(s=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-pill ${statusF===s?"tb-pill--active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-xs text-tertiary ml-auto">{filtered.length} projects</span>
              <ExportButton data={toArr(raw)} filename="projects" title="Projects"/>
        </div>

        {/* Project cards */}
        {filtered.length === 0 ? (
          <div className="tb-section">
            <div className="tb-empty">
              <div className="tb-empty-icon">🏗️</div>
              <div className="tb-empty-title">No projects found</div>
            </div>
          </div>
        ) : (
          <div className="tb-grid-3">
            {filtered.map((p,i)=>{
              const pct     = Number(p.completion_pct||0);
              const budget  = Number(p.budget||0);
              const sc      = STATUS_COLOR[p.status]||"#94A3B8";
              const projWOs = wos.filter(w=>w.contract_id===p.id||w.project_id===p.id);
              const now     = new Date();
              const daysLeft= p.end_date?Math.ceil((new Date(p.end_date)-Date.now())/86400000):null;
              const isOv    = daysLeft!==null&&daysLeft<0&&p.status!=="completed";
              const barColor= pct>=80?"#34D399":pct>=50?"#60A5FA":"#FBBF24";

              return (
                <button key={i} onClick={()=>router.push(`/projects-center/${p.id}`)}
                  className="tb-section text-left hover:border-brand transition-colors group">
                  <div className="tb-flex-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-sm font-bold text-primary group-hover:text-brand truncate">{p.title||p.name||p.id}</div>
                      <div className="text-xs text-tertiary mt-1 line-clamp-1">{p.description||"—"}</div>
                    </div>
                    <span className="tb-badge flex-shrink-0" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{p.status||"—"}</span>
                  </div>

                  {/* Completion */}
                  <div className="mb-4">
                    <div className="tb-flex-between text-xs mb-1.5">
                      <span className="text-secondary">Completion</span>
                      <span className="font-bold" style={{color:barColor}}>{pct}%</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:barColor,width:`${Math.min(pct,100)}%`}}/></div>
                  </div>

                  {/* Metrics */}
                  <div className="tb-grid-3 mb-4">
                    <div className="text-center bg-base-alt rounded-lg p-2">
                      <div className="text-xs font-black text-purple-400">{fmtEGP(budget)}</div>
                      <div className="text-xs text-tertiary mt-0.5">Budget</div>
                    </div>
                    <div className="text-center bg-base-alt rounded-lg p-2">
                      <div className="text-xs font-black text-blue-400">{projWOs.length}</div>
                      <div className="text-xs text-tertiary mt-0.5">Work Orders</div>
                    </div>
                    <div className="text-center bg-base-alt rounded-lg p-2">
                      <div className={`text-xs font-black ${isOv?"text-red-400":daysLeft!==null&&daysLeft<=30?"text-amber-400":"text-emerald-400"}`}>
                        {daysLeft!==null?(isOv?`${Math.abs(daysLeft)}d over`:`${daysLeft}d`):"—"}
                      </div>
                      <div className="text-xs text-tertiary mt-0.5">{isOv?"Overdue":"Remaining"}</div>
                    </div>
                  </div>

                  <div className="tb-flex-between text-xs text-tertiary">
                    <span>Start: {fmtDate(p.start_date)}</span>
                    <span className={isOv?"text-red-400 font-semibold":""}>End: {fmtDate(p.end_date)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-nav */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Project Views</div>
          <div className="tb-grid-4">
            {[{label:"List View",icon:"📋",path:"/projects-center/list"},{label:"Timeline",icon:"📅",path:"/projects-center/timeline"},{label:"Actions",icon:"⚡",path:"/projects-center/actions"},{label:"Review",icon:"📊",path:"/projects-center/review"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

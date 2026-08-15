"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate= (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();

const SC = {active:"#547C4D",planning:"#5B7C8C",completed:"#8D7443",on_hold:"#B07A2A",cancelled:"#A84A3D"};

export default function ProjectTimelinePage() {
  const router   = useRouter();
  const { data: raw } = useQuery(["proj-timeline"],()=>authFetch("/api/v1/projects/").then(r=>r.json()),{staleTime:30000});
  const projects = toArr(raw);

  const byStatus = Object.entries(
    projects.reduce((acc,p)=>{acc[p.status||"unknown"]=(acc[p.status||"unknown"]||0)+1;return acc;},{})
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Projects</div>
              <h1 className="tb-hero-title">Project Timeline</h1>
              <p className="tb-hero-description">{projects.length} projects · Visual timeline view</p>
            </div>
            <button onClick={()=>router.push("/projects-center")} className="tb-btn tb-btn-secondary">← Projects</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Total",     value:projects.length},
              {label:"Active",    value:projects.filter(p=>p.status==="active").length,    good:true},
              {label:"Completed", value:projects.filter(p=>p.status==="completed").length, good:true},
              {label:"On Hold",   value:projects.filter(p=>p.status==="on_hold").length,   warn:true},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.good?"var(--color-success)":k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Project Timeline — {projects.length} Projects</div>
          {projects.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📅</div>
              <div className="tb-empty-title">No projects found</div>
              <div className="tb-empty-desc">Projects will appear here once created</div>
            </div>
          ) : projects.map((p,i)=>{
            const sc  = SC[p.status]||"#6D5F53";
            const pct = Number(p.completion_pct||p.progress||0);
            return (
              <button key={i} onClick={()=>router.push("/projects-center/"+p.id)}
                className="flex items-center gap-4 py-4 border-b border-divider w-full text-left bg-transparent border-0 cursor-pointer tb-hover-lift">
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{background:sc}}/>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{p.title||p.name||"Project"}</div>
                  <div className="text-xs text-tertiary mt-0.5">{fmtDate(p.start_date)} — {fmtDate(p.end_date)} · {fmtEGP(p.budget||p.total_budget||0)}</div>
                </div>
                <div className="flex-shrink-0" style={{width:"120px"}}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-tertiary">{pct}%</span>
                    <span className="tb-badge" style={{background:`${sc}18`,color:sc,fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase"}}>
                      {(p.status||"").replace(/_/g," ")}
                    </span>
                  </div>
                  <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:sc}}/>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { FeatureGate } from "@/components/ui/FeatureGate";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

function ProjectsCenterPageInner() {
  const router = useRouter();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProj, setNewProj] = useState({title:"",description:"",status:"planning",budget:0});
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const qc = useQueryClient();

  const createProj = useMutation(
    (payload)=>authFetch("/api/v1/projects/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r => r.data ?? r),
    {onSuccess:(d)=>{if(d.id){toast.success("Project created");setShowNewProject(false);qc.invalidateQueries(["projects-list"]);}else{toast.error("Failed");}},onError:()=>toast.error("Error")}
  );

  const { data: raw, isLoading } = useQuery(["proj-list"],()=>authFetch("/api/v1/projects/").then(r => r.data ?? r));
  const { data: woRaw } = useQuery(["proj-wos"],()=>authFetch("/api/v1/work-orders/").then(r => r.data ?? r));
  const projects = toArr(raw);
  const wos = toArr(woRaw);

  const active = projects.filter((p: any) =>p.status==="active");
  const planning = projects.filter((p: any) =>p.status==="planning");
  const completed = projects.filter((p: any) =>p.status==="completed");
  const totalBudget = projects.reduce((s: any, p: any) =>s+Number(p.budget||0),0);
  const avgCompletion = projects.length>0?Math.round(projects.reduce((s: any, p: any) =>s+Number(p.completion_pct||0),0)/projects.length):0;

  const filtered = projects.filter((p: any) =>{
    const ms = !search||p.title?.toLowerCase().includes(search.toLowerCase())||p.name?.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusF==="all"||p.status===statusF);
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section tb-shimmer-block" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Projects</div>
              <h1 className="tb-hero-title">Project Portfolio</h1>
              <p className="tb-hero-description">{projects.length} projects · {active.length} active · {fmtEGP(totalBudget)} total budget</p>
            </div>
            <div className="tb-section text-center flex-shrink-0" style={{minWidth:"80px"}}>
              <div className={`text-2xl font-black ${avgCompletion>=70?"text-success":"text-warning"}`}>{avgCompletion}%</div>
              <div className="text-xs text-tertiary mt-0.5">Avg Completion</div>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Active",value:active.length,f:"active"},{label:"Planning",value:planning.length,f:"planning"},{label:"Completed",value:completed.length,f:"completed"},{label:"Total Budget",value:fmtEGP(totalBudget),f:"all"}].map((k: any, i: number) =>(
              <button key={i} onClick={()=>setStatusF(statusF===k.f&&i<3?"all":k.f)} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{fontSize:i===3?"1rem":"1.375rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-3 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search projects..." className="tb-input" style={{maxWidth:"320px"}} />
          <div className="tb-tabs border-0 mb-0">
            {["all","active","planning","completed"].map((s: any) =>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-tab ${statusF===s?"active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-xs text-tertiary ml-auto">{filtered.length} projects</span>
          <ExportButton data={toArr(raw)} filename="projects" title="Projects"/>
          <button onClick={()=>setShowNewProject(true)} className="tb-btn tb-btn-primary">+ New Project</button>
        </div>

        {filtered.length===0 ? (
          <div className="tb-section"><div className="tb-empty"><div className="tb-empty-icon">🏗️</div><div className="tb-empty-title">No projects found</div></div></div>
        ) : (
          <div className="tb-grid-3">
            {filtered.map((p: any, i: number) =>{
              const pct = Number(p.completion_pct||0);
              const budget = Number(p.budget||0);
              const projWOs = wos.filter((w: any) =>w.contract_id===p.id||w.project_id===p.id);
              const daysLeft = p.end_date?Math.ceil((new Date(p.end_date)-Date.now())/86400000):null;
              const isOv = daysLeft!==null&&daysLeft<0&&p.status!=="completed";
              const barColor = pct>=80?"var(--color-success)":pct>=50?"var(--color-info)":"var(--color-warning)";
              return (
                <button key={i} onClick={()=>router.push(`/projects-center/${p.id}`)}
                  className="tb-section text-left tb-hover-lift cursor-pointer">
                  <div className="flex justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-sm font-bold text-primary truncate">{p.title||p.name||p.id}</div>
                      <div className="text-xs text-tertiary mt-0.5 truncate">{p.description||"—"}</div>
                    </div>
                    <span className={`tb-badge flex-shrink-0 ${p.status==="active"?"tb-badge-success":p.status==="completed"?"tb-badge-neutral":p.status==="on_hold"?"tb-badge-warning":"tb-badge-info"}`}>{p.status||"—"}</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-secondary">Completion</span>
                      <span className="font-bold" style={{color:barColor}}>{pct}%</span>
                    </div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:barColor,width:`${Math.min(pct,100)}%`}}/></div>
                  </div>
                  <div className="tb-grid-3 mb-4">
                    <div className="text-center bg-surface-alt rounded-lg p-2">
                      <div className="text-xs font-black text-brand">{fmtEGP(budget)}</div>
                      <div className="text-xs text-tertiary mt-0.5">Budget</div>
                    </div>
                    <div className="text-center bg-surface-alt rounded-lg p-2">
                      <div className="text-xs font-black text-info">{projWOs.length}</div>
                      <div className="text-xs text-tertiary mt-0.5">Work Orders</div>
                    </div>
                    <div className="text-center bg-surface-alt rounded-lg p-2">
                      <div className={`text-xs font-black ${isOv?"text-danger":daysLeft!==null&&daysLeft<=30?"text-warning":"text-success"}`}>
                        {daysLeft!==null?(isOv?`${Math.abs(daysLeft)}d over`:`${daysLeft}d`):"—"}
                      </div>
                      <div className="text-xs text-tertiary mt-0.5">{isOv?"Overdue":"Remaining"}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-tertiary">
                    <span>Start: {fmtDate(p.start_date)}</span>
                    <span className={isOv?"text-danger font-semibold":""}>End: {fmtDate(p.end_date)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="tb-section">
          <div className="tb-section-title">Project Views</div>
          <div className="tb-grid-4">
            {[{label:"List View",icon:"📋",path:"/projects-center/list"},{label:"Timeline",icon:"📅",path:"/projects-center/timeline"},{label:"Actions",icon:"⚡",path:"/projects-center/actions"},{label:"Review",icon:"📊",path:"/projects-center/review"}].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showNewProject && (
        <div onClick={()=>setShowNewProject(false)} className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-5" style={{backdropFilter:"blur(4px)"}}>
          <div onClick={(e: any) =>e.stopPropagation()} className="tb-section w-full shadow-xl" style={{maxWidth:"500px"}}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-primary">New Project</h2>
              <button onClick={()=>setShowNewProject(false)} className="tb-btn-ghost text-xl px-2">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="tb-form-group">
                <label className="tb-label">Title <span className="text-danger">*</span></label>
                <input value={newProj.title} onChange={(e: any) =>setNewProj({...newProj,title:e.target.value})} placeholder="Project name" className="tb-input" />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Description</label>
                <textarea value={newProj.description} onChange={(e: any) =>setNewProj({...newProj,description:e.target.value})} rows={2} placeholder="Project details" className="tb-input" style={{resize:"none"}} />
              </div>
              <div className="tb-form-grid">
                <div className="tb-form-group">
                  <label className="tb-label">Status</label>
                  <select value={newProj.status} onChange={(e: any) =>setNewProj({...newProj,status:e.target.value})} className="tb-select">
                    {["planning","active","on_hold"].map((s: any) =><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="tb-form-group">
                  <label className="tb-label">Budget (EGP)</label>
                  <input type="number" value={newProj.budget} onChange={(e: any) =>setNewProj({...newProj,budget:Number(e.target.value)})} className="tb-input" />
                </div>
              </div>
              <div className="tb-action-bar mt-1">
                <button onClick={()=>{if(!newProj.title.trim()){toast.error("Title required");return;}createProj.mutate({...newProj,hotel_id:"tb-default-hotel-000000000001",completion_pct:0});}} disabled={createProj.isLoading} className="tb-btn tb-btn-primary flex-1 justify-center">
                  {createProj.isLoading?"Creating...":"Create Project"}
                </button>
                <button onClick={()=>setShowNewProject(false)} className="tb-btn tb-btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function ProjectsCenterPage(props: any) {
  return (
    <FeatureGate feature="projects">
      <ProjectsCenterPageInner {...props} />
    </FeatureGate>
  );
}

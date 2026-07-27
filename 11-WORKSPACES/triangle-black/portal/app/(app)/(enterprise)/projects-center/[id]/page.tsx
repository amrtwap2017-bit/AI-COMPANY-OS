"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const S = {active:"bg-blue-100 text-blue-800",planning:"bg-amber-100 text-amber-800",on_hold:"bg-slate-100 text-slate-600",completed:"bg-emerald-100 text-emerald-800",cancelled:"bg-red-100 text-red-700"};
const STATUSES = ["active","planning","on_hold","completed","cancelled"];

export default function ProjectDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: project, isLoading, refetch } = useQuery(
    ["project-detail", id],
    () => authFetch(`/api/v1/projects/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.budget)   payload.budget   = Number(payload.budget);
      if (payload.spent)    payload.spent    = Number(payload.spent);
      const r = await authFetch(`/api/v1/projects/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (r.ok) { setEditing(false); refetch(); }
      else { const err = await r.json().catch(()=>{}); alert(err?.detail||"Failed to update"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  async function updateStatus(status) {
    setSaving(true);
    try {
      const r = await authFetch(`/api/v1/projects/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!project || project.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Project not found</p>
        <Link href="/projects-center" className="text-blue-600 underline text-sm">Back to Projects</Link>
      </div>
    </PageWrapper>
  );

  const title      = project.name || project.title || "Project";
  const budget     = project.budget || 0;
  const spent      = project.spent  || project.actual_cost || 0;
  const progress   = project.progress_pct || project.completion_percentage || 0;
  const budgetUsed = budget > 0 ? Math.min(100, (spent/budget)*100) : 0;

  return (
    <PageWrapper>
      <PageHeader
        title={title}
        subtitle={project.site_name ? `${project.site_name} · ${project.status||""}` : project.status||""}
        breadcrumbs={[{label:"Projects Center",href:"/projects-center"},{label:title?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...project,budget:project.budget||"",spent:project.spent||""});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[project.status]||"bg-slate-100 text-slate-600")}>{project.status?.replace(/_/g," ")||"—"}</span>
          <div className="flex-1" />
          {STATUSES.filter(s=>s!==project.status).slice(0,3).map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50">
              {s.replace(/_/g," ")}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Project Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Project Name *</label>
                  <input required value={form?.name||form?.title||""} onChange={e=>setForm({...form,name:e.target.value,title:e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea value={form?.description||""} onChange={e=>setForm({...form,description:e.target.value})}
                    rows={4} className={inp+" resize-none"} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={form?.status||"planning"} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                      {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Budget (EGP)</label>
                    <input type="number" value={form?.budget||""} onChange={e=>setForm({...form,budget:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                    <input type="date" value={form?.start_date?.slice(0,10)||""} onChange={e=>setForm({...form,start_date:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                    <input type="date" value={form?.end_date?.slice(0,10)||""} onChange={e=>setForm({...form,end_date:e.target.value})} className={inp} />
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {project.description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-slate-700 text-sm">{project.description}</p>
                  </div>
                )}
                {progress > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700">Progress</span>
                      <span className="font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${progress>=100?"bg-emerald-500":progress>=60?"bg-blue-500":"bg-amber-500"}`}
                        style={{width:`${Math.min(100,progress)}%`}} />
                    </div>
                  </div>
                )}
                {budget > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700">Budget Used</span>
                      <span className={`font-bold ${budgetUsed>90?"text-red-600":budgetUsed>70?"text-amber-600":"text-slate-700"}`}>{Math.round(budgetUsed)}% of EGP {fmtNum(budget)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${budgetUsed>90?"bg-red-500":budgetUsed>70?"bg-amber-500":"bg-emerald-500"}`}
                        style={{width:`${Math.min(100,budgetUsed)}%`}} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Budget">
            <div className="space-y-3">
              <div className="text-center py-2 bg-slate-50 rounded-xl">
                <div className="text-2xl font-black text-slate-800">EGP {fmtNum(budget)}</div>
                <p className="text-xs text-slate-500">Total Budget</p>
              </div>
              {spent > 0 && (
                <>
                  <div className="flex justify-between text-xs px-1">
                    <span className="text-slate-500">Spent</span>
                    <span className="font-semibold text-slate-700">EGP {fmtNum(spent)}</span>
                  </div>
                  <div className="flex justify-between text-xs px-1">
                    <span className="text-slate-500">Remaining</span>
                    <span className={`font-semibold ${budget-spent<0?"text-red-600":"text-emerald-600"}`}>EGP {fmtNum(Math.max(0,budget-spent))}</span>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Timeline">
            <dl className="space-y-3">
              {[
                {label:"Status",  value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[project.status]||"bg-slate-100 text-slate-600")}>{project.status?.replace(/_/g," ")||"—"}</span>},
                {label:"Start",   value:fmtDate(project.start_date)},
                {label:"End",     value:fmtDate(project.end_date)},
                {label:"Manager", value:project.manager||project.project_manager||"—"},
                {label:"Site",    value:project.site_name||"—"},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xs text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <Link href="/projects-center" className="block w-full px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">Back to Projects</Link>
        </div>
      </div>
    </PageWrapper>
  );
}

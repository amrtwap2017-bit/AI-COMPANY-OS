"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KpiCard } from "@/components/ui/KpiCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { DataTable } from "@/components/ui/DataTable";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleString("en-GB",{dateStyle:"short",timeStyle:"short"}); } catch { return "—"; } };
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

const WORK_TYPES = [{v:"on_site",label:"On Site",icon:"🔧"},{v:"travel",label:"Travel",icon:"🚗"},{v:"remote",label:"Remote",icon:"💻"},{v:"inspection",label:"Inspection",icon:"🔍"},{v:"admin",label:"Admin",icon:"📋"}];

export default function TimeTrackingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("log");
  const [form, setForm] = useState({work_order_id:"",technician_id:"",work_type:"on_site",start_time:"",end_time:"",hours_logged:"",hourly_rate:150,notes:"",is_billable:true});
  const [filterTech, setFilterTech] = useState("");

  const { data: summary } = useQuery(["time-summary"],()=>authFetch("/api/v1/time-entries/summary").then(r => (r as any).data ?? r),{staleTime:30000});
  const { data: entriesRaw, isLoading } = useQuery(["time-entries",filterTech],()=>authFetch(`/api/v1/time-entries/?${filterTech?"technician_id="+filterTech+"&":""}limit=50`).then(r => (r as any).data ?? r),{staleTime:30000});
  const { data: techsRaw } = useQuery(["techs-tt"],()=>authFetch("/api/v1/technicians/").then(r => (r as any).data ?? r),{staleTime:60000});
  const { data: wosRaw } = useQuery(["wos-tt"],()=>authFetch("/api/v1/work-orders/?limit=50").then(r => (r as any).data ?? r),{staleTime:60000});

  const entries = toArr(entriesRaw);
  const techs = toArr(techsRaw);
  const wos = toArr(wosRaw);

  const logMut = useMutation(
    (payload)=>authFetch("/api/v1/time-entries/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r => (r as any).data ?? r),
    {onSuccess:(data)=>{if(!data.error){toast.success(`${data.hours_logged}h logged — ${fmtEGP(data.labor_cost)}`);qc.invalidateQueries(["time-entries"]);qc.invalidateQueries(["time-summary"]);setForm({work_order_id:"",technician_id:"",work_type:"on_site",start_time:"",end_time:"",hours_logged:"",hourly_rate:150,notes:"",is_billable:true});}else{toast.error(data.error);}},onError:()=>toast.error("Failed to log time")}
  );

  const totals = summary?.totals||{};
  const byTech = summary?.by_technician||[];
  const byWO = summary?.top_work_orders||[];
  const byType = summary?.by_work_type||[];
  const estHours = Number(form.hours_logged||0);
  const estCost = estHours*Number(form.hourly_rate||0);

  const entriesColumns = [
    {key:"work_type",label:"Type",render:(row)=>{const wt=WORK_TYPES.find((t: any) =>t.v===row.work_type);return<span>{wt?.icon||"🔧"} {wt?.label||row.work_type}</span>;}},
    {key:"wo_title",label:"Work Order",render:(row)=><span className="font-medium text-primary text-sm">{row.wo_title||"—"}</span>},
    {key:"technician_name",label:"Technician",render:(row)=><span className="text-secondary text-sm">{row.technician_name||"—"}</span>},
    {key:"start_time",label:"Date",render:(row)=><span className="text-xs text-tertiary">{fmtDate(row.start_time)}</span>},
    {key:"hours_logged",label:"Hours",align:"right",render:(row)=><span className="font-bold">{Number(row.hours_logged||0).toFixed(1)}h</span>},
    {key:"labor_cost",label:"Cost",align:"right",render:(row)=><span className="font-bold text-success">{fmtEGP(row.labor_cost||0)}</span>},
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex justify-between items-start gap-4 flex-wrap mb-6">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations</div>
              <h1 className="tb-hero-title">Time Tracking</h1>
              <p className="tb-hero-description">Log hours · Track labor costs · Utilization reports</p>
            </div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn tb-btn-secondary tb-btn-sm">Work Orders →</button>
          </div>
          <div className="tb-hero-kpis">
            <KpiCard label="Total Hours" value={`${Number(totals.total_hours||0).toFixed(1)}h`} color="blue" icon="⏱️" />
            <KpiCard label="Labor Cost" value={fmtEGP(totals.total_labor_cost||0)} color="emerald" icon="💰" />
            <KpiCard label="Time Entries" value={totals.total_entries||0} color="amber" icon="📋" />
            <KpiCard label="Avg Per Entry" value={`${Number(totals.avg_hours_per_entry||0).toFixed(1)}h`} color="slate" icon="📊" />
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs mb-4">
          {[{key:"log",label:"⏱ Log Time"},{key:"entries",label:"📋 All Entries"},{key:"summary",label:"📊 Summary"},{key:"utilization",label:"👷 Utilization"}].map((tab: any) =>(
            <button key={tab.key} onClick={()=>setActiveTab(tab.key)} className={`tb-tab ${activeTab===tab.key?"active":""}`}>{tab.label}</button>
          ))}
        </div>

        {activeTab==="log" && (
          <SectionCard title="Log Time Entry">
            <div className="tb-form-grid">
              <div className="tb-form-group">
                <label className="tb-label">Work Order <span className="text-danger">*</span></label>
                <select className="tb-select" value={form.work_order_id} onChange={(e: any) =>setForm({...form,work_order_id:e.target.value})}>
                  <option value="">Select work order…</option>
                  {wos.map((wo: any) =><option key={wo.id} value={wo.id}>{wo.title?.slice(0,40)} ({wo.priority})</option>)}
                </select>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Technician <span className="text-danger">*</span></label>
                <select className="tb-select" value={form.technician_id} onChange={(e: any) =>setForm({...form,technician_id:e.target.value})}>
                  <option value="">Select technician…</option>
                  {techs.map((t: any) =><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Work Type</label>
                <select className="tb-select" value={form.work_type} onChange={(e: any) =>setForm({...form,work_type:e.target.value})}>
                  {WORK_TYPES.map((wt: any) =><option key={wt.v} value={wt.v}>{wt.icon} {wt.label}</option>)}
                </select>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Hourly Rate (EGP)</label>
                <input type="number" className="tb-input" value={form.hourly_rate} onChange={(e: any) =>setForm({...form,hourly_rate:Number(e.target.value)})} min="0" />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Start Time</label>
                <input type="datetime-local" className="tb-input" value={form.start_time} onChange={(e: any) =>setForm({...form,start_time:e.target.value})} />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">End Time</label>
                <input type="datetime-local" className="tb-input" value={form.end_time} onChange={(e: any) =>setForm({...form,end_time:e.target.value})} />
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Hours (or auto-calc)</label>
                <input type="number" className="tb-input" placeholder="e.g. 2.5" value={form.hours_logged} onChange={(e: any) =>setForm({...form,hours_logged:e.target.value})} min="0" step="0.25" />
              </div>
              <div className="flex items-center gap-2.5 pt-5">
                <input type="checkbox" id="billable" checked={form.is_billable} onChange={(e: any) =>setForm({...form,is_billable:e.target.checked})} style={{width:16,height:16}} />
                <label htmlFor="billable" className="text-sm text-secondary">Billable to client</label>
              </div>
              <div className="tb-form-group" style={{gridColumn:"1 / -1"}}>
                <label className="tb-label">Notes</label>
                <textarea className="tb-input" style={{height:64,resize:"none"}} value={form.notes} onChange={(e: any) =>setForm({...form,notes:e.target.value})} placeholder="Work performed…" />
              </div>
            </div>
            {estHours>0 && (
              <div className="mt-4 p-4 bg-surface-alt border border-default rounded-lg">
                <div className="text-xs text-tertiary mb-2">Cost Preview</div>
                <div className="flex gap-6">
                  <div><div className="text-lg font-black text-primary">{estHours}h</div><div className="text-xs text-tertiary">Hours</div></div>
                  <div><div className="text-lg font-black text-success">{fmtEGP(estCost)}</div><div className="text-xs text-tertiary">Labor Cost</div></div>
                  <div><div className="text-lg font-black text-secondary">EGP {form.hourly_rate}/h</div><div className="text-xs text-tertiary">Rate</div></div>
                </div>
              </div>
            )}
            <button onClick={()=>logMut.mutate(form)} disabled={!form.work_order_id||!form.technician_id||logMut.isLoading}
              className="tb-btn tb-btn-primary mt-4">
              {logMut.isLoading?"Logging…":"⏱ Log Time Entry"}
            </button>
          </SectionCard>
        )}

        {activeTab==="entries" && (
          <SectionCard title="Time Entries" subtitle={`${entries.length} entries recorded`}
            actions={<select className="tb-select" value={filterTech} onChange={(e: any) =>setFilterTech(e.target.value)} style={{minWidth:160}}><option value="">All Technicians</option>{techs.map((t: any) =><option key={t.id} value={t.id}>{t.name}</option>)}</select>}>
            {isLoading ? <LoadingState type="table" rows={6} /> : entries.length===0 ? (
              <EmptyState icon="⏱️" title="No time entries" description="Log your first time entry above" action={{label:"Log Time",onClick:()=>setActiveTab("log")}} size="sm" />
            ) : <DataTable columns={entriesColumns} data={entries} keyField="id" />}
          </SectionCard>
        )}

        {activeTab==="summary" && (
          <div className="tb-grid-2">
            <SectionCard title="By Work Type">
              {byType.length===0 ? <EmptyState icon="📊" title="No data" size="sm" /> : (
                <div className="flex flex-col gap-2">
                  {byType.map((wt: any, i: any) =>{const type=WORK_TYPES.find((t: any) =>t.v===wt.work_type);return(
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-surface-alt rounded-lg">
                      <span className="text-xl">{type?.icon||"🔧"}</span>
                      <div className="flex-1 text-sm text-primary">{type?.label||wt.work_type}</div>
                      <div className="text-sm font-bold text-primary">{Number(wt.total_hours||0).toFixed(1)}h</div>
                      <div className="text-sm font-bold text-success">{fmtEGP(wt.total_cost||0)}</div>
                    </div>
                  );})}
                </div>
              )}
            </SectionCard>
            <SectionCard title="Top Work Orders">
              {byWO.length===0 ? <EmptyState icon="🔧" title="No data" size="sm" /> : (
                <div className="flex flex-col gap-2">
                  {byWO.map((wo: any, i: any) =>(
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-surface-alt rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{wo.title||"—"}</div>
                        <div className="text-xs text-tertiary">{wo.entries||0} entries</div>
                      </div>
                      <div className="text-sm font-bold text-primary">{Number(wo.total_hours||0).toFixed(1)}h</div>
                      <div className="text-sm font-bold text-success">{fmtEGP(wo.total_cost||0)}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {activeTab==="utilization" && (
          <SectionCard title="Technician Utilization">
            {byTech.filter((t: any) =>t.total_hours>0).length===0 ? <EmptyState icon="👷" title="No time entries yet" size="sm" /> : (
              <div className="flex flex-col gap-3">
                {byTech.filter((t: any) =>t.total_hours>0).map((tech: any, i: any) =>{
                  const maxH = Math.max(...byTech.map((t: any) =>Number(t.total_hours||0)),1);
                  const pct = Math.min(100,(Number(tech.total_hours||0)/maxH)*100);
                  return (
                    <div key={i} className="p-4 bg-surface-alt border border-default rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="text-sm font-bold text-primary">{tech.name}</div>
                          <div className="text-xs text-tertiary">{tech.entries||0} entries · {fmtEGP(tech.total_cost||0)} labor cost</div>
                        </div>
                        <div className="text-lg font-black text-primary">{Number(tech.total_hours||0).toFixed(1)}h</div>
                      </div>
                      <div className="tb-progress">
                        <div className="tb-progress-bar" style={{background:"var(--color-info)",width:`${pct}%`}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

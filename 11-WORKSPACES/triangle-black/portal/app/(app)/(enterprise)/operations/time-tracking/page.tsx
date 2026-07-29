"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleString("en-GB",{dateStyle:"short",timeStyle:"short"}); }
  catch { return "—"; }
};
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

const WORK_TYPES = [
  {v:"on_site",label:"On Site",icon:"🔧"},
  {v:"travel",label:"Travel",icon:"🚗"},
  {v:"remote",label:"Remote",icon:"💻"},
  {v:"inspection",label:"Inspection",icon:"🔍"},
  {v:"admin",label:"Admin",icon:"📋"},
];

export default function TimeTrackingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("log");
  const [form, setForm] = useState({
    work_order_id:"", technician_id:"", work_type:"on_site",
    start_time:"", end_time:"", hours_logged:"", hourly_rate:150,
    notes:"", is_billable:true
  });
  const [filterTech, setFilterTech] = useState("");

  const { data: summary } = useQuery(
    ["time-summary"],
    () => authFetch("/api/v1/time-entries/summary").then(r=>r.json()),
    { staleTime: 30000 }
  );

  const { data: entriesRaw, isLoading } = useQuery(
    ["time-entries", filterTech],
    () => authFetch(`/api/v1/time-entries/?${filterTech?"technician_id="+filterTech+"&":""}limit=50`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const entries = toArr(entriesRaw);

  const { data: techsRaw } = useQuery(
    ["techs-tt"],
    () => authFetch("/api/v1/technicians/").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const techs = toArr(techsRaw);

  const { data: wosRaw } = useQuery(
    ["wos-tt"],
    () => authFetch("/api/v1/work-orders/?limit=50").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const wos = toArr(wosRaw);

  const logMut = useMutation(
    (payload) => authFetch("/api/v1/time-entries/", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    }).then(r=>r.json()),
    { onSuccess: (data) => {
        if (!data.error) {
          qc.invalidateQueries(["time-entries"]);
          qc.invalidateQueries(["time-summary"]);
          setForm({work_order_id:"",technician_id:"",work_type:"on_site",start_time:"",end_time:"",hours_logged:"",hourly_rate:150,notes:"",is_billable:true});
        }
      }
    }
  );

  const totals = summary?.totals || {};
  const byTech = summary?.by_technician || [];
  const byWO = summary?.top_work_orders || [];
  const byType = summary?.by_work_type || [];

  const estHours = Number(form.hours_logged || 0);
  const estCost = estHours * Number(form.hourly_rate || 0);

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
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A2A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-blue-400 mb-1">Operations</div>
              <h1 className="tb-hero-title">Time Tracking</h1>
              <p className="tb-hero-description">Log hours · Track labor costs · Utilization reports</p>
            </div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
              Work Orders →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total Hours",value:`${Number(totals.total_hours||0).toFixed(1)}h`,color:"#60A5FA"},
              {label:"Labor Cost",value:fmtEGP(totals.total_labor_cost||0),color:"#34D399"},
              {label:"Time Entries",value:totals.total_entries||0,color:"#A78BFA"},
              {label:"Avg Per Entry",value:`${Number(totals.avg_hours_per_entry||0).toFixed(1)}h`,color:"#FBBF24"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-2 mb-4">
          {["log","entries","summary","utilization"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="log"?"⏱ Log Time":tab==="entries"?"📋 All Entries":tab==="summary"?"📊 Summary":"👷 Utilization"}
            </button>
          ))}
        </div>

        {activeTab === "log" && (
          <div className="tb-section space-y-4">
            <div className="tb-section-title">Log Time Entry</div>
            {logMut.data?.error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{logMut.data.error}</div>}
            {logMut.data?.status==="logged" && <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm">✅ {logMut.data.hours_logged}h logged — Labor cost: {fmtEGP(logMut.data.labor_cost)}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-tertiary block mb-1">Work Order *</label>
                <select className="tb-input w-full" value={form.work_order_id} onChange={e=>setForm({...form,work_order_id:e.target.value})}>
                  <option value="">Select work order…</option>
                  {wos.map(wo=><option key={wo.id} value={wo.id}>{wo.title?.slice(0,40)} ({wo.priority})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Technician *</label>
                <select className="tb-input w-full" value={form.technician_id} onChange={e=>setForm({...form,technician_id:e.target.value})}>
                  <option value="">Select technician…</option>
                  {techs.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Work Type</label>
                <select className="tb-input w-full" value={form.work_type} onChange={e=>setForm({...form,work_type:e.target.value})}>
                  {WORK_TYPES.map(wt=><option key={wt.v} value={wt.v}>{wt.icon} {wt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Hourly Rate (EGP)</label>
                <input type="number" className="tb-input w-full" value={form.hourly_rate} onChange={e=>setForm({...form,hourly_rate:Number(e.target.value)})} min="0"/>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Start Time</label>
                <input type="datetime-local" className="tb-input w-full" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})}/>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">End Time</label>
                <input type="datetime-local" className="tb-input w-full" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})}/>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Hours (or auto-calc from times)</label>
                <input type="number" className="tb-input w-full" placeholder="e.g. 2.5" value={form.hours_logged} onChange={e=>setForm({...form,hours_logged:e.target.value})} min="0" step="0.25"/>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <input type="checkbox" id="billable" checked={form.is_billable} onChange={e=>setForm({...form,is_billable:e.target.checked})} className="w-4 h-4"/>
                <label htmlFor="billable" className="text-sm text-secondary">Billable to client</label>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-tertiary block mb-1">Notes</label>
                <textarea className="tb-input w-full h-16 resize-none" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Work performed…"/>
              </div>
            </div>
            {/* Cost Preview */}
            {estHours > 0 && (
              <div className="p-4 rounded-xl bg-base-alt border border-border">
                <div className="text-xs text-tertiary mb-2">Cost Preview</div>
                <div className="flex gap-6">
                  <div><div className="text-lg font-black text-primary">{estHours}h</div><div className="text-xs text-tertiary">Hours</div></div>
                  <div><div className="text-lg font-black text-emerald-400">{fmtEGP(estCost)}</div><div className="text-xs text-tertiary">Labor Cost</div></div>
                  <div><div className="text-lg font-black text-secondary">EGP {form.hourly_rate}/h</div><div className="text-xs text-tertiary">Rate</div></div>
                </div>
              </div>
            )}
            <button
              onClick={()=>logMut.mutate(form)}
              disabled={!form.work_order_id||!form.technician_id||logMut.isLoading}
              className="tb-btn-primary">
              {logMut.isLoading?"Logging…":"⏱ Log Time Entry"}
            </button>
          </div>
        )}

        {activeTab === "entries" && (
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Time Entries ({entries.length})</div>
              <select className="tb-input" value={filterTech} onChange={e=>setFilterTech(e.target.value)} style={{minWidth:"160px"}}>
                <option value="">All Technicians</option>
                {techs.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {isLoading ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}</div>
            : entries.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">⏱</div><div className="tb-empty-title">No time entries</div></div>
            : (
              <div className="space-y-2">
                {entries.map((entry,i)=>{
                  const wt = WORK_TYPES.find(t=>t.v===entry.work_type);
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-base-alt border border-border">
                      <span className="text-lg flex-shrink-0">{wt?.icon||"🔧"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{entry.wo_title||"—"}</div>
                        <div className="text-xs text-tertiary">{entry.technician_name||"—"} · {wt?.label||entry.work_type} · {fmtDate(entry.start_time)}</div>
                        {entry.notes && <div className="text-xs text-tertiary italic mt-0.5">{entry.notes.slice(0,60)}</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-primary">{Number(entry.hours_logged||0).toFixed(1)}h</div>
                        <div className="text-xs font-bold text-emerald-400">{fmtEGP(entry.labor_cost||0)}</div>
                        {!entry.is_billable && <div className="text-xs text-tertiary">non-billable</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">By Work Type</div>
              <div className="space-y-2 mt-3">
                {byType.map((wt,i)=>{
                  const type = WORK_TYPES.find(t=>t.v===wt.work_type);
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-base-alt">
                      <span className="text-lg">{type?.icon||"🔧"}</span>
                      <div className="flex-1"><div className="text-sm text-primary">{type?.label||wt.work_type}</div></div>
                      <div className="text-sm font-bold text-primary">{Number(wt.total_hours||0).toFixed(1)}h</div>
                      <div className="text-sm font-bold text-emerald-400">{fmtEGP(wt.total_cost||0)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="tb-section">
              <div className="tb-section-title">Top Work Orders by Hours</div>
              <div className="space-y-2 mt-3">
                {byWO.map((wo,i)=>(
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-base-alt">
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-primary truncate">{wo.title||"—"}</div><div className="text-xs text-tertiary">{wo.entries||0} entries</div></div>
                    <div className="text-sm font-bold text-primary">{Number(wo.total_hours||0).toFixed(1)}h</div>
                    <div className="text-sm font-bold text-emerald-400">{fmtEGP(wo.total_cost||0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "utilization" && (
          <div className="tb-section">
            <div className="tb-section-title">Technician Utilization</div>
            <div className="space-y-3 mt-3">
              {byTech.filter(t=>t.total_hours>0).map((tech,i)=>{
                const maxHours = Math.max(...byTech.map(t=>Number(t.total_hours||0)), 1);
                const pct = Math.min(100, (Number(tech.total_hours||0)/maxHours)*100);
                return (
                  <div key={i} className="p-4 rounded-xl bg-base-alt border border-border">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <div className="text-sm font-bold text-primary">{tech.name}</div>
                        <div className="text-xs text-tertiary">{tech.entries||0} entries · {fmtEGP(tech.total_cost||0)} labor cost</div>
                      </div>
                      <div className="text-lg font-black text-primary">{Number(tech.total_hours||0).toFixed(1)}h</div>
                    </div>
                    <div className="h-2 rounded-full bg-base-alt overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
              {byTech.filter(t=>t.total_hours>0).length===0 && (
                <div className="tb-empty"><div className="tb-empty-icon">👷</div><div className="tb-empty-title">No time entries yet</div></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

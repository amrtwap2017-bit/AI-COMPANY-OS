"use client";
// @ts-nocheck
// Triangle Black — Time Tracking
// Sprint 302: Component Library Adoption
// Migrated: inline KPIs → KpiCard, inline tables → DataTable, inline empty → EmptyState

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { KpiCard }     from "@/components/ui/KpiCard";
import { EmptyState }  from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { DataTable }   from "@/components/ui/DataTable";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => {
  if (!d) return "—";
  try { const dt = new Date(d); if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—"; return dt.toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" }); }
  catch { return "—"; }
};
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

const WORK_TYPES = [
  { v:"on_site",    label:"On Site",    icon:"🔧" },
  { v:"travel",     label:"Travel",     icon:"🚗" },
  { v:"remote",     label:"Remote",     icon:"💻" },
  { v:"inspection", label:"Inspection", icon:"🔍" },
  { v:"admin",      label:"Admin",      icon:"📋" },
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

  const { data: summary } = useQuery(["time-summary"], () => authFetch("/api/v1/time-entries/summary").then(r => r.json()), { staleTime:30000 });
  const { data: entriesRaw, isLoading } = useQuery(["time-entries", filterTech], () => authFetch(`/api/v1/time-entries/?${filterTech ? "technician_id="+filterTech+"&" : ""}limit=50`).then(r => r.json()), { staleTime:30000 });
  const { data: techsRaw } = useQuery(["techs-tt"], () => authFetch("/api/v1/technicians/").then(r => r.json()), { staleTime:60000 });
  const { data: wosRaw } = useQuery(["wos-tt"], () => authFetch("/api/v1/work-orders/?limit=50").then(r => r.json()), { staleTime:60000 });

  const entries = toArr(entriesRaw);
  const techs = toArr(techsRaw);
  const wos = toArr(wosRaw);

  const logMut = useMutation(
    (payload: any) => authFetch("/api/v1/time-entries/", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }).then(r => r.json()),
    {
      onSuccess: (data) => {
        if (!data.error) {
          toast.success(`${data.hours_logged}h logged — ${fmtEGP(data.labor_cost)}`);
          qc.invalidateQueries(["time-entries"]);
          qc.invalidateQueries(["time-summary"]);
          setForm({ work_order_id:"", technician_id:"", work_type:"on_site", start_time:"", end_time:"", hours_logged:"", hourly_rate:150, notes:"", is_billable:true });
        } else {
          toast.error(data.error);
        }
      },
      onError: () => toast.error("Failed to log time"),
    }
  );

  const totals = summary?.totals || {};
  const byTech = summary?.by_technician || [];
  const byWO   = summary?.top_work_orders || [];
  const byType = summary?.by_work_type || [];
  const estHours = Number(form.hours_logged || 0);
  const estCost  = estHours * Number(form.hourly_rate || 0);

  const entriesColumns = [
    { key:"work_type", label:"Type", render: (row: any) => { const wt = WORK_TYPES.find(t => t.v === row.work_type); return <span>{wt?.icon || "🔧"} {wt?.label || row.work_type}</span>; } },
    { key:"wo_title",  label:"Work Order", render: (row: any) => <span className="font-medium text-primary text-sm">{row.wo_title || "—"}</span> },
    { key:"technician_name", label:"Technician", render: (row: any) => <span className="text-secondary text-sm">{row.technician_name || "—"}</span> },
    { key:"start_time", label:"Date", render: (row: any) => <span className="text-xs text-tertiary">{fmtDate(row.start_time)}</span> },
    { key:"hours_logged", label:"Hours", align:"right" as const, render: (row: any) => <span className="font-bold">{Number(row.hours_logged || 0).toFixed(1)}h</span> },
    { key:"labor_cost", label:"Cost", align:"right" as const, render: (row: any) => <span className="font-bold text-emerald-600">{fmtEGP(row.labor_cost || 0)}</span> },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-6">
            <div>
              <p className="tb-hero-title">Time Tracking</p>
              <p className="tb-hero-description">Log hours · Track labor costs · Utilization reports</p>
            </div>
            <button onClick={() => router.push("/operations/work-orders")} className="tb-btn-secondary" style={{ fontSize:"0.75rem" }}>
              Work Orders →
            </button>
          </div>
          <div className="tb-hero-kpis">
            <KpiCard label="Total Hours"    value={`${Number(totals.total_hours||0).toFixed(1)}h`}          color="blue"    icon="⏱️" />
            <KpiCard label="Labor Cost"     value={fmtEGP(totals.total_labor_cost || 0)}                    color="emerald" icon="💰" />
            <KpiCard label="Time Entries"   value={totals.total_entries || 0}                                color="amber"   icon="📋" />
            <KpiCard label="Avg Per Entry"  value={`${Number(totals.avg_hours_per_entry||0).toFixed(1)}h`}  color="slate"   icon="📊" />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="tb-canvas">
        {/* Tab Nav */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { key:"log",         label:"⏱ Log Time" },
            { key:"entries",     label:"📋 All Entries" },
            { key:"summary",     label:"📊 Summary" },
            { key:"utilization", label:"👷 Utilization" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={"tb-pill " + (activeTab === tab.key ? "tb-pill--active" : "")}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Log Tab */}
        {activeTab === "log" && (
          <SectionCard title="Log Time Entry">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label className="text-xs text-tertiary block mb-1">Work Order *</label>
                <select className="tb-input w-full" value={form.work_order_id} onChange={e => setForm({...form, work_order_id:e.target.value})}>
                  <option value="">Select work order…</option>
                  {wos.map((wo: any) => <option key={wo.id} value={wo.id}>{wo.title?.slice(0,40)} ({wo.priority})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Technician *</label>
                <select className="tb-input w-full" value={form.technician_id} onChange={e => setForm({...form, technician_id:e.target.value})}>
                  <option value="">Select technician…</option>
                  {techs.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Work Type</label>
                <select className="tb-input w-full" value={form.work_type} onChange={e => setForm({...form, work_type:e.target.value})}>
                  {WORK_TYPES.map(wt => <option key={wt.v} value={wt.v}>{wt.icon} {wt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Hourly Rate (EGP)</label>
                <input type="number" className="tb-input w-full" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate:Number(e.target.value)})} min="0"/>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Start Time</label>
                <input type="datetime-local" className="tb-input w-full" value={form.start_time} onChange={e => setForm({...form, start_time:e.target.value})}/>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">End Time</label>
                <input type="datetime-local" className="tb-input w-full" value={form.end_time} onChange={e => setForm({...form, end_time:e.target.value})}/>
              </div>
              <div>
                <label className="text-xs text-tertiary block mb-1">Hours (or auto-calc)</label>
                <input type="number" className="tb-input w-full" placeholder="e.g. 2.5" value={form.hours_logged} onChange={e => setForm({...form, hours_logged:e.target.value})} min="0" step="0.25"/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:20 }}>
                <input type="checkbox" id="billable" checked={form.is_billable} onChange={e => setForm({...form, is_billable:e.target.checked})} style={{ width:16, height:16 }}/>
                <label htmlFor="billable" className="text-sm text-secondary">Billable to client</label>
              </div>
              <div style={{ gridColumn:"1 / -1" }}>
                <label className="text-xs text-tertiary block mb-1">Notes</label>
                <textarea className="tb-input w-full" style={{ height:64, resize:"none" }} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="Work performed…"/>
              </div>
            </div>

            {estHours > 0 && (
              <div style={{ marginTop:16, padding:16, background:"var(--color-surface-alt)", border:"1px solid var(--color-border)", borderRadius:10 }}>
                <div className="text-xs text-tertiary mb-2">Cost Preview</div>
                <div style={{ display:"flex", gap:24 }}>
                  <div><div className="text-lg font-black text-primary">{estHours}h</div><div className="text-xs text-tertiary">Hours</div></div>
                  <div><div className="text-lg font-black text-emerald-600">{fmtEGP(estCost)}</div><div className="text-xs text-tertiary">Labor Cost</div></div>
                  <div><div className="text-lg font-black text-secondary">EGP {form.hourly_rate}/h</div><div className="text-xs text-tertiary">Rate</div></div>
                </div>
              </div>
            )}

            <button onClick={() => logMut.mutate(form)} disabled={!form.work_order_id || !form.technician_id || logMut.isLoading}
              className="tb-btn-primary" style={{ marginTop:16 }}>
              {logMut.isLoading ? "Logging…" : "⏱ Log Time Entry"}
            </button>
          </SectionCard>
        )}

        {/* Entries Tab */}
        {activeTab === "entries" && (
          <SectionCard
            title="Time Entries"
            subtitle={`${entries.length} entries recorded`}
            actions={
              <select className="tb-input" value={filterTech} onChange={e => setFilterTech(e.target.value)} style={{ minWidth:160 }}>
                <option value="">All Technicians</option>
                {techs.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            }
          >
            {isLoading ? (
              <LoadingState type="table" rows={6} />
            ) : entries.length === 0 ? (
              <EmptyState icon="⏱️" title="No time entries" description="Log your first time entry above" action={{ label:"Log Time", onClick:() => setActiveTab("log") }} size="sm" />
            ) : (
              <DataTable columns={entriesColumns} data={entries} keyField="id" />
            )}
          </SectionCard>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <SectionCard title="By Work Type">
              {byType.length === 0 ? <EmptyState icon="📊" title="No data" size="sm" /> : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {byType.map((wt: any, i: number) => {
                    const type = WORK_TYPES.find(t => t.v === wt.work_type);
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"var(--color-surface-alt)", borderRadius:8 }}>
                        <span style={{ fontSize:"1.25rem" }}>{type?.icon || "🔧"}</span>
                        <div style={{ flex:1 }}><div className="text-sm text-primary">{type?.label || wt.work_type}</div></div>
                        <div className="text-sm font-bold text-primary">{Number(wt.total_hours || 0).toFixed(1)}h</div>
                        <div className="text-sm font-bold text-emerald-600">{fmtEGP(wt.total_cost || 0)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
            <SectionCard title="Top Work Orders">
              {byWO.length === 0 ? <EmptyState icon="🔧" title="No data" size="sm" /> : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {byWO.map((wo: any, i: number) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"var(--color-surface-alt)", borderRadius:8 }}>
                      <div style={{ flex:1, minWidth:0 }}><div className="text-sm font-semibold text-primary truncate">{wo.title || "—"}</div><div className="text-xs text-tertiary">{wo.entries || 0} entries</div></div>
                      <div className="text-sm font-bold text-primary">{Number(wo.total_hours || 0).toFixed(1)}h</div>
                      <div className="text-sm font-bold text-emerald-600">{fmtEGP(wo.total_cost || 0)}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* Utilization Tab */}
        {activeTab === "utilization" && (
          <SectionCard title="Technician Utilization">
            {byTech.filter((t: any) => t.total_hours > 0).length === 0 ? (
              <EmptyState icon="👷" title="No time entries yet" size="sm" />
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {byTech.filter((t: any) => t.total_hours > 0).map((tech: any, i: number) => {
                  const maxH = Math.max(...byTech.map((t: any) => Number(t.total_hours || 0)), 1);
                  const pct  = Math.min(100, (Number(tech.total_hours || 0) / maxH) * 100);
                  return (
                    <div key={i} style={{ padding:16, background:"var(--color-surface-alt)", border:"1px solid var(--color-border)", borderRadius:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <div>
                          <div className="text-sm font-bold text-primary">{tech.name}</div>
                          <div className="text-xs text-tertiary">{tech.entries || 0} entries · {fmtEGP(tech.total_cost || 0)} labor cost</div>
                        </div>
                        <div className="text-lg font-black text-primary">{Number(tech.total_hours || 0).toFixed(1)}h</div>
                      </div>
                      <div style={{ height:6, borderRadius:3, background:"var(--color-border)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:3, background:"#5B7C8C", width:`${pct}%` }} />
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

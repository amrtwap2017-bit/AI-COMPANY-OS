"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function PMPlansPage() {
  const router = useRouter();
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dueFilter,  setDueFilter]  = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["pm-list"],()=>authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r),{refetchInterval:120000}
  );
  const plans = toArr(raw);
  const now   = new Date();
  const in7   = new Date(now.getTime() +7*86400000);
  const in30  = new Date(now.getTime() +30*86400000);

  const overdue  = plans.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const dueWeek  = plans.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in7);
  const dueMonth = plans.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in30);
  const scheduled= plans.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)>in30);
  const types    = [...new Set(plans.map((p: any) =>p.plan_type||"general"))].sort();

  const filtered = plans.filter((p: any) =>{
    const ms = !search||p.title?.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter==="all"||(p.plan_type||"general")===typeFilter;
    const md = dueFilter==="all"||
      (dueFilter==="overdue"&&p.next_due_ts&&new Date(p.next_due_ts)<now)||
      (dueFilter==="week"&&p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in7)||
      (dueFilter==="month"&&p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in30);
    return ms&&mt&&md;
  });

  if (isLoading) return (
    <div className="tb-canvas">
      <div className="tb-shimmer-block" style={{height:60}}/>
      <div className="tb-grid-4">{[1,2,3,4].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:64}}/>)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">PM Plans</h1>
              <p className="tb-hero-description">{plans.length} plans · {overdue.length} overdue · {dueWeek.length} due this week</p>
            </div>
            <button onClick={()=>router.push("/workflows/launcher")} className="tb-btn tb-btn-primary">⚡ Auto-Create WOs</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Overdue",        value:overdue.length,  color:overdue.length>0?"var(--color-danger)":"var(--color-success)",   filter:"overdue"},
              {label:"Due This Week",  value:dueWeek.length,  color:dueWeek.length>0?"var(--color-warning)":"var(--color-text-3)",  filter:"week"},
              {label:"Due This Month", value:dueMonth.length, color:"var(--color-info)",                                             filter:"month"},
              {label:"Scheduled",      value:scheduled.length,color:"var(--color-success)",                                          filter:"all"},
            ].map((k: any, i: number) =>(
              <button key={i} onClick={()=>setDueFilter(dueFilter===k.filter?"all":k.filter)} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {overdue.length>0&&(
          <div className="tb-alert tb-alert-danger mb-4">
            <span className="text-xl">🔧</span>
            <div className="flex-1 text-sm font-bold">
              {overdue.length} PM Plans Overdue — {overdue.slice(0,2).map((p: any) =>p.title).join(" · ")}
            </div>
            <button onClick={()=>setDueFilter("overdue")} className="tb-btn tb-btn-danger tb-btn-sm ml-auto">Show Overdue</button>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search PM plans..."
            className="tb-input" style={{maxWidth:"320px"}}/>
          <select value={typeFilter} onChange={(e: any) =>setTypeFilter(e.target.value)} className="tb-select" style={{width:"auto"}}>
            <option value="all">All Types</option>
            {types.map((t: any) =><option key={t} value={t}>{t}</option>)}
          </select>
          {(search||typeFilter!=="all"||dueFilter!=="all")&&(
            <button onClick={()=>{setSearch("");setTypeFilter("all");setDueFilter("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>
          )}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} plans</span>
          <ExportButton data={toArr(raw)} filename="pm-plans" title="PM Plans"/>
        </div>

        <div className="tb-section">
          {filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📅</div>
              <div className="tb-empty-title">No plans match</div>
              <div className="tb-empty-desc">Try adjusting your filters</div>
            </div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th style={{textAlign:"center"}}>Type</th>
                    <th style={{textAlign:"center"}}>Frequency</th>
                    <th style={{textAlign:"center"}}>Next Due</th>
                    <th style={{textAlign:"center"}}>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p: any, i: number) =>{
                    const isOv = p.next_due_ts&&new Date(p.next_due_ts)<now;
                    const isDW = !isOv&&p.next_due_ts&&new Date(p.next_due_ts)<=in7;
                    return (
                      <tr key={i} onClick={()=>router.push(`/maintenance/pm-plans/${p.id}`)} className="cursor-pointer">
                        <td>
                          <div className="text-sm font-semibold text-primary truncate">{p.title}</div>
                          <div className="text-xs text-tertiary mt-0.5">{p.notes?.slice(0,50)||p.asset_node_id||"—"}</div>
                        </td>
                        <td className="text-center text-xs text-secondary capitalize">{p.plan_type||"—"}</td>
                        <td className="text-center text-xs text-secondary capitalize">{p.frequency||"—"}</td>
                        <td className="text-center">
                          <div className={`text-xs font-medium ${isOv?"text-danger font-bold":isDW?"text-warning":"text-secondary"}`}>
                            {fmtDate(p.next_due_ts||p.next_due_date)}
                          </div>
                          {isOv&&<span className="tb-badge tb-badge-danger" style={{fontSize:"0.5rem",padding:"1px 6px",marginTop:2}}>OVERDUE</span>}
                          {isDW&&<span className="tb-badge tb-badge-warning" style={{fontSize:"0.5rem",padding:"1px 6px",marginTop:2}}>THIS WEEK</span>}
                        </td>
                        <td className="text-center text-xs text-secondary truncate">{p.owner||"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function PMPlansPage() {
  const router = useRouter();
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("all");
  const [dueFilter, setDueFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["pm-list"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()), {refetchInterval:120000}
  );
  const plans = toArr(raw);
  const now   = new Date();
  const in7   = new Date(now.getTime()+7*86400000);
  const in30  = new Date(now.getTime()+30*86400000);

  const overdue  = plans.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const dueWeek  = plans.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in7);
  const dueMonth = plans.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in30);
  const scheduled= plans.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)>in30);
  const types    = [...new Set(plans.map(p=>p.plan_type||"general"))].sort();

  const filtered = plans.filter(p => {
    const ms = !search||p.title?.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter==="all"||(p.plan_type||"general")===typeFilter;
    const md = dueFilter==="all"||
      (dueFilter==="overdue"&&p.next_due_ts&&new Date(p.next_due_ts)<now)||
      (dueFilter==="week"&&p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in7)||
      (dueFilter==="month"&&p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=in30);
    return ms&&mt&&md;
  });

  if (isLoading) return (
    <div className="tb-page">
      <div className="tb-section animate-pulse" style={{height:60}}/>
      <div className="tb-grid-4 animate-pulse">{[1,2,3,4].map(i=><div key={i} className="tb-section" style={{height:64}}/>)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-red-500 mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">PM Plans</h1>
              <p className="tb-hero-description">{plans.length} plans · {overdue.length} overdue · {dueWeek.length} due this week</p>
            </div>
            <button onClick={()=>router.push("/workflows/launcher")} className="tb-hero-btn tb-hero-btn--primary">⚡ Auto-Create WOs</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Overdue",       value:overdue.length,  color:overdue.length>0?"#F87171":"#34D399",  filter:"overdue"},
              {label:"Due This Week", value:dueWeek.length,  color:dueWeek.length>0?"#FBBF24":"#94A3B8",  filter:"week"},
              {label:"Due This Month",value:dueMonth.length, color:"#60A5FA",                              filter:"month"},
              {label:"Scheduled",    value:scheduled.length, color:"#34D399",                              filter:"all"},
            ].map((k,i)=>{
              const active=dueFilter===k.filter;
              return (
                <button key={i} onClick={()=>setDueFilter(active?"all":k.filter)}
                  className="tb-hero-kpi"
                  style={{background:active?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${active?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div className="tb-ai-insight" style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)"}}>
            <div className="tb-ai-insight-icon" style={{background:"rgba(239,68,68,0.15)"}}>🔧</div>
            <div className="tb-ai-insight-text" style={{color:"#FCA5A5"}}>
              {overdue.length} PM Plans Overdue — {overdue.slice(0,2).map(p=>p.title).join(" · ")}
            </div>
            <button onClick={()=>{setDueFilter("overdue");}} className="tb-ai-insight-action" style={{color:"#F87171",borderColor:"rgba(239,68,68,0.3)"}}>
              Show Overdue
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search PM plans..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
            className="tb-pill" style={{cursor:"pointer"}}>
            <option value="all">All Types</option>
            {types.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          {(search||typeFilter!=="all"||dueFilter!=="all")&&(
            <button onClick={()=>{setSearch("");setTypeFilter("all");setDueFilter("all");}} className="tb-pill">Clear ×</button>
          )}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} plans</span>
          <ExportButton data={toArr(raw)} filename="pm-plans" title="PM Plans"/>
        </div>

        {/* Table */}
        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📅</div>
              <div className="tb-empty-title">No plans match</div>
              <div className="tb-empty-desc">Try adjusting your filters</div>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 110px 100px 130px 130px"}}>
                {["Plan","Type","Frequency","Next Due","Owner"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((p,i)=>{
                const isOv  =p.next_due_ts&&new Date(p.next_due_ts)<now;
                const isDW  =!isOv&&p.next_due_ts&&new Date(p.next_due_ts)<=in7;
                return (
                  <button key={i} onClick={()=>router.push(`/maintenance/pm-plans/${p.id}`)}
                    className={`tb-table-row ${isOv?"tb-table-row--danger":""}`}
                    style={{gridTemplateColumns:"1fr 110px 100px 130px 130px",background:isDW?"rgba(245,158,11,0.02)":""}}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary truncate">{p.title}</div>
                      <div className="text-xs text-tertiary mt-0.5">{p.notes?.slice(0,50)||p.asset_node_id||"—"}</div>
                    </div>
                    <div className="text-center text-xs text-secondary capitalize">{p.plan_type||"—"}</div>
                    <div className="text-center text-xs text-secondary capitalize">{p.frequency||"—"}</div>
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isOv?"text-red-400 font-bold":isDW?"text-amber-400":"text-secondary"}`}>
                        {fmtDate(p.next_due_ts||p.next_due_date)}
                      </div>
                      {isOv&&<span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem",padding:"1px 6px",marginTop:2}}>OVERDUE</span>}
                      {isDW&&<span className="tb-badge tb-badge--warning" style={{fontSize:"0.5rem",padding:"1px 6px",marginTop:2}}>THIS WEEK</span>}
                    </div>
                    <div className="text-center text-xs text-secondary truncate">{p.owner||"—"}</div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

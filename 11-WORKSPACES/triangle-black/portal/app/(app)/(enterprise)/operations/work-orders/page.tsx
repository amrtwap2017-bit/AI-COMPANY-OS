"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const P_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"rgba(148,163,184,0.5)" };
const S_COLOR  = { open:"#60A5FA", in_progress:"#FBBF24", completed:"#34D399", cancelled:"rgba(148,163,184,0.4)" };
const P_BG    = { critical:"rgba(239,68,68,0.08)", high:"rgba(251,146,60,0.08)", medium:"rgba(245,158,11,0.06)", low:"transparent" };

export default function WorkOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(["wo-list"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()), {refetchInterval:60000});
  const wos = toArr(raw);
  const now = new Date();

  const filtered = wos.filter(w => {
    const ms = !search || w.title?.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter==="all" || w.status===statusFilter;
    const mp  = priorityFilter==="all" || w.priority===priorityFilter;
    return ms && mst && mp;
  });

  const open       = wos.filter(w=>w.status==="open");
  const inProgress = wos.filter(w=>w.status==="in_progress");
  const completed  = wos.filter(w=>w.status==="completed");
  const critical   = wos.filter(w=>w.priority==="critical" && w.status!=="completed");
  const overdue    = wos.filter(w=>w.due_date && new Date(w.due_date)<now && w.status!=="completed");
  const compRate   = wos.length>0 ? Math.round(completed.length/wos.length*100) : 0;

  if (isLoading) return (
    <div className="tb-page space-y-4 animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"/>
      <div className="grid grid-cols-6 gap-3">{[1,2,3,4,5,6].map(i=><div key={i} className="h-20 bg-slate-100 dark:bg-slate-900 rounded-xl"/>)}</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>

      {/* DARK HEADER */}
      <div style={{background:"linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",borderBottom:"1px solid rgba(255,255,255,0.06)"}} className="px-8 py-7">
        <div className="max-w-content mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"#F97316",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Operations</div>
              <h1 style={{fontSize:"2rem",fontWeight:900,color:"#F1F5F9",letterSpacing:"-0.02em",lineHeight:1.1}}>Work Orders</h1>
              <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.8125rem",marginTop:5}}>
                {wos.length} total · {open.length} open · {overdue.length} overdue · {compRate}% completion
              </p>
            </div>
            <button onClick={()=>router.push("/engineering/new-work-order")}
              style={{background:"rgba(180,83,9,0.15)",border:"1px solid rgba(180,83,9,0.4)",color:"#FCD34D",borderRadius:12,padding:"10px 20px",fontSize:"0.8125rem",fontWeight:700,cursor:"pointer",transition:"all 150ms ease"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(180,83,9,0.25)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(180,83,9,0.15)"}}>
              + New Work Order
            </button>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            {[
              {label:"Total",      value:wos.length,       color:"rgba(148,163,184,0.9)", filter:"all",         pf:"all"},
              {label:"Open",       value:open.length,      color:"#60A5FA",               filter:"open",        pf:"all"},
              {label:"In Progress",value:inProgress.length,color:"#FBBF24",               filter:"in_progress", pf:"all"},
              {label:"Completed",  value:completed.length, color:"#34D399",               filter:"completed",   pf:"all"},
              {label:"Critical",   value:critical.length,  color:critical.length>0?"#F87171":"#34D399", filter:"all", pf:"critical"},
              {label:"Overdue",    value:overdue.length,   color:overdue.length>0?"#F87171":"#34D399",  filter:"all", pf:"all"},
            ].map((k,i)=>{
              const active = statusFilter===k.filter && priorityFilter===k.pf;
              return (
                <button key={i} onClick={()=>{setStatusFilter(k.filter);setPriorityFilter(k.pf);}}
                  style={{background:active?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${active?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"12px 8px",textAlign:"center",cursor:"pointer",transition:"all 120ms ease"}}>
                  <div style={{fontSize:"1.375rem",fontWeight:900,color:k.color,lineHeight:1}}>{k.value}</div>
                  <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-content mx-auto px-8 py-6 space-y-4">

        {/* Critical banner */}
        {critical.length > 0 && (
          <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:16,padding:"14px 20px",display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontSize:"1.25rem"}}>🚨</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:"#F87171",fontSize:"0.875rem"}}>{critical.length} Critical Work Orders Need Immediate Action</div>
              <div style={{fontSize:"0.75rem",color:"rgba(239,68,68,0.7)",marginTop:2}}>{critical.slice(0,2).map(w=>w.title).join(" · ")}</div>
            </div>
            <button onClick={()=>setPriorityFilter("critical")} style={{background:"#EF4444",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>Show Critical</button>
          </div>
        )}

        {/* Search + filter bar */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search work orders..."
            style={{flex:1,minWidth:200,background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:10,padding:"10px 14px",fontSize:"0.8125rem",color:"var(--color-text-1)",outline:"none",transition:"border 150ms ease"}}
            onFocus={e=>e.target.style.borderColor="var(--color-brand)"}
            onBlur={e=>e.target.style.borderColor="var(--color-border)"}/>
          {["all","open","in_progress","completed","cancelled"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              style={{padding:"8px 14px",borderRadius:8,fontSize:"0.75rem",fontWeight:600,cursor:"pointer",transition:"all 120ms ease",
                background:statusFilter===s?"var(--color-brand)":"var(--color-surface)",
                color:statusFilter===s?"#fff":"var(--color-text-2)",
                border:`1px solid ${statusFilter===s?"var(--color-brand)":"var(--color-border)"}`}}>
              {s==="in_progress"?"In Progress":s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
          {["all","critical","high","medium","low"].map(p=>(
            <button key={p} onClick={()=>setPriorityFilter(p)}
              style={{padding:"8px 12px",borderRadius:8,fontSize:"0.75rem",fontWeight:600,cursor:"pointer",transition:"all 120ms ease",
                background:priorityFilter===p&&p!=="all"?`${P_COLOR[p]}20`:"var(--color-surface)",
                color:priorityFilter===p&&p!=="all"?P_COLOR[p]:"var(--color-text-3)",
                border:`1px solid ${priorityFilter===p&&p!=="all"?P_COLOR[p]:"var(--color-border)"}`}}>
              {p==="all"?"Priority":p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
          {(search||statusFilter!=="all"||priorityFilter!=="all") && (
            <button onClick={()=>{setSearch("");setStatusFilter("all");setPriorityFilter("all");}}
              style={{padding:"8px 12px",borderRadius:8,fontSize:"0.75rem",color:"var(--color-text-3)",background:"var(--color-surface)",border:"1px solid var(--color-border)",cursor:"pointer"}}>
              Clear ×
            </button>
          )}
          <span style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginLeft:"auto"}}>{filtered.length} results</span>
        </div>

        {/* Table */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:16,overflow:"hidden"}}>
          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"64px 24px"}}>
              <div style={{fontSize:"3rem",marginBottom:16,opacity:0.4}}>🔧</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:8}}>No work orders found</div>
              <div style={{fontSize:"0.875rem",color:"var(--color-text-3)"}}>Try adjusting your filters</div>
            </div>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 90px 110px 100px 100px",background:"var(--color-bg-alt)",padding:"10px 24px",borderBottom:"1px solid var(--color-divider)"}}>
                {["Work Order","Priority","Status","Due Date","Created"].map((h,i)=>(
                  <div key={i} style={{fontSize:"0.625rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.slice(0,60).map((w,i)=>{
                const isOverdue = w.due_date && new Date(w.due_date)<now && w.status!=="completed";
                const pc = P_COLOR[w.priority]||"rgba(148,163,184,0.4)";
                const sc = S_COLOR[w.status]||"rgba(148,163,184,0.4)";
                return (
                  <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                    className="w-full text-left"
                    style={{display:"grid",gridTemplateColumns:"1fr 90px 110px 100px 100px",alignItems:"center",padding:"14px 24px",borderBottom:i<filtered.length-1?"1px solid var(--color-divider)":"none",transition:"background 100ms ease",cursor:"pointer",background:isOverdue?"rgba(239,68,68,0.03)":"transparent"}}
                    onMouseEnter={e=>e.currentTarget.style.background=isOverdue?"rgba(239,68,68,0.06)":"rgba(180,83,9,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background=isOverdue?"rgba(239,68,68,0.03)":"transparent"}>
                    <div style={{paddingRight:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:3,height:28,background:pc,borderRadius:99,flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{w.title}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2,textTransform:"capitalize"}}>{w.type||"corrective"}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 8px",borderRadius:6,background:`${pc}18`,color:pc}}>{w.priority}</span>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <span style={{fontSize:"0.6875rem",fontWeight:600,padding:"3px 10px",borderRadius:6,background:`${sc}18`,color:sc}}>{w.status}</span>
                    </div>
                    <div style={{textAlign:"center",fontSize:"0.75rem",color:isOverdue?"#F87171":"var(--color-text-3)",fontWeight:isOverdue?700:400}}>
                      {fmtDate(w.due_date)}
                      {isOverdue&&<div style={{fontSize:"0.5625rem",color:"#F87171",marginTop:1,textTransform:"uppercase",letterSpacing:"0.04em"}}>OVERDUE</div>}
                    </div>
                    <div style={{textAlign:"center",fontSize:"0.75rem",color:"var(--color-text-3)"}}>{fmtDate(w.created_at)}</div>
                  </button>
                );
              })}
              {filtered.length>60 && (
                <div style={{textAlign:"center",padding:"12px 24px",fontSize:"0.75rem",color:"var(--color-text-3)",background:"var(--color-bg-alt)",borderTop:"1px solid var(--color-divider)"}}>
                  Showing 60 of {filtered.length} results
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

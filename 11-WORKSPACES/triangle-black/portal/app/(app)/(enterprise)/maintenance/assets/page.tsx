"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_CONFIG = {
  "Operational":       { color:"#34D399", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.2)" },
  "In Fault":          { color:"#F87171", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.2)" },
  "Under Maintenance": { color:"#FBBF24", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.2)" },
};
const CRIT_COLOR = { critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"rgba(148,163,184,0.4)" };

export default function AssetsPage() {
  const router = useRouter();
  const [search,   setSearch]   = useState("");
  const [catF,     setCatF]     = useState("all");
  const [critF,    setCritF]    = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["assets-list"], () => authFetch("/api/v1/assets/").then(r=>r.json()), {refetchInterval:120000}
  );
  const { data: twin } = useQuery(["assets-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));

  const assets = toArr(raw);
  const now    = new Date();
  const cats   = [...new Set(assets.map(a=>a.category||"Other"))].sort();

  const operational   = assets.filter(a=>a.status==="Operational");
  const faulted       = assets.filter(a=>a.status==="In Fault");
  const underMaint    = assets.filter(a=>a.status==="Under Maintenance");
  const critical      = assets.filter(a=>a.criticality==="critical");
  const overdueService= assets.filter(a=>a.next_maintenance_date&&new Date(a.next_maintenance_date)<now);
  const uptimePct     = assets.length>0?Math.round(operational.length/assets.length*100):100;
  const score         = twin?.health_score??0;

  const filtered = assets.filter(a => {
    const ms = !search||a.name?.toLowerCase().includes(search.toLowerCase())||a.serial_number?.toLowerCase().includes(search.toLowerCase());
    return ms && (catF==="all"||(a.category||"Other")===catF) && (critF==="all"||a.criticality===critF);
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0A0A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-red-500 mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">Asset Registry</h1>
              <p className="tb-hero-description">{assets.length} assets · {critical.length} critical · {uptimePct}% uptime</p>
            </div>
            <div className={`tb-score-badge ${score>=95?"tb-score-badge--success":"tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:score>=95?"#34D399":"#FBBF24"}}>{uptimePct}%</div>
              <div className="tb-score-label">Uptime</div>
            </div>
          </div>
          <div className="tb-grid-6 mt-6">
            {[
              {label:"Total",      value:assets.length,         color:"rgba(148,163,184,0.9)"},
              {label:"Operational",value:operational.length,    color:"#34D399"},
              {label:"In Fault",   value:faulted.length,        color:faulted.length>0?"#F87171":"#34D399"},
              {label:"Maintenance",value:underMaint.length,     color:"#FBBF24"},
              {label:"Critical",   value:critical.length,       color:"#F87171"},
              {label:"Overdue Svc",value:overdueService.length, color:overdueService.length>0?"#F87171":"#34D399"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {faulted.length > 0 && (
          <div className="tb-ai-insight" style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)"}}>
            <div className="tb-ai-insight-icon" style={{background:"rgba(239,68,68,0.15)"}}>⚠️</div>
            <div className="tb-ai-insight-text" style={{color:"#FCA5A5"}}>
              {faulted.length} Asset{faulted.length>1?"s":""} In Fault — {faulted.slice(0,2).map(a=>a.name).join(" · ")}
            </div>
            <button onClick={()=>router.push("/maintenance/actions")} className="tb-ai-insight-action" style={{color:"#F87171",borderColor:"rgba(239,68,68,0.3)"}}>
              View Faults →
            </button>
          </div>
        )}

        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets by name or serial..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <select value={catF} onChange={e=>setCatF(e.target.value)} className="tb-pill" style={{cursor:"pointer"}}>
            <option value="all">All Categories</option>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={critF} onChange={e=>setCritF(e.target.value)} className="tb-pill" style={{cursor:"pointer"}}>
            <option value="all">All Criticality</option>
            {["critical","high","medium","low"].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          {(search||catF!=="all"||critF!=="all")&&<button onClick={()=>{setSearch("");setCatF("all");setCritF("all");}} className="tb-pill">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} assets</span>
          <ExportButton data={toArr(assetRaw)} filename="assets" title="Assets"/>
        </div>

        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🏗️</div>
              <div className="tb-empty-title">No assets found</div>
              <div className="tb-empty-desc">Try adjusting your filters</div>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 110px 120px 100px 120px 120px"}}>
                {["Asset","Category","Status","Criticality","Last Service","Next Service"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((a,i)=>{
                const isOv = a.next_maintenance_date&&new Date(a.next_maintenance_date)<now;
                const isFault = a.status==="In Fault";
                const sc = STATUS_CONFIG[a.status]||STATUS_CONFIG["Operational"];
                const cc = CRIT_COLOR[a.criticality]||"rgba(148,163,184,0.4)";
                return (
                  <button key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)}
                    className={`tb-table-row ${isFault?"tb-table-row--danger":""}`}
                    style={{gridTemplateColumns:"1fr 110px 120px 100px 120px 120px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:cc}}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{a.name}</div>
                        <div className="text-xs text-tertiary mt-0.5">{a.manufacturer} {a.model}</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-secondary">{a.category||"—"}</div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,fontSize:"0.625rem"}}>
                        {a.status||"—"}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${cc}18`,color:cc,border:`1px solid ${cc}30`,fontSize:"0.625rem"}}>
                        {a.criticality||"—"}
                      </span>
                    </div>
                    <div className="text-center text-xs text-secondary">{fmtDate(a.last_maintenance_date)}</div>
                    <div className={`text-center text-xs ${isOv?"text-red-400 font-bold":"text-secondary"}`}>
                      {fmtDate(a.next_maintenance_date)}
                      {isOv&&<div style={{fontSize:"0.5rem",textTransform:"uppercase"}}>OVERDUE</div>}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Quick nav */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Related Views</div>
          <div className="tb-grid-4">
            {[{label:"Asset Tree",icon:"🌳",path:"/maintenance/asset-tree"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"},{label:"Work History",icon:"📋",path:"/maintenance/work-history"},{label:"Intelligence",icon:"🧠",path:"/maintenance/intelligence"}].map((a,i)=>(
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

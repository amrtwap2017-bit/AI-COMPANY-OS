"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FeatureGate } from "@/components/ui/FeatureGate";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const CRIT_COLOR = {critical:"var(--color-danger)",high:"var(--color-warning)",medium:"var(--color-warning)",low:"var(--color-text-3)"};

function AssetsPageInner() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const [critF, setCritF] = useState("all");

  const [mounted, setMounted] = useState(false)
  const { data: raw, isLoading } = useQuery(["assets-list"],()=>authFetch("/api/v1/assets/").then(r=>r.json()),{refetchInterval:120000});
  const { data: twin } = useQuery(["assets-twin"],()=>authFetch("/api/v1/twin/state").then(r=>r.json()));

  useEffect(() => { setMounted(true) }, [])
  const assets = toArr(raw);
  const now = new Date();
  const cats = [...new Set(assets.map((a: any) =>a.category||"Other"))].sort();

  const operational = assets.filter((a: any) =>a.status==="Operational");
  const faulted = assets.filter((a: any) =>a.status==="In Fault");
  const underMaint = assets.filter((a: any) =>a.status==="Under Maintenance");
  const critical = assets.filter((a: any) =>a.criticality==="critical");
  const overdueService = assets.filter((a: any) =>a.next_maintenance_date&&new Date(a.next_maintenance_date)<now);
  const uptimePct = assets.length>0?Math.round(operational.length/assets.length*100):100;
  const score = twin?.health_score??0;

  const filtered = assets.filter((a: any) =>{
    const ms = !search||a.name?.toLowerCase().includes(search.toLowerCase())||a.serial_number?.toLowerCase().includes(search.toLowerCase());
    return ms&&(catF==="all"||(a.category||"Other")===catF)&&(critF==="all"||a.criticality===critF);
  });

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">Asset Registry</h1>
              <p className="tb-hero-description">{assets.length} assets · {critical.length} critical · {uptimePct}% uptime</p>
            </div>
            <div className={`tb-section text-center flex-shrink-0 ${score>=95?"border-success/30":"border-warning/30"}`} style={{minWidth:"80px"}}>
              <div className={`text-2xl font-black ${score>=95?"text-success":"text-warning"}`}>{uptimePct}%</div>
              <div className="text-xs text-tertiary mt-0.5">Uptime</div>
            </div>
          </div>
          <div className="grid mt-6" style={{gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
            {[{label:"Total",value:assets.length},{label:"Operational",value:operational.length,good:true},{label:"In Fault",value:faulted.length,danger:faulted.length>0},{label:"Maintenance",value:underMaint.length},{label:"Critical",value:critical.length,danger:critical.length>0},{label:"Overdue Svc",value:overdueService.length,danger:overdueService.length>0}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.good?"var(--color-success)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {faulted.length>0 && (
          <div className="tb-alert tb-alert-danger mb-4">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-sm">{faulted.length} Asset{faulted.length>1?"s":""} In Fault — {faulted.slice(0,2).map((a: any) =>a.name).join(" · ")}</div>
            <button onClick={()=>router.push("/maintenance/actions")} className="tb-btn tb-btn-danger tb-btn-sm">View Faults →</button>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search assets by name or serial..." className="tb-input" style={{maxWidth:"320px"}} />
          <select value={catF} onChange={(e: any) =>setCatF(e.target.value)} className="tb-select" style={{width:"auto"}}>
            <option value="all">All Categories</option>
            {cats.map((c: any) =><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={critF} onChange={(e: any) =>setCritF(e.target.value)} className="tb-select" style={{width:"auto"}}>
            <option value="all">All Criticality</option>
            {["critical","high","medium","low"].map((c: any) =><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          {(search||catF!=="all"||critF!=="all")&&<button onClick={()=>{setSearch("");setCatF("all");setCritF("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} assets</span>
          <ExportButton data={toArr(raw)} filename="assets" title="Assets"/>
        </div>

        <div className="tb-section">
          {filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">🏗️</div><div className="tb-empty-title">No assets found</div><div className="tb-empty-desc">Try adjusting your filters</div></div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Asset</th><th>Category</th><th>Status</th><th>Criticality</th><th>Last Service</th><th>Next Service</th></tr></thead>
                <tbody>
                  {filtered.map((a: any, i: number) =>{
                    const isOv = a.next_maintenance_date&&new Date(a.next_maintenance_date)<now;
                    const isFault = a.status==="In Fault";
                    const cc = (CRIT_COLOR as Record<string, any>)[a.criticality]||"var(--color-text-3)";
                    return (
                      <tr key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)} className="cursor-pointer" style={{borderLeft:isFault?"3px solid var(--color-danger-border)":"3px solid transparent"}}>
                        <td>
                          <div className="text-sm font-semibold text-primary truncate">{a.name}</div>
                          <div className="text-xs text-tertiary mt-0.5">{a.manufacturer} {a.model}</div>
                        </td>
                        <td className="text-xs text-secondary">{a.category||"—"}</td>
                        <td><StatusBadge status={a.status==="Operational"?"active":a.status==="In Fault"?"fault":"maintenance"} /></td>
                        <td>
                          <span className="tb-badge" style={{background:`${cc}18`,color:cc,border:`1px solid ${cc}30`,fontSize:"10px"}}>
                            {a.criticality||"—"}
                          </span>
                        </td>
                        <td className="text-xs text-secondary">{fmtDate(a.last_maintenance_date)}</td>
                        <td className={`text-xs ${isOv?"font-bold text-danger":"text-secondary"}`}>
                          {fmtDate(a.next_maintenance_date)}
                          {isOv&&<div className="text-xs uppercase" style={{fontSize:"0.5rem"}}>OVERDUE</div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tb-section">
          <div className="tb-section-title">Related Views</div>
          <div className="tb-grid-4">
            {[{label:"Asset Tree",icon:"🌳",path:"/maintenance/asset-tree"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"},{label:"Work History",icon:"📋",path:"/maintenance/work-history"},{label:"Intelligence",icon:"🧠",path:"/maintenance/intelligence"}].map((a: any, i: number) =>(
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


export default function AssetsPage(props: any) {
  return (
    <FeatureGate feature="maintenance">
      <AssetsPageInner {...props} />
    </FeatureGate>
  );
}

"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const PC = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#6D5F53"};
const SC = {open:"#5B7C8C",in_progress:"#B07A2A",resolved:"#547C4D",closed:"#6D5F53"};
export default function TasksPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: srRaw, isLoading } = useQuery(["tasks-srs"], () => authFetch("/api/v1/service-requests/").then(r=>r.json()),{refetchInterval:30000});
  const { data: woRaw } = useQuery(["tasks-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const srs = toArr(srRaw); const wos = toArr(woRaw);
  const open = srs.filter((s: any) =>s.status==="open").length;
  const critical = srs.filter((s: any) =>s.priority==="critical"&&s.status!=="resolved"&&s.status!=="closed").length;
  const filtered = filter==="all" ? srs : srs.filter((s: any) =>s.status===filter||s.priority===filter);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Operations</div>
          <h1 className="tb-hero-title">Tasks</h1>
          <p className="tb-hero-description">{srs.length} tasks · {open} open · {critical} critical</p>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[{label:"Total",value:srs.length,color:"#221D1A"},{label:"Open",value:open,color:"#5B7C8C"},{label:"In Progress",value:srs.filter((s: any) =>s.status==="in_progress").length,color:"#B07A2A"},{label:"Critical",value:critical,color:critical>0?"#A84A3D":"#547C4D"},{label:"Linked WOs",value:srs.filter((s: any) =>s.work_order_id).length,color:"#8D7443"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2 flex-wrap">
            {["all","open","in_progress","resolved","critical","high"].map((f: any) =>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All":f.replace("_"," ")}
              </button>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="tb-flex-between mb-4"><div className="text-sm text-secondary">{filtered.length} tasks</div><button onClick={()=>router.push("/operations/service-requests")} className="tb-section-link">All SRs →</button></div>
          {isLoading ? <div className="space-y-3">{[1,2,3,4].map((i: any) =><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : filtered.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">No tasks</div></div>
          : <div className="space-y-2">
            {filtered.map((sr,i)=>{
              const pc=PC[sr.priority]||"#6D5F53"; const sc=SC[sr.status]||"#6D5F53";
              const wo=wos.find((w: any) =>w.id===sr.work_order_id);
              return (
                <button key={i} onClick={()=>router.push("/operations/service-requests/"+sr.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left border border-transparent hover:border-border">
                  <div className="tb-priority-bar" style={{background:pc}}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">{sr.title||"—"}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5rem"}}>{sr.status?.replace("_"," ")||"—"}</span>
                      <span className="text-xs text-tertiary">{fmtDate(sr.created_at)}</span>
                    </div>
                  </div>
                  {wo&&<span className="tb-badge tb-badge--success" style={{fontSize:"0.5rem",flexShrink:0}}>WO</span>}
                </button>
              );
            })}
          </div>}
        </div>
      </div>
    </div>
  );
}

"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const SC = {draft:"#94A3B8",pending_approval:"#FBBF24",approved:"#34D399",rejected:"#F87171",sent_to_client:"#A78BFA"};
export default function ScopeOfWorkPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(["sow-list"], () => authFetch("/api/v1/scope-of-work/").then(r=>r.json()), { staleTime:60000 });
  const sows = toArr(raw);
  const filtered = filter==="all" ? sows : sows.filter(s=>s.status===filter);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Procurement</div>
              <h1 className="tb-hero-title">Scope of Work</h1>
              <p className="tb-hero-description">{sows.length} documents · BOQ & cost estimates</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:sows.length,color:"#F1F5F9"},{label:"Draft",value:sows.filter(s=>s.status==="draft").length,color:"#94A3B8"},{label:"Pending",value:sows.filter(s=>s.status==="pending_approval").length,color:"#FBBF24"},{label:"Approved",value:sows.filter(s=>s.status==="approved").length,color:"#34D399"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all","draft","pending_approval","approved","sent_to_client"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All":f.replace("_"," ")}
              </button>
            ))}
          </div>
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📋</div>
              <div className="tb-empty-title">No SOW documents yet</div>
              <div className="tb-empty-desc">Create your first Scope of Work document</div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 90px 100px 120px 110px 100px"}}>
                {["SOW / Title","Type","Status","Client","Total Cost","Date"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((s,i)=>{
                const sc=SC[s.status]||"#94A3B8";
                return (
                  <button key={i} onClick={()=>router.push("/supply-chain/scope-of-work/"+s.id)} className="tb-table-row" style={{gridTemplateColumns:"1fr 90px 100px 120px 110px 100px"}}>
                    <div className="min-w-0 pr-4"><div className="text-sm font-semibold text-primary truncate">{s.title}</div><div className="text-xs text-tertiary">{s.sow_number||"—"}</div></div>
                    <div className="text-center"><span className="tb-badge" style={{fontSize:"0.5625rem"}}>{s.type||"service"}</span></div>
                    <div className="text-center"><span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5625rem"}}>{(s.status||"").replace("_"," ")}</span></div>
                    <div className="text-center text-xs text-secondary truncate px-1">{s.client_name||"—"}</div>
                    <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(s.total_cost||0)}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(s.created_at)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

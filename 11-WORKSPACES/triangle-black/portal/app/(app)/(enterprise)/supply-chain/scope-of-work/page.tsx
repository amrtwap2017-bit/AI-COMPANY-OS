"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const SC = {draft:"#6D5F53",pending_approval:"#B07A2A",approved:"#547C4D",rejected:"#A84A3D",sent_to_client:"#8D7443"};
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

export default function ScopeOfWorkPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(["sow-list"], () => authFetch("/api/v1/scope-of-work/").then(r=>r.json()), { staleTime:60000 });
  const sows = toArr(raw);
  const filtered = filter==="all" ? sows : sows.filter(s=>s.status===filter);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Procurement</div>
              <h1 className="tb-hero-title">Scope of Work</h1>
              <p className="tb-hero-description">{sows.length} documents · BOQ & cost estimates</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
                <button onClick={()=>handleExport("/api/v1/export/scope-of-work")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>⬇ Export CSV</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:sows.length,color:"#221D1A"},{label:"Draft",value:sows.filter(s=>s.status==="draft").length,color:"#6D5F53"},{label:"Pending",value:sows.filter(s=>s.status==="pending_approval").length,color:"#B07A2A"},{label:"Approved",value:sows.filter(s=>s.status==="approved").length,color:"#547C4D"}].map((k,i)=>(
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
                const sc=SC[s.status]||"#6D5F53";
                return (
                  <button key={i} onClick={()=>router.push("/supply-chain/scope-of-work/"+s.id)} className="tb-table-row" style={{gridTemplateColumns:"1fr 90px 100px 120px 110px 100px"}}>
                    <div className="min-w-0 pr-4"><div className="text-sm font-semibold text-primary truncate">{s.title}</div><div className="text-xs text-tertiary">{s.sow_number||"—"}</div></div>
                    <div className="text-center"><span className="tb-badge" style={{fontSize:"0.5625rem"}}>{s.sow_type||"service"}</span></div>
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

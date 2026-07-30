"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  active:            "#547C4D",
  pending_signature: "#B07A2A",
  expired:           "#A84A3D",
  draft:             "#6D5F53",
};

export default function ContractsPage() {
  const router = useRouter();
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["contracts-list"], () => authFetch("/api/v1/contracts/").then(r=>r.json()), {refetchInterval:120000}
  );
  const contracts = toArr(raw);
  const now = new Date();
  const in30 = new Date(now.getTime()+30*86400000);
  const in90 = new Date(now.getTime()+90*86400000);

  const active    = contracts.filter(c=>c.status==="active");
  const pending   = contracts.filter(c=>c.status==="pending_signature");
  const expired   = contracts.filter(c=>c.status==="expired");
  const expiring30= contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in30);
  const expiring90= contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in90);
  const totalValue = active.reduce((s,c)=>s+Number(c.total_value||0),0);

  const filtered = contracts.filter(c => {
    const ms = !search||c.title?.toLowerCase().includes(search.toLowerCase())||c.id?.slice(0,8).includes(search.toLowerCase());
    const mst = statusF==="all"||c.status===statusF||
      (statusF==="expiring"&&c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in30);
    return ms&&mst;
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1520 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-amber-500 mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">Contracts</h1>
              <p className="tb-hero-description">{contracts.length} total · {active.length} active · {fmtEGP(totalValue)} portfolio value</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>router.push("/customers/renewals")} className="tb-hero-btn tb-hero-btn--glass">🔄 Renewals</button>
              <button onClick={()=>router.push("/commercial/leads")} className="tb-hero-btn tb-hero-btn--primary">+ New Contract</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              {label:"Active",      value:active.length,    color:"#547C4D", f:"active",    sub:fmtEGP(totalValue)},
              {label:"Pending Sign",value:pending.length,   color:"#B07A2A", f:"pending_signature", sub:"awaiting"},
              {label:"Expiring 30d",value:expiring30.length,color:expiring30.length>0?"#A84A3D":"#6D5F53", f:"expiring", sub:"urgent"},
              {label:"Expiring 90d",value:expiring90.length,color:"#5B7C8C", f:"expiring", sub:"plan ahead"},
              {label:"Expired",    value:expired.length,    color:"#6D5F53", f:"expired",  sub:"closed"},
            ].map((k,i)=>{
              const act=statusF===k.f;
              return (
                <button key={i} onClick={()=>setStatusF(act?"all":k.f)}
                  className="tb-hero-kpi"
                  style={{background:act?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${act?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.125rem"}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {expiring30.length > 0 && (
          <div className="tb-ai-insight" style={{background:"rgba(245,158,11,0.06)",borderColor:"rgba(245,158,11,0.2)"}}>
            <div className="tb-ai-insight-icon" style={{background:"rgba(245,158,11,0.15)"}}>⏰</div>
            <div className="tb-ai-insight-text" style={{color:"#CFA058"}}>
              {expiring30.length} contract{expiring30.length>1?"s":""} expiring within 30 days — {expiring30.slice(0,2).map(c=>c.title||c.id?.slice(0,8)).join(" · ")}
            </div>
            <button onClick={()=>router.push("/customers/renewals")} className="tb-ai-insight-action" style={{color:"#B07A2A",borderColor:"rgba(245,158,11,0.3)"}}>
              Manage Renewals →
            </button>
          </div>
        )}

        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contracts..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <div className="tb-flex-gap-2">
            {[["all","All"],["active","Active"],["pending_signature","Pending"],["expiring","Expiring"],["expired","Expired"]].map(([s,l])=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-pill ${statusF===s?"tb-pill--active":""}`}>{l}</button>
            ))}
          </div>
          {(search||statusF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");}} className="tb-pill">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} contracts</span>
          <ExportButton data={toArr(raw)} filename="contracts" title="Contracts"/>
        </div>

        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📄</div>
              <div className="tb-empty-title">No contracts found</div>
              <div className="tb-empty-desc">Contracts are created from won leads</div>
              <button onClick={()=>router.push("/commercial/leads")} className="tb-hero-btn tb-hero-btn--primary mt-4">View Pipeline →</button>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 120px 130px 130px 130px"}}>
                {["Contract","Status","Value","Start Date","End Date"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((c,i)=>{
                const sc = STATUS_COLOR[c.status]||"#6D5F53";
                const daysLeft = c.end_date?Math.ceil((new Date(c.end_date)-Date.now())/86400000):null;
                const isExpiring = c.status==="active"&&daysLeft!==null&&daysLeft>=0&&daysLeft<=30;
                const isExpired  = c.status==="expired";
                return (
                  <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)}
                    className={`tb-table-row ${isExpiring?"":""}`}
                    style={{gridTemplateColumns:"1fr 120px 130px 130px 130px",background:isExpiring?"rgba(245,158,11,0.02)":""}}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary truncate">{c.title||`Contract ${c.id?.slice(0,8)}`}</div>
                      <div className="text-xs text-tertiary mt-0.5">{c.duration_months?`${c.duration_months} months`:"—"} · Renewal #{c.renewal_count||0}</div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>
                        {c.status?.replace("_"," ")||"—"}
                      </span>
                    </div>
                    <div className="text-center text-sm font-bold text-emerald-500">{fmtEGP(c.total_value)}</div>
                    <div className="text-center text-xs text-secondary">{fmtDate(c.start_date)}</div>
                    <div className={`text-center text-xs ${isExpiring?"text-amber-400 font-semibold":isExpired?"text-red-400":"text-secondary"}`}>
                      {fmtDate(c.end_date)}
                      {isExpiring&&daysLeft!==null&&<div className="text-xs" style={{fontSize:"0.5rem",textTransform:"uppercase"}}>{daysLeft}d LEFT</div>}
                    </div>
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

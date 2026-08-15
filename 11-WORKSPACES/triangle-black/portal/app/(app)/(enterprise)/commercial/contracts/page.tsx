"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate= (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  active:"#547C4D", pending_signature:"#B07A2A", expired:"#A84A3D", draft:"#6D5F53",
};

export default function ContractsPage() {
  const router = useRouter();
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["contracts-list"],()=>authFetch("/api/v1/contracts/").then(r=>r.json()),{refetchInterval:120000}
  );
  const contracts = toArr(raw);
  const now   = new Date();
  const in30  = new Date(now.getTime()+30*86400000);
  const in90  = new Date(now.getTime()+90*86400000);

  const active     = contracts.filter(c=>c.status==="active");
  const pending    = contracts.filter(c=>c.status==="pending_signature");
  const expired    = contracts.filter(c=>c.status==="expired");
  const expiring30 = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in30);
  const expiring90 = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in90);
  const totalValue = active.reduce((s,c)=>s+Number(c.total_value||0),0);

  const filtered = contracts.filter(c=>{
    const ms  = !search||c.title?.toLowerCase().includes(search.toLowerCase())||c.id?.slice(0,8).includes(search.toLowerCase());
    const mst = statusF==="all"||c.status===statusF||
      (statusF==="expiring"&&c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in30);
    return ms&&mst;
  });

  if (isLoading) return <div className="tb-canvas"><div className="tb-shimmer-block" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">Contracts</h1>
              <p className="tb-hero-description">{contracts.length} total · {active.length} active · {fmtEGP(totalValue)} portfolio value</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/customers/renewals")} className="tb-btn tb-btn-secondary">🔄 Renewals</button>
              <button onClick={()=>router.push("/commercial/leads")} className="tb-btn tb-btn-primary">+ New Contract</button>
            </div>
          </div>
          <div className="mt-6" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
            {[
              {label:"Active",       value:active.length,     color:"var(--color-success)",f:"active",       sub:fmtEGP(totalValue)},
              {label:"Pending Sign", value:pending.length,    color:"var(--color-warning)",f:"pending_signature",sub:"awaiting"},
              {label:"Expiring 30d", value:expiring30.length, color:expiring30.length>0?"var(--color-danger)":"var(--color-text-3)",f:"expiring",sub:"urgent"},
              {label:"Expiring 90d", value:expiring90.length, color:"var(--color-info)",  f:"expiring",     sub:"plan ahead"},
              {label:"Expired",      value:expired.length,    color:"var(--color-text-3)",f:"expired",      sub:"closed"},
            ].map((k,i)=>(
              <button key={i} onClick={()=>setStatusF(statusF===k.f?"all":k.f)} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.125rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {expiring30.length>0&&(
          <div className="tb-alert tb-alert-warning mb-4">
            <span className="text-xl">⏰</span>
            <div className="flex-1 text-sm font-bold">
              {expiring30.length} contract{expiring30.length>1?"s":""} expiring within 30 days — {expiring30.slice(0,2).map(c=>c.title||c.id?.slice(0,8)).join(" · ")}
            </div>
            <button onClick={()=>router.push("/customers/renewals")} className="tb-btn tb-btn-secondary tb-btn-sm ml-auto">Manage Renewals →</button>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contracts..."
            className="tb-input" style={{maxWidth:"320px"}}/>
          <div className="tb-tabs border-0 mb-0">
            {[["all","All"],["active","Active"],["pending_signature","Pending"],["expiring","Expiring"],["expired","Expired"]].map(([s,l])=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-tab ${statusF===s?"active":""}`}>{l}</button>
            ))}
          </div>
          {(search||statusF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} contracts</span>
          <ExportButton data={toArr(raw)} filename="contracts" title="Contracts"/>
        </div>

        <div className="tb-section">
          {filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">📄</div>
              <div className="tb-empty-title">No contracts found</div>
              <div className="tb-empty-desc">Contracts are created from won leads</div>
              <button onClick={()=>router.push("/commercial/leads")} className="tb-btn tb-btn-primary mt-4">View Pipeline →</button>
            </div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th style={{textAlign:"center"}}>Status</th>
                    <th style={{textAlign:"center"}}>Value</th>
                    <th style={{textAlign:"center"}}>Start Date</th>
                    <th style={{textAlign:"center"}}>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c,i)=>{
                    const sc       = STATUS_COLOR[c.status]||"#6D5F53";
                    const daysLeft = c.end_date?Math.ceil((new Date(c.end_date)-Date.now())/86400000):null;
                    const isExpiring= c.status==="active"&&daysLeft!==null&&daysLeft>=0&&daysLeft<=30;
                    const isExpired = c.status==="expired";
                    return (
                      <tr key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)} className="cursor-pointer">
                        <td>
                          <div className="text-sm font-semibold text-primary truncate">{c.title||`Contract ${c.id?.slice(0,8)}`}</div>
                          <div className="text-xs text-tertiary mt-0.5">{c.duration_months?`${c.duration_months} months`:"—"} · Renewal #{c.renewal_count||0}</div>
                        </td>
                        <td className="text-center">
                          <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>
                            {c.status?.replace("_"," ")||"—"}
                          </span>
                        </td>
                        <td className="text-center text-sm font-bold text-success">{fmtEGP(c.total_value)}</td>
                        <td className="text-center text-xs text-secondary">{fmtDate(c.start_date)}</td>
                        <td className="text-center">
                          <div className={`text-xs ${isExpiring?"text-warning font-semibold":isExpired?"text-danger":"text-secondary"}`}>
                            {fmtDate(c.end_date)}
                          </div>
                          {isExpiring&&daysLeft!==null&&(
                            <div className="text-xs text-warning font-bold" style={{fontSize:"0.5rem",textTransform:"uppercase"}}>{daysLeft}d LEFT</div>
                          )}
                        </td>
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

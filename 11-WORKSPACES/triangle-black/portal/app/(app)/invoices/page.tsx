"use client";
// @ts-nocheck
"use client";
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_CONFIG = {
  paid:      {color:"#34D399",bg:"rgba(16,185,129,0.1)",border:"rgba(16,185,129,0.2)"},
  pending:   {color:"#FBBF24",bg:"rgba(245,158,11,0.1)",border:"rgba(245,158,11,0.2)"},
  overdue:   {color:"#F87171",bg:"rgba(239,68,68,0.1)",border:"rgba(239,68,68,0.2)"},
  cancelled: {color:"#94A3B8",bg:"rgba(148,163,184,0.1)",border:"rgba(148,163,184,0.15)"},
};

export default function InvoicesPage() {
  const router = useRouter();
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["inv-all"], () => authFetch("/api/v1/invoices/").then(r=>r.json()), {refetchInterval:120000}
  );
  const invoices = toArr(raw);

  const paid      = invoices.filter(i=>i.status==="paid");
  const pending   = invoices.filter(i=>i.status==="pending");
  const overdue   = invoices.filter(i=>i.status==="overdue");
  const cancelled = invoices.filter(i=>i.status==="cancelled");

  const totalValue   = invoices.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const paidValue    = paid.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const pendingValue = pending.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const overdueValue = overdue.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const collRate     = totalValue>0?Math.round(paidValue/totalValue*100):0;

  const filtered = invoices.filter(inv => {
    const ms = !search||inv.invoice_number?.toLowerCase().includes(search.toLowerCase())||inv.id?.slice(0,8).includes(search);
    return ms && (statusF==="all"||inv.status===statusF);
  }).sort((a,b)=>{
    const o={overdue:0,pending:1,paid:2,cancelled:3};
    return (o[a.status]??2)-(o[b.status]??2);
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0A1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-500 mb-1.5">Finance</div>
              <h1 className="tb-hero-title">Invoice Management</h1>
              <p className="tb-hero-description">{invoices.length} invoices · {collRate}% collection rate · {fmtEGP(pendingValue+overdueValue)} outstanding</p>
            </div>
            <div className={`tb-score-badge ${collRate>=90?"tb-score-badge--success":"tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:collRate>=90?"#34D399":"#FBBF24"}}>{collRate}%</div>
              <div className="tb-score-label">Collection</div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Paid",       value:paid.length,      sub:fmtEGP(paidValue),    color:"#34D399", f:"paid"},
              {label:"Pending",    value:pending.length,   sub:fmtEGP(pendingValue), color:"#FBBF24", f:"pending"},
              {label:"Overdue",    value:overdue.length,   sub:fmtEGP(overdueValue), color:overdue.length>0?"#F87171":"#34D399", f:"overdue"},
              {label:"Cancelled",  value:cancelled.length, sub:"closed",             color:"#94A3B8", f:"cancelled"},
            ].map((k,i)=>{
              const act=statusF===k.f;
              return (
                <button key={i} onClick={()=>setStatusF(act?"all":k.f)}
                  className="tb-hero-kpi"
                  style={{background:act?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${act?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                  <div className="tb-hero-kpi-label" style={{marginTop:2,color:"rgba(255,255,255,0.3)",fontSize:"0.5rem"}}>{k.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Revenue progress */}
        <div className="tb-section">
          <div className="tb-flex-between mb-3">
            <div className="text-sm font-semibold text-primary">Revenue Collection</div>
            <div className="text-sm font-bold text-emerald-500">{fmtEGP(paidValue)} / {fmtEGP(totalValue)}</div>
          </div>
          <div className="tb-progress tb-progress--lg" style={{height:8}}>
            <div style={{display:"flex",height:"100%"}}>
              <div className="tb-progress-bar tb-progress-bar--success" style={{width:`${paidValue/Math.max(totalValue,1)*100}%`}}/>
              <div className="tb-progress-bar tb-progress-bar--warning" style={{width:`${pendingValue/Math.max(totalValue,1)*100}%`}}/>
              <div className="tb-progress-bar tb-progress-bar--danger"  style={{width:`${overdueValue/Math.max(totalValue,1)*100}%`}}/>
            </div>
          </div>
          <div className="flex gap-5 mt-2">
            {[{label:"Paid",color:"#34D399",value:fmtEGP(paidValue)},{label:"Pending",color:"#FBBF24",value:fmtEGP(pendingValue)},{label:"Overdue",color:"#F87171",value:fmtEGP(overdueValue)}].map((s,i)=>(
              <div key={i} className="flex items-center gap-1.5">
                <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>
                <span className="text-xs text-tertiary">{s.label}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {overdue.length > 0 && (
          <div className="tb-ai-insight" style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)"}}>
            <div className="tb-ai-insight-icon" style={{background:"rgba(239,68,68,0.15)"}}>💰</div>
            <div className="tb-ai-insight-text" style={{color:"#FCA5A5"}}>
              {overdue.length} Overdue Invoices — {fmtEGP(overdueValue)} uncollected. Contact clients immediately.
            </div>
            <button onClick={()=>setStatusF("overdue")} className="tb-ai-insight-action" style={{color:"#F87171",borderColor:"rgba(239,68,68,0.3)"}}>
              Show Overdue
            </button>
          </div>
        )}

        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by invoice number..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <div className="tb-flex-gap-2">
            {["all","overdue","pending","paid","cancelled"].map(s=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-pill ${statusF===s?"tb-pill--active":""}`}
                style={statusF===s&&STATUS_CONFIG[s]?{borderColor:STATUS_CONFIG[s].color,color:STATUS_CONFIG[s].color,background:STATUS_CONFIG[s].bg}:{}}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          {(search||statusF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");}} className="tb-pill">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} invoices</span>
          <ExportButton data={toArr(raw)} filename="invoices" title="Invoices"/>
        </div>

        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">💰</div>
              <div className="tb-empty-title">No invoices found</div>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 150px 140px 130px 120px"}}>
                {["Invoice","Status","Amount","Due Date","Created"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((inv,i)=>{
                const sc = STATUS_CONFIG[inv.status]||STATUS_CONFIG.cancelled;
                const isOv = inv.status==="overdue";
                return (
                  <button key={i} onClick={()=>router.push(`/invoices/${inv.id}`)}
                    className={`tb-table-row ${isOv?"tb-table-row--danger":""}`}
                    style={{gridTemplateColumns:"1fr 150px 140px 130px 120px"}}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary">{inv.invoice_number||`INV-${inv.id?.slice(0,8)}`}</div>
                      <div className="text-xs text-tertiary mt-0.5">ID: {inv.id?.slice(0,12)}...</div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,fontSize:"0.625rem"}}>{inv.status||"—"}</span>
                    </div>
                    <div className="text-center text-sm font-bold text-primary">{fmtEGP(inv.total_amount)}</div>
                    <div className={`text-center text-xs ${isOv?"text-red-400 font-bold":"text-secondary"}`}>
                      {fmtDate(inv.due_date)}
                      {isOv&&<div style={{fontSize:"0.5rem",textTransform:"uppercase"}}>OVERDUE</div>}
                    </div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(inv.created_at)}</div>
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

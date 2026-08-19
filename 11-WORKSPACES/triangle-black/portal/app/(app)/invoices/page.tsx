"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate= (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

export default function InvoicesPage() {
  const router = useRouter();
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["inv-all"],()=>authFetch("/api/v1/invoices/").then(r => r.json()),{refetchInterval:120000}
  );
  const invoices = toArr(raw);

  const paid      = invoices.filter((i: any) =>i.status==="paid");
  const pending   = invoices.filter((i: any) =>i.status==="pending");
  const overdue   = invoices.filter((i: any) =>i.status==="overdue");
  const cancelled = invoices.filter((i: any) =>i.status==="cancelled");
  const totalValue   = invoices.reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const paidValue    = paid.reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const pendingValue = pending.reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const overdueValue = overdue.reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const collRate     = totalValue>0?Math.round(paidValue/totalValue*100):0;

  const filtered = invoices.filter((inv: any) =>{
    const ms = !search||inv.invoice_number?.toLowerCase().includes(search.toLowerCase())||inv.id?.slice(0,8).includes(search);
    return ms&&(statusF==="all"||inv.status===statusF);
  }).sort((a: any, b: any) =>{const o={overdue:0,pending:1,paid:2,cancelled:3};return(o[a.status]??2)-(o[b.status]??2);});

  if (isLoading) return <div className="tb-canvas"><div className="tb-shimmer-block" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Finance</div>
              <h1 className="tb-hero-title">Invoice Management</h1>
              <p className="tb-hero-description">{invoices.length} invoices · {collRate}% collection rate · {fmtEGP(pendingValue+overdueValue)} outstanding</p>
            </div>
            <div className={`tb-section text-center flex-shrink-0 ${collRate>=90?"border-success/30":"border-warning/30"}`} style={{minWidth:"80px"}}>
              <div className={`text-2xl font-black ${collRate>=90?"text-success":"text-warning"}`}>{collRate}%</div>
              <div className="text-xs text-tertiary mt-0.5">Collection</div>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Paid",      value:paid.length,      sub:fmtEGP(paidValue),    f:"paid",      good:true},
              {label:"Pending",   value:pending.length,   sub:fmtEGP(pendingValue), f:"pending"},
              {label:"Overdue",   value:overdue.length,   sub:fmtEGP(overdueValue), f:"overdue",   danger:overdue.length>0},
              {label:"Cancelled", value:cancelled.length, sub:"closed",             f:"cancelled"},
            ].map((k: any, i: number) =>(
              <button key={i} onClick={()=>setStatusF(statusF===k.f?"all":k.f)} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.good?"var(--color-success)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
                <div className="text-xs opacity-50 mt-0.5" style={{fontSize:"0.5rem"}}>{k.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold text-primary">Revenue Collection</div>
            <div className="text-sm font-bold text-success">{fmtEGP(paidValue)} / {fmtEGP(totalValue)}</div>
          </div>
          <div className="tb-progress" style={{height:8}}>
            <div style={{display:"flex",height:"100%"}}>
              <div className="tb-progress-bar" style={{width:`${paidValue/Math.max(totalValue,1)*100}%`,background:"var(--color-success)"}}/>
              <div className="tb-progress-bar" style={{width:`${pendingValue/Math.max(totalValue,1)*100}%`,background:"var(--color-warning)"}}/>
              <div className="tb-progress-bar" style={{width:`${overdueValue/Math.max(totalValue,1)*100}%`,background:"var(--color-danger)"}}/>
            </div>
          </div>
          <div className="flex gap-5 mt-2">
            {[{label:"Paid",color:"var(--color-success)",value:fmtEGP(paidValue)},{label:"Pending",color:"var(--color-warning)",value:fmtEGP(pendingValue)},{label:"Overdue",color:"var(--color-danger)",value:fmtEGP(overdueValue)}].map((s: any, i: number) =>(
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{background:s.color}}/>
                <span className="text-xs text-tertiary">{s.label}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {overdue.length>0&&(
          <div className="tb-alert tb-alert-danger mb-4">
            <div className="text-lg">💰</div>
            <div className="flex-1 text-sm">{overdue.length} Overdue Invoices — {fmtEGP(overdueValue)} uncollected. Contact clients immediately.</div>
            <button onClick={()=>setStatusF("overdue")} className="tb-btn tb-btn-danger tb-btn-sm">Show Overdue</button>
          </div>
        )}

        <div className="flex gap-3 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search by invoice number..."
            className="tb-input" style={{maxWidth:"320px"}}/>
          <div className="tb-tabs border-0 mb-0">
            {["all","overdue","pending","paid","cancelled"].map((s: any) =>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-tab ${statusF===s?"active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          {(search||statusF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} invoices</span>
          <ExportButton data={toArr(raw)} filename="invoices" title="Invoices"/>
        </div>

        <div className="tb-section">
          {filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">💰</div><div className="tb-empty-title">No invoices found</div></div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th style={{textAlign:"center"}}>Status</th>
                    <th style={{textAlign:"right"}}>Amount</th>
                    <th style={{textAlign:"center"}}>Due Date</th>
                    <th style={{textAlign:"center"}}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv: any, i: any) =>{
                    const isOv = inv.status==="overdue";
                    return (
                      <tr key={i} onClick={()=>router.push(`/invoices/${inv.id}`)} className="cursor-pointer">
                        <td>
                          <div className="text-sm font-semibold text-primary">{inv.invoice_number||`INV-${inv.id?.slice(0,8)}`}</div>
                          <div className="text-xs text-tertiary mt-0.5">ID: {inv.id?.slice(0,12)}...</div>
                        </td>
                        <td className="text-center">
                          <span className={`tb-badge ${inv.status==="paid"?"tb-badge-success":inv.status==="overdue"?"tb-badge-danger":inv.status==="pending"?"tb-badge-warning":"tb-badge-neutral"}`} style={{fontSize:"10px"}}>
                            {inv.status||"—"}
                          </span>
                        </td>
                        <td className="text-right text-sm font-bold text-primary">{fmtEGP(inv.total_amount)}</td>
                        <td className={`text-center text-xs ${isOv?"text-danger font-bold":"text-secondary"}`}>
                          {fmtDate(inv.due_date)}
                          {isOv&&<div className="text-danger font-bold" style={{fontSize:"0.5rem",textTransform:"uppercase"}}>OVERDUE</div>}
                        </td>
                        <td className="text-center text-xs text-tertiary">{fmtDate(inv.created_at)}</td>
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

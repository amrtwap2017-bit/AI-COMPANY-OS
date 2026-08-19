"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP  = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

function printReport(title: any, content: any) {
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;color:#332C27;padding:32px}h1{font-size:22px;font-weight:900;border-bottom:2px solid #E2E8F0;padding-bottom:12px;margin-bottom:20px}h2{font-size:16px;font-weight:700;margin:20px 0 8px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#F8FAFC;padding:8px 10px;text-align:left;font-size:11px;border-bottom:2px solid #E2E8F0}td{padding:7px 10px;border-bottom:1px solid #221D1A;font-size:12px}.kpi{display:inline-block;margin:6px 12px 6px 0;padding:10px 16px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0}.kpi-val{font-size:20px;font-weight:900;color:#221D1A}.kpi-lbl{font-size:10px;color:#64748B;text-transform:uppercase}.header{display:flex;justify-content:space-between;margin-bottom:24px}.company{font-size:18px;font-weight:900}</style></head><body>
<div class="header"><div><div class="company">🔺 Triangle Black</div><div style="color:#64748B;font-size:11px">Engineering Operations Platform</div></div><div style="text-align:right;font-size:11px;color:#64748B">Generated: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div></div>
<h1>${title}</h1>${content}</body></html>`;
  const w = window.open("","_blank","width=900,height=1100");
  if (!w) return;
  w.document.write(html); w.document.close(); w.focus();
  setTimeout(()=>w.print(),500);
}

export default function ExecutiveReportsPage() {
  const router = useRouter();
  const [activeReport, setActiveReport] = useState("daily");

  const { data: daily }    = useQuery(["rpt-daily"],     ()=>authFetch("/api/v1/reports/daily-summary").then(r => r.data ?? r), {staleTime:60000});
  const { data: woReport } = useQuery(["rpt-wo"],        ()=>authFetch("/api/v1/reports/work-orders").then(r => r.data ?? r),   {staleTime:120000});
  const { data: assetRpt } = useQuery(["rpt-assets"],    ()=>authFetch("/api/v1/reports/assets").then(r => r.data ?? r),        {staleTime:120000});
  const { data: contRpt }  = useQuery(["rpt-contracts"], ()=>authFetch("/api/v1/reports/contracts").then(r => r.data ?? r),     {staleTime:120000});

  const woSum = woReport?.summary||{};
  const aSum  = assetRpt?.summary||{};
  const cSum  = contRpt?.summary||{};
  const dWO   = daily?.work_orders||{};
  const dMaint= daily?.maintenance||{};
  const dFin  = daily?.finance||{};

  const handlePrint = (type) => {
    if (type==="daily"&&daily) {
      printReport("Daily Operations Summary — "+(daily.date||""),`<h2>Work Orders</h2><div><div class="kpi"><div class="kpi-val">${dWO.open_total||0}</div><div class="kpi-lbl">Open</div></div><div class="kpi"><div class="kpi-val">${dWO.critical_open||0}</div><div class="kpi-lbl">Critical</div></div><div class="kpi"><div class="kpi-val">${dWO.created_today||0}</div><div class="kpi-lbl">Created Today</div></div><div class="kpi"><div class="kpi-val">${dWO.completed_today||0}</div><div class="kpi-lbl">Completed Today</div></div></div><h2>Finance</h2><div><div class="kpi"><div class="kpi-val">EGP ${Number(dFin.collected||0).toLocaleString()}</div><div class="kpi-lbl">Collected</div></div></div>`);
    } else if (type==="work-orders"&&woReport) {
      const rows=toArr(woReport.recent);
      printReport("Work Orders Report",`<h2>Summary</h2><div><div class="kpi"><div class="kpi-val">${woSum.total||0}</div><div class="kpi-lbl">Total</div></div></div><h2>Recent Work Orders</h2><table><thead><tr><th>Title</th><th>Priority</th><th>Status</th><th>Technician</th><th>Date</th></tr></thead><tbody>${rows.map((w: any) =>`<tr><td>${w.title||""}</td><td>${w.priority||""}</td><td>${w.status||""}</td><td>${w.technician_name||"—"}</td><td>${new Date(w.created_at).toLocaleDateString("en-GB")}</td></tr>`).join("")}</tbody></table>`);
    } else if (type==="assets"&&assetRpt) {
      const rows=toArr(assetRpt.assets);
      printReport("Asset Register",`<h2>Summary</h2><div><div class="kpi"><div class="kpi-val">${aSum.total||0}</div><div class="kpi-lbl">Total</div></div></div><h2>Asset Register</h2><table><thead><tr><th>Asset</th><th>Category</th><th>Status</th><th>Location</th><th>WOs</th></tr></thead><tbody>${rows.map((a: any) =>`<tr><td>${a.name||""}</td><td>${a.category||""}</td><td>${a.status||""}</td><td>${a.location||"—"}</td><td>${a.total_wos||0}</td></tr>`).join("")}</tbody></table>`);
    } else if (type==="contracts"&&contRpt) {
      const rows=toArr(contRpt.contracts);
      printReport("Contracts Portfolio",`<h2>Summary</h2><div><div class="kpi"><div class="kpi-val">${cSum.active||0}</div><div class="kpi-lbl">Active</div></div></div><h2>Contracts</h2><table><thead><tr><th>Title</th><th>Status</th><th>Value</th><th>End Date</th></tr></thead><tbody>${rows.map((c: any) =>`<tr><td>${c.title||""}</td><td>${c.status||""}</td><td>EGP ${Number(c.total_value||0).toLocaleString()}</td><td>${c.end_date?new Date(c.end_date).toLocaleDateString("en-GB"):"—"}</td></tr>`).join("")}</tbody></table>`);
    }
  };

  const REPORTS = [
    {id:"daily",       label:"Daily Summary",  icon:"☀️",  desc:"Today's KPIs, WOs, alerts"},
    {id:"work-orders", label:"Work Orders",     icon:"🔧",  desc:"All WO analysis and history"},
    {id:"assets",      label:"Asset Register",  icon:"⚙️",  desc:"Complete asset inventory"},
    {id:"contracts",   label:"Contracts",       icon:"📄",  desc:"Portfolio with expiry dates"},
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Executive</div>
              <h1 className="tb-hero-title">Reports</h1>
              <p className="tb-hero-description">Generate and print enterprise reports</p>
            </div>
            <button onClick={()=>router.push("/executive")} className="tb-btn tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"WOs Total",       value:woSum.total||0},
              {label:"Assets",          value:aSum.total||0},
              {label:"Active Contracts",value:cSum.active||0},
              {label:"Critical Open",   value:dWO.critical_open||0,danger:(dWO.critical_open||0)>0},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section mb-4">
          <div className="tb-section-title">Available Reports</div>
          <div className="tb-grid-4">
            {REPORTS.map((r: any, i: number) =>(
              <button key={i} onClick={()=>setActiveReport(r.id)}
                className={`tb-section text-left tb-hover-lift cursor-pointer ${activeReport===r.id?"border-brand bg-surface":""}`}>
                <div className="text-3xl mb-2">{r.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{r.label}</div>
                <div className="text-xs text-tertiary">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {activeReport==="daily"&&daily&&(
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Daily Operations</div>
                <div className="tb-section-title" style={{margin:0}}>Summary — {daily.date}</div>
              </div>
              <button onClick={()=>handlePrint("daily")} className="tb-btn tb-btn-primary">🖨️ Print PDF</button>
            </div>
            <div className="tb-grid-4 mb-4">
              {[{label:"Open WOs",value:dWO.open_total||0},{label:"Critical WOs",value:dWO.critical_open||0,danger:(dWO.critical_open||0)>0},{label:"Created Today",value:dWO.created_today||0},{label:"Overdue PMs",value:dMaint.overdue_pms||0,danger:(dMaint.overdue_pms||0)>0},{label:"Collected",value:fmtEGP(dFin.collected)},{label:"Pending",value:fmtEGP(dFin.pending)},{label:"Unread Alerts",value:(daily.alerts||[]).length},{label:"Due This Week",value:dMaint.due_this_week||0}].map((k: any, i: number) =>(
                <div key={i} className="p-3 bg-surface-alt rounded-xl text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.danger&&k.value>0?"var(--color-danger)":"var(--color-text-1)"}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            {(daily.alerts||[]).length>0&&(
              <div className="mt-4">
                <div className="text-xs text-tertiary mb-2">Recent Alerts</div>
                <div className="flex flex-col gap-1">
                  {(daily.alerts||[]).slice(0,5).map((a: any, i: number) =>(
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-alt">
                      <span className="text-xs font-bold text-brand">{a.type||"info"}</span>
                      <span className="text-xs text-secondary truncate">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeReport==="work-orders"&&woReport&&(
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{margin:0}}>Work Orders Report</div>
              <button onClick={()=>handlePrint("work-orders")} className="tb-btn tb-btn-primary">🖨️ Print PDF</button>
            </div>
            <div className="tb-grid-4 mb-4">
              {[{label:"Total",value:woSum.total||0},{label:"Completed",value:woSum.completed||0,good:true},{label:"Open",value:woSum.open_count||0},{label:"Avg Resolve",value:(Math.round(woSum.avg_resolution_hours||0))+"h"}].map((k: any, i: number) =>(
                <div key={i} className="p-3 bg-surface-alt rounded-xl text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.good?"var(--color-success)":"var(--color-text-1)"}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Work Order</th><th style={{textAlign:"center"}}>Priority</th><th style={{textAlign:"center"}}>Status</th><th>Technician</th><th>Date</th></tr></thead>
                <tbody>
                  {toArr(woReport.recent).slice(0,10).map((w: any, i: number) =>(
                    <tr key={i}>
                      <td className="font-medium text-sm text-primary truncate">{w.title||"—"}</td>
                      <td className="text-center"><span className={`tb-badge ${w.priority==="critical"?"tb-badge-danger":w.priority==="high"?"tb-badge-warning":"tb-badge-neutral"}`} style={{fontSize:"9px"}}>{w.priority}</span></td>
                      <td className="text-center text-xs text-secondary">{(w.status||"").replace("_"," ")}</td>
                      <td className="text-xs text-secondary">{w.technician_name||"—"}</td>
                      <td className="text-xs text-tertiary">{fmtDate(w.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport==="assets"&&assetRpt&&(
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{margin:0}}>Asset Register ({toArr(assetRpt.assets).length} assets)</div>
              <button onClick={()=>handlePrint("assets")} className="tb-btn tb-btn-primary">🖨️ Print PDF</button>
            </div>
            <div className="tb-grid-4 mb-4">
              {[{label:"Total",value:aSum.total||0},{label:"Operational",value:aSum.operational||0,good:true},{label:"In Fault",value:aSum.faulted||0,danger:(aSum.faulted||0)>0},{label:"Categories",value:aSum.categories||0}].map((k: any, i: number) =>(
                <div key={i} className="p-3 bg-surface-alt rounded-xl text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.good?"var(--color-success)":k.danger&&k.value>0?"var(--color-danger)":"var(--color-text-1)"}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Asset</th><th>Category</th><th>Status</th><th>Location</th><th style={{textAlign:"center"}}>WOs</th></tr></thead>
                <tbody>
                  {toArr(assetRpt.assets).slice(0,15).map((a: any, i: number) =>(
                    <tr key={i}>
                      <td className="font-medium text-sm text-primary">{a.name||"—"}</td>
                      <td className="text-xs text-secondary">{a.category||"—"}</td>
                      <td><span className={`tb-badge ${a.status==="Operational"?"tb-badge-success":a.status==="In Fault"?"tb-badge-danger":"tb-badge-warning"}`} style={{fontSize:"9px"}}>{a.status||"—"}</span></td>
                      <td className="text-xs text-tertiary">{a.location||"—"}</td>
                      <td className="text-center text-sm font-bold text-primary">{a.total_wos||0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport==="contracts"&&contRpt&&(
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{margin:0}}>Contracts Portfolio</div>
              <button onClick={()=>handlePrint("contracts")} className="tb-btn tb-btn-primary">🖨️ Print PDF</button>
            </div>
            <div className="tb-grid-4 mb-4">
              {[{label:"Active",value:cSum.active||0,good:true},{label:"Portfolio",value:fmtEGP(cSum.active_value)},{label:"Expiring 30d",value:cSum.expiring_30d||0,danger:(cSum.expiring_30d||0)>0},{label:"Expired",value:cSum.expired||0}].map((k: any, i: number) =>(
                <div key={i} className="p-3 bg-surface-alt rounded-xl text-center">
                  <div className="text-lg font-black mb-1" style={{color:k.good?"var(--color-success)":k.danger&&k.value>0?"var(--color-danger)":"var(--color-text-1)"}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Contract</th><th>Status</th><th style={{textAlign:"right"}}>Value</th><th>Expires</th><th style={{textAlign:"center"}}>Days Left</th></tr></thead>
                <tbody>
                  {toArr(contRpt.contracts).slice(0,15).map((c: any, i: number) =>{
                    const days=Math.round(c.days_remaining||0);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="text-sm font-medium text-primary truncate">{c.title||"—"}</div>
                          <div className="text-xs text-tertiary">{c.client_name||"—"}</div>
                        </td>
                        <td><span className={`tb-badge ${c.status==="active"?"tb-badge-success":c.status==="expired"?"tb-badge-danger":"tb-badge-warning"}`} style={{fontSize:"9px"}}>{c.status}</span></td>
                        <td className="text-right font-bold text-success">{fmtEGP(c.total_value||0)}</td>
                        <td className="text-xs text-tertiary">{fmtDate(c.end_date)}</td>
                        <td className="text-center text-xs font-bold" style={{color:days<30&&days>0?"var(--color-danger)":days<=0?"var(--color-text-3)":"var(--color-success)"}}>{days>0?days+"d":"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

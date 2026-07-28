"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

function printReport(title, content) {
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#1E293B;padding:32px}
  h1{font-size:22px;font-weight:900;border-bottom:2px solid #E2E8F0;padding-bottom:12px;margin-bottom:20px}
  h2{font-size:16px;font-weight:700;margin:20px 0 8px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#F8FAFC;padding:8px 10px;text-align:left;font-size:11px;border-bottom:2px solid #E2E8F0}
  td{padding:7px 10px;border-bottom:1px solid #F1F5F9;font-size:12px}
  .kpi{display:inline-block;margin:6px 12px 6px 0;padding:10px 16px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0}
  .kpi-val{font-size:20px;font-weight:900;color:#0F172A}
  .kpi-lbl{font-size:10px;color:#64748B;text-transform:uppercase}
  .header{display:flex;justify-content:space-between;margin-bottom:24px}
  .company{font-size:18px;font-weight:900}
  @media print{body{padding:16px}}
</style></head><body>
<div class="header">
  <div><div class="company">🔺 Triangle Black</div><div style="color:#64748B;font-size:11px">Engineering Operations Platform</div></div>
  <div style="text-align:right;font-size:11px;color:#64748B">Generated: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}</div>
</div>
<h1>${title}</h1>
${content}
</body></html>`;
  const w = window.open("","_blank","width=900,height=1100");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

export default function ReportsPage() {
  const router = useRouter();
  const [activeReport, setActiveReport] = useState("daily");

  const { data: daily }     = useQuery(["rpt-daily"],    () => authFetch("/api/v1/reports/daily-summary").then(r=>r.json()), { staleTime:60000 });
  const { data: woReport }  = useQuery(["rpt-wo"],       () => authFetch("/api/v1/reports/work-orders").then(r=>r.json()),   { staleTime:120000 });
  const { data: assetRpt }  = useQuery(["rpt-assets"],   () => authFetch("/api/v1/reports/assets").then(r=>r.json()),        { staleTime:120000 });
  const { data: contRpt }   = useQuery(["rpt-contracts"],() => authFetch("/api/v1/reports/contracts").then(r=>r.json()),     { staleTime:120000 });

  const woSum   = woReport?.summary   || {};
  const aSum    = assetRpt?.summary   || {};
  const cSum    = contRpt?.summary    || {};
  const dWO     = daily?.work_orders  || {};
  const dMaint  = daily?.maintenance  || {};
  const dFin    = daily?.finance      || {};

  const handlePrint = (type) => {
    if (type === "daily" && daily) {
      printReport("Daily Operations Summary — " + (daily.date||""), `
        <h2>Work Orders</h2>
        <div>
          <div class="kpi"><div class="kpi-val">${dWO.open_total||0}</div><div class="kpi-lbl">Open</div></div>
          <div class="kpi"><div class="kpi-val">${dWO.critical_open||0}</div><div class="kpi-lbl">Critical</div></div>
          <div class="kpi"><div class="kpi-val">${dWO.created_today||0}</div><div class="kpi-lbl">Created Today</div></div>
          <div class="kpi"><div class="kpi-val">${dWO.completed_today||0}</div><div class="kpi-lbl">Completed Today</div></div>
        </div>
        <h2>Maintenance</h2>
        <div>
          <div class="kpi"><div class="kpi-val">${dMaint.overdue_pms||0}</div><div class="kpi-lbl">Overdue PMs</div></div>
          <div class="kpi"><div class="kpi-val">${dMaint.due_this_week||0}</div><div class="kpi-lbl">Due This Week</div></div>
        </div>
        <h2>Finance</h2>
        <div>
          <div class="kpi"><div class="kpi-val">EGP ${Number(dFin.collected||0).toLocaleString()}</div><div class="kpi-lbl">Collected</div></div>
          <div class="kpi"><div class="kpi-val">EGP ${Number(dFin.pending||0).toLocaleString()}</div><div class="kpi-lbl">Pending</div></div>
        </div>
        <h2>Unread Alerts (${(daily.alerts||[]).length})</h2>
        <table><thead><tr><th>Title</th><th>Type</th><th>Message</th></tr></thead><tbody>
          ${(daily.alerts||[]).map(a=>`<tr><td>${a.title||""}</td><td>${a.type||""}</td><td>${a.message||""}</td></tr>`).join("")}
        </tbody></table>
      `);
    } else if (type === "work-orders" && woReport) {
      const rows = toArr(woReport.recent);
      printReport("Work Orders Report", `
        <h2>Summary</h2>
        <div>
          <div class="kpi"><div class="kpi-val">${woSum.total||0}</div><div class="kpi-lbl">Total</div></div>
          <div class="kpi"><div class="kpi-val">${woSum.completed||0}</div><div class="kpi-lbl">Completed</div></div>
          <div class="kpi"><div class="kpi-val">${woSum.open_count||0}</div><div class="kpi-lbl">Open</div></div>
          <div class="kpi"><div class="kpi-val">${woSum.critical||0}</div><div class="kpi-lbl">Critical</div></div>
          <div class="kpi"><div class="kpi-val">${Math.round(woSum.avg_resolution_hours||0)}h</div><div class="kpi-lbl">Avg Resolution</div></div>
        </div>
        <h2>Recent Work Orders</h2>
        <table><thead><tr><th>Title</th><th>Priority</th><th>Status</th><th>Technician</th><th>Asset</th><th>Date</th></tr></thead>
        <tbody>${rows.map(w=>`<tr><td>${w.title||""}</td><td>${w.priority||""}</td><td>${w.status||""}</td><td>${w.technician_name||"—"}</td><td>${w.asset_name||"—"}</td><td>${new Date(w.created_at).toLocaleDateString("en-GB")}</td></tr>`).join("")}</tbody></table>
      `);
    } else if (type === "assets" && assetRpt) {
      const rows = toArr(assetRpt.assets);
      printReport("Asset Register", `
        <h2>Summary</h2>
        <div>
          <div class="kpi"><div class="kpi-val">${aSum.total||0}</div><div class="kpi-lbl">Total</div></div>
          <div class="kpi"><div class="kpi-val">${aSum.operational||0}</div><div class="kpi-lbl">Operational</div></div>
          <div class="kpi"><div class="kpi-val">${aSum.faulted||0}</div><div class="kpi-lbl">In Fault</div></div>
          <div class="kpi"><div class="kpi-val">${aSum.categories||0}</div><div class="kpi-lbl">Categories</div></div>
        </div>
        <h2>Asset Register (${rows.length} assets)</h2>
        <table><thead><tr><th>Asset</th><th>Category</th><th>Status</th><th>Location</th><th>Manufacturer</th><th>Last Maintenance</th><th>WOs</th></tr></thead>
        <tbody>${rows.map(a=>`<tr><td>${a.name||""}</td><td>${a.category||""}</td><td>${a.status||""}</td><td>${a.location||"—"}</td><td>${a.manufacturer||"—"}</td><td>${a.last_maintenance_date?new Date(a.last_maintenance_date).toLocaleDateString("en-GB"):"—"}</td><td>${a.total_wos||0}</td></tr>`).join("")}</tbody></table>
      `);
    } else if (type === "contracts" && contRpt) {
      const rows = toArr(contRpt.contracts);
      printReport("Contracts Portfolio", `
        <h2>Summary</h2>
        <div>
          <div class="kpi"><div class="kpi-val">${cSum.active||0}</div><div class="kpi-lbl">Active</div></div>
          <div class="kpi"><div class="kpi-val">EGP ${Number(cSum.active_value||0).toLocaleString()}</div><div class="kpi-lbl">Portfolio Value</div></div>
          <div class="kpi"><div class="kpi-val">${cSum.expiring_30d||0}</div><div class="kpi-lbl">Expiring 30d</div></div>
          <div class="kpi"><div class="kpi-val">${cSum.expired||0}</div><div class="kpi-lbl">Expired</div></div>
        </div>
        <h2>Contracts (${rows.length})</h2>
        <table><thead><tr><th>Title</th><th>Client</th><th>Status</th><th>Value</th><th>Start</th><th>End</th><th>Days Left</th></tr></thead>
        <tbody>${rows.map(c=>`<tr><td>${c.title||""}</td><td>${c.client_name||"—"}</td><td>${c.status||""}</td><td>EGP ${Number(c.total_value||0).toLocaleString()}</td><td>${c.start_date?new Date(c.start_date).toLocaleDateString("en-GB"):"—"}</td><td>${c.end_date?new Date(c.end_date).toLocaleDateString("en-GB"):"—"}</td><td>${Math.round(c.days_remaining||0)}</td></tr>`).join("")}</tbody></table>
      `);
    }
  };

  const REPORTS = [
    { id:"daily",      label:"Daily Summary",    icon:"☀️",  desc:"Today's KPIs, WOs, alerts" },
    { id:"work-orders",label:"Work Orders",       icon:"🔧", desc:"All WO analysis and history" },
    { id:"assets",     label:"Asset Register",    icon:"⚙️",  desc:"Complete asset inventory" },
    { id:"contracts",  label:"Contracts",         icon:"📄", desc:"Portfolio with expiry dates" },
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0A28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
              <h1 className="tb-hero-title">Reports</h1>
              <p className="tb-hero-description">Generate and print enterprise reports</p>
            </div>
            <button onClick={()=>router.push("/executive")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"WOs Total",     value:woSum.total||0,          color:"#60A5FA"},
              {label:"Assets",        value:aSum.total||0,           color:"#34D399"},
              {label:"Active Conts",  value:cSum.active||0,          color:"#A78BFA"},
              {label:"Critical Open", value:dWO.critical_open||0,    color:dWO.critical_open>0?"#F87171":"#34D399"},
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
        <div className="tb-section">
          <div className="tb-section-title">Available Reports</div>
          <div className="tb-grid-4">
            {REPORTS.map((r,i)=>(
              <button key={i} onClick={()=>setActiveReport(r.id)}
                className={"tb-section text-left transition-colors " + (activeReport===r.id?"border-brand bg-brand/5":"")}
                style={activeReport===r.id?{borderColor:"#2563EB"}:{}}>
                <div style={{fontSize:"1.75rem",marginBottom:8}}>{r.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{r.label}</div>
                <div className="text-xs text-tertiary">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Summary */}
        {activeReport==="daily" && daily && (
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Daily Operations</div>
                <div className="tb-section-title" style={{marginBottom:0}}>Summary — {daily.date}</div>
              </div>
              <button onClick={()=>handlePrint("daily")} className="tb-btn-primary" style={{fontSize:"0.875rem",padding:"8px 16px"}}>
                🖨️ Print PDF
              </button>
            </div>
            <div className="tb-grid-4 mt-4">
              {[
                {label:"Open WOs",      value:dWO.open_total||0,         color:"#60A5FA"},
                {label:"Critical WOs",  value:dWO.critical_open||0,      color:dWO.critical_open>0?"#F87171":"#34D399"},
                {label:"Created Today", value:dWO.created_today||0,      color:"#FBBF24"},
                {label:"Overdue PMs",   value:dMaint.overdue_pms||0,     color:dMaint.overdue_pms>0?"#F87171":"#34D399"},
                {label:"Collected",     value:fmtEGP(dFin.collected),    color:"#34D399"},
                {label:"Pending",       value:fmtEGP(dFin.pending),      color:"#FBBF24"},
                {label:"Unread Alerts", value:(daily.alerts||[]).length, color:"#A78BFA"},
                {label:"Due This Week", value:dMaint.due_this_week||0,   color:"#60A5FA"},
              ].map((k,i)=>(
                <div key={i} className="bg-base-alt rounded-xl p-3 text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            {(daily.alerts||[]).length>0&&(
              <div className="mt-4">
                <div className="text-xs text-tertiary mb-2">Recent Alerts</div>
                <div className="space-y-1">
                  {(daily.alerts||[]).slice(0,5).map((a,i)=>(
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-base-alt">
                      <span className="text-xs font-bold" style={{color:"#A78BFA"}}>{a.type||"info"}</span>
                      <span className="text-xs text-secondary truncate">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Work Orders Report */}
        {activeReport==="work-orders" && woReport && (
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Work Orders Report</div>
              <button onClick={()=>handlePrint("work-orders")} className="tb-btn-primary" style={{fontSize:"0.875rem",padding:"8px 16px"}}>
                🖨️ Print PDF
              </button>
            </div>
            <div className="tb-grid-4 mt-4">
              {[
                {label:"Total",       value:woSum.total||0,                                            color:"#F1F5F9"},
                {label:"Completed",   value:woSum.completed||0,                                        color:"#34D399"},
                {label:"Open",        value:woSum.open_count||0,                                       color:"#60A5FA"},
                {label:"Avg Resolve", value:(Math.round(woSum.avg_resolution_hours||0))+"h",           color:"#FBBF24"},
              ].map((k,i)=>(
                <div key={i} className="bg-base-alt rounded-xl p-3 text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="tb-table mt-4" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 80px 90px 130px 120px"}}>
                {["Work Order","Priority","Status","Technician","Date"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {toArr(woReport.recent).slice(0,10).map((w,i)=>{
                const pc={critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#94A3B8"}[w.priority]||"#94A3B8";
                return (
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"2fr 80px 90px 130px 120px"}}>
                    <div className="text-sm font-medium text-primary truncate pr-4">{w.title||"—"}</div>
                    <div className="text-center"><span className="tb-badge" style={{background:pc+"18",color:pc,fontSize:"0.5625rem"}}>{w.priority}</span></div>
                    <div className="text-center text-xs text-secondary">{(w.status||"").replace("_"," ")}</div>
                    <div className="text-center text-xs text-secondary truncate px-1">{w.technician_name||"—"}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(w.created_at)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assets Report */}
        {activeReport==="assets" && assetRpt && (
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Asset Register ({toArr(assetRpt.assets).length} assets)</div>
              <button onClick={()=>handlePrint("assets")} className="tb-btn-primary" style={{fontSize:"0.875rem",padding:"8px 16px"}}>
                🖨️ Print PDF
              </button>
            </div>
            <div className="tb-grid-4 mt-4">
              {[
                {label:"Total",            value:aSum.total||0,        color:"#F1F5F9"},
                {label:"Operational",      value:aSum.operational||0,  color:"#34D399"},
                {label:"In Fault",         value:aSum.faulted||0,      color:aSum.faulted>0?"#F87171":"#34D399"},
                {label:"Categories",       value:aSum.categories||0,   color:"#60A5FA"},
              ].map((k,i)=>(
                <div key={i} className="bg-base-alt rounded-xl p-3 text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="tb-table mt-4" style={{borderRadius:12,overflowX:"auto"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 100px 100px 120px 80px",minWidth:550}}>
                {["Asset","Category","Status","Location","WOs"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {toArr(assetRpt.assets).slice(0,15).map((a,i)=>{
                const sc={"Operational":"#34D399","In Fault":"#F87171","Under Maintenance":"#FBBF24"}[a.status]||"#94A3B8";
                return (
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"2fr 100px 100px 120px 80px",minWidth:550}}>
                    <div className="text-sm font-medium text-primary truncate pr-4">{a.name||"—"}</div>
                    <div className="text-center text-xs text-secondary">{a.category||"—"}</div>
                    <div className="text-center"><span className="tb-badge" style={{background:sc+"18",color:sc,fontSize:"0.5rem"}}>{a.status||"—"}</span></div>
                    <div className="text-center text-xs text-tertiary truncate px-1">{a.location||"—"}</div>
                    <div className="text-center text-sm font-bold text-primary">{a.total_wos||0}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contracts Report */}
        {activeReport==="contracts" && contRpt && (
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Contracts Portfolio</div>
              <button onClick={()=>handlePrint("contracts")} className="tb-btn-primary" style={{fontSize:"0.875rem",padding:"8px 16px"}}>
                🖨️ Print PDF
              </button>
            </div>
            <div className="tb-grid-4 mt-4">
              {[
                {label:"Active",      value:cSum.active||0,                                      color:"#34D399"},
                {label:"Portfolio",   value:fmtEGP(cSum.active_value),                          color:"#FBBF24"},
                {label:"Expiring 30d",value:cSum.expiring_30d||0,                               color:cSum.expiring_30d>0?"#F87171":"#34D399"},
                {label:"Expired",     value:cSum.expired||0,                                    color:"#94A3B8"},
              ].map((k,i)=>(
                <div key={i} className="bg-base-alt rounded-xl p-3 text-center">
                  <div className="text-xl font-black mb-1" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
                  <div className="text-xs text-tertiary">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="tb-table mt-4" style={{borderRadius:12,overflowX:"auto"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 90px 120px 110px 80px",minWidth:550}}>
                {["Contract","Status","Value","Expires","Days Left"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {toArr(contRpt.contracts).slice(0,15).map((c,i)=>{
                const sc={active:"#34D399",expired:"#F87171",pending:"#FBBF24"}[c.status]||"#94A3B8";
                const days = Math.round(c.days_remaining||0);
                return (
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"2fr 90px 120px 110px 80px",minWidth:550}}>
                    <div className="flex items-center gap-2 pr-4 min-w-0">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-primary truncate">{c.title||"—"}</div>
                        <div className="text-xs text-tertiary truncate">{c.client_name||"—"}</div>
                      </div>
                    </div>
                    <div className="text-center"><span className="tb-badge" style={{background:sc+"18",color:sc,fontSize:"0.5625rem"}}>{c.status}</span></div>
                    <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(c.total_value||0)}</div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(c.end_date)}</div>
                    <div className="text-center text-xs font-bold" style={{color:days<30&&days>0?"#F87171":days<=0?"#94A3B8":"#34D399"}}>{days>0?days+"d":"—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

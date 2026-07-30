"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => { if (n===null||n===undefined||n==="") return "—"; return "EGP " + Number(n||0).toLocaleString(); };
const fmtNum = (n) => { if (n===null||n===undefined) return "—"; return Number(n||0).toLocaleString(); };
const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const fmtBool = (v) => v===true||v==="true"||v===1 ? "✅ Yes" : "❌ No";

const CATEGORIES = ["All","Operations","Financial","Procurement","Engineering","Executive"];
const CAT_COLORS = {Operations:"#547C4D",Financial:"#5B7C8C",Procurement:"#B07A2A",Engineering:"#8D7443",Executive:"#B07A2A"};

function formatCellValue(col, value) {
  if (value === null || value === undefined) return "—";
  const v = String(value);
  if (col.includes("amount")||col.includes("value")||col.includes("budget")||col.includes("cost")||col.includes("outstanding")||col.includes("paid")||col.includes("invoiced")||col.includes("bid")||col.includes("subtotal")) return fmtEGP(value);
  if (col.includes("date")||col.includes("_at")) return fmtDate(value);
  if (col==="is_approved"||col==="is_active") return fmtBool(value);
  if (col.includes("pct")||col.includes("completion")) return `${Number(value||0).toFixed(1)}%`;
  if (col.includes("count")||col==="total"||col.includes("_orders")) return fmtNum(value);
  if (typeof value === "boolean") return fmtBool(value);
  if (v.length > 60) return v.slice(0,58) + "…";
  return v || "—";
}

function formatColumnLabel(col) {
  return col.replace(/_/g," ").replace(/\w/g,c=>c.toUpperCase());
}

export default function ReportsPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filters, setFilters] = useState({
    status:"", priority:"", urgency:"", vendor_id:"", site_id:"",
    payment_status:"", date_from:"", date_to:"", category:"", is_approved:""
  });

  const { data: catalogData } = useQuery(
    ["reports-catalog"],
    () => authFetch("/api/v1/report-engine/catalog").then(r=>r.json()),
    { staleTime: 300000 }
  );
  const catalog = catalogData?.reports || [];

  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k,v]) => { if (v) params.set(k, v); });
    params.set("limit","500");
    return params.toString();
  };

  const { data: reportData, isLoading: reportLoading, refetch } = useQuery(
    ["report-data", selectedReport, filters],
    () => authFetch(`/api/v1/report-engine/${selectedReport}?${buildQueryString()}`).then(r=>r.json()),
    { enabled: !!selectedReport, staleTime: 30000 }
  );

  const filteredCatalog = activeCategory==="All" ? catalog : catalog.filter(r=>r.category===activeCategory);
  const selectedMeta = catalog.find(r=>r.id===selectedReport);
  const reportRows = reportData?.data || [];
  const columns = reportData?.columns || [];
  const summary = reportData?.summary || reportData?.aging_summary || null;

  const exportCSV = () => {
    if (!reportRows.length) return;
    const headers = columns.join(",");
    const rows = reportRows.map(row =>
      columns.map(col => {
        const v = row[col];
        if (v === null || v === undefined) return "";
        const s = String(v).replace(/"/g,'""');
        return s.includes(",") ? `"${s}"` : s;
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#0D1A30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-indigo-400 mb-1">Analytics & Reporting</div>
              <h1 className="tb-hero-title">Report Center</h1>
              <p className="tb-hero-description">12 report types across Operations, Financial, Procurement, Engineering</p>
            </div>
            {selectedReport && reportRows.length > 0 && (
              <div className="flex gap-2">
              <button onClick={exportCSV} className="tb-btn-primary" style={{background:"#16A34A",fontSize:"0.75rem"}}>
                ↓ Export CSV ({reportRows.length} rows)
              </button>
              <a href={selectedReport ? `/api/v1/pdf/report/${selectedReport}` : "#"} target="_blank" className="tb-btn-secondary" style={{fontSize:"0.75rem",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"4px"}}>📄 PDF</a>
              </div>
            )}
          </div>
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat=>(
              <button key={cat} onClick={()=>setActiveCategory(cat)}
                className={"tb-pill "+(activeCategory===cat?"tb-pill--active":"")}
                style={activeCategory===cat&&cat!=="All"?{background:CAT_COLORS[cat]+"20",color:CAT_COLORS[cat],borderColor:CAT_COLORS[cat]+"40"}:{}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

          {/* LEFT: Report Selector */}
          <div className="xl:col-span-1 space-y-2">
            <div className="text-xs font-bold text-tertiary uppercase tracking-wider mb-3">Select Report</div>
            {filteredCatalog.map(report=>(
              <button key={report.id}
                onClick={()=>{ setSelectedReport(report.id); setFilters({status:"",priority:"",urgency:"",vendor_id:"",site_id:"",payment_status:"",date_from:"",date_to:"",category:"",is_approved:""}); }}
                className={"w-full text-left p-3 rounded-xl border transition-colors "+(selectedReport===report.id?"border-brand bg-brand/5":"bg-base-alt border-border hover:border-border/80")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">{report.label}</div>
                    <div className="text-xs text-tertiary mt-0.5">{report.description.slice(0,55)}…</div>
                  </div>
                  <span className="tb-badge flex-shrink-0" style={{fontSize:"0.45rem",background:(CAT_COLORS[report.category]||"#6D5F53")+"18",color:CAT_COLORS[report.category]||"#6D5F53"}}>
                    {report.category}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT: Report View */}
          <div className="xl:col-span-3 space-y-4">
            {!selectedReport ? (
              <div className="tb-section" style={{minHeight:"400px"}}>
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div style={{fontSize:"3rem"}}>📊</div>
                  <div className="text-lg font-bold text-secondary">Select a Report</div>
                  <div className="text-sm text-tertiary text-center max-w-sm">Choose from {catalog.length} report types covering all platform modules</div>
                </div>
              </div>
            ) : (
              <>
                {/* Filters Panel */}
                <div className="tb-section">
                  <div className="tb-section-title">{selectedMeta?.label}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {selectedMeta?.filters?.includes("status") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">Status</label>
                        <input className="tb-input w-full" placeholder="e.g. open, approved" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}/>
                      </div>
                    )}
                    {selectedMeta?.filters?.includes("priority") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">Priority</label>
                        <select className="tb-input w-full" value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}>
                          <option value="">All</option>
                          {["critical","high","medium","low"].map(p=><option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedMeta?.filters?.includes("urgency") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">Urgency</label>
                        <select className="tb-input w-full" value={filters.urgency} onChange={e=>setFilters({...filters,urgency:e.target.value})}>
                          <option value="">All</option>
                          {["critical","high","medium","low"].map(u=><option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedMeta?.filters?.includes("payment_status") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">Payment Status</label>
                        <select className="tb-input w-full" value={filters.payment_status} onChange={e=>setFilters({...filters,payment_status:e.target.value})}>
                          <option value="">All</option>
                          {["unpaid","partial","paid"].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedMeta?.filters?.includes("date_from") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">From Date</label>
                        <input type="date" className="tb-input w-full" value={filters.date_from} onChange={e=>setFilters({...filters,date_from:e.target.value})}/>
                      </div>
                    )}
                    {selectedMeta?.filters?.includes("date_to") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">To Date</label>
                        <input type="date" className="tb-input w-full" value={filters.date_to} onChange={e=>setFilters({...filters,date_to:e.target.value})}/>
                      </div>
                    )}
                    {selectedMeta?.filters?.includes("is_approved") && (
                      <div>
                        <label className="text-xs text-tertiary block mb-1">Approval Status</label>
                        <select className="tb-input w-full" value={filters.is_approved} onChange={e=>setFilters({...filters,is_approved:e.target.value})}>
                          <option value="">All</option>
                          <option value="true">Approved</option>
                          <option value="false">Not Approved</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>refetch()} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 14px"}}>
                      🔍 Run Report
                    </button>
                    <button onClick={()=>setFilters({status:"",priority:"",urgency:"",vendor_id:"",site_id:"",payment_status:"",date_from:"",date_to:"",category:"",is_approved:""})} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>
                      Reset
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                {reportData && summary && !Array.isArray(summary) && Object.keys(summary).length > 0 && (
                  <div className="tb-section">
                    <div className="tb-section-title">Summary</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {Object.entries(summary).map(([key, val], i)=>(
                        <div key={i} className="p-3 rounded-xl bg-base-alt text-center">
                          <div className="text-lg font-black text-primary">{typeof val==="number"&&(key.includes("amount")||key.includes("value")||key.includes("outstanding")||key.includes("collected"))?fmtEGP(val):typeof val==="number"?fmtNum(val):String(val||"—")}</div>
                          <div className="text-xs text-tertiary mt-1">{formatColumnLabel(key)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aging Summary (special) */}
                {reportData?.aging_summary && (
                  <div className="tb-section">
                    <div className="tb-section-title">Aging Breakdown</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {(reportData.aging_summary||[]).map((bucket,i)=>(
                        <div key={i} className="p-3 rounded-xl bg-base-alt text-center">
                          <div className="text-sm font-black text-primary">{fmtEGP(bucket.amount)}</div>
                          <div className="text-xs font-bold text-secondary">{bucket.invoice_count} invoices</div>
                          <div className="text-xs text-tertiary mt-1">{bucket.bucket}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Executive Summary (special layout) */}
                {reportData?.operations && reportData?.financial && (
                  <div className="space-y-3">
                    {[
                      {label:"Operations",data:reportData.operations,color:"#547C4D"},
                      {label:"Financial",data:reportData.financial,color:"#5B7C8C"},
                      {label:"Procurement",data:reportData.procurement,color:"#B07A2A"},
                      {label:"Assets",data:reportData.assets,color:"#8D7443"},
                      {label:"Projects",data:reportData.projects,color:"#B07A2A"},
                    ].map((section,si)=>(
                      <div key={si} className="tb-section">
                        <div className="tb-section-title" style={{color:section.color}}>{section.label}</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {Object.entries(section.data||{}).map(([key,val],i)=>(
                            <div key={i} className="p-2 rounded-xl bg-base-alt">
                              <div className="text-sm font-bold text-primary">{typeof val==="number"&&(key.includes("amount")||key.includes("value")||key.includes("budget")||key.includes("invoiced")||key.includes("collected")||key.includes("outstanding"))?fmtEGP(val):typeof val==="number"?fmtNum(Math.round(val)):String(val||"—")}</div>
                              <div className="text-xs text-tertiary">{formatColumnLabel(key)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Table */}
                {columns.length > 0 && (
                  <div className="tb-section">
                    <div className="tb-flex-between mb-3">
                      <div className="tb-section-title" style={{marginBottom:0}}>
                        {reportLoading ? "Loading…" : `${reportRows.length} Records`}
                      </div>
                      {reportRows.length > 0 && (
                        <button onClick={exportCSV} className="tb-btn-secondary" style={{fontSize:"0.7rem",padding:"4px 10px"}}>
                          ↓ CSV
                        </button>
                      )}
                    </div>
                    {reportLoading ? (
                      <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="h-10 bg-base-alt rounded-xl animate-pulse"/>)}</div>
                    ) : reportRows.length === 0 ? (
                      <div className="tb-empty"><div className="tb-empty-icon">📋</div><div className="tb-empty-title">No data found</div><div className="tb-empty-desc">Try adjusting filters or date range</div></div>
                    ) : (
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.75rem"}}>
                          <thead>
                            <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                              {columns.map((col,i)=>(
                                <th key={i} style={{padding:"8px 12px",textAlign:"left",color:"#6D5F53",fontWeight:600,fontSize:"0.625rem",textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>
                                  {formatColumnLabel(col)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {reportRows.map((row,ri)=>(
                              <tr key={ri} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                                className="hover:bg-base-alt transition-colors">
                                {columns.map((col,ci)=>(
                                  <td key={ci} style={{padding:"8px 12px",color:"#E2E8F0",maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                    {formatCellValue(col, row[col])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

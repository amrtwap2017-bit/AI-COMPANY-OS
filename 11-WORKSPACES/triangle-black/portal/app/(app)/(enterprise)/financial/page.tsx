"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => {
  if (n===null||n===undefined) return "—";
  const num = Number(n||0);
  if (num >= 1000000) return `EGP ${(num/1000000).toFixed(2)}M`;
  if (num >= 1000) return `EGP ${(num/1000).toFixed(1)}K`;
  return `EGP ${num.toLocaleString()}`;
};
const fmtEGPFull = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtPct = (n) => `${Number(n||0).toFixed(1)}%`;
const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};

const AGING_COLORS = {
  "Current":"#34D399","1-30 Days":"#FBBF24",
  "31-60 Days":"#FB923C","61-90 Days":"#F87171","90+ Days":"#DC2626"
};

function MiniBar({ value, max, color="#60A5FA" }) {
  const pct = max > 0 ? Math.min(100, (value/max)*100) : 0;
  return (
    <div className="h-2 rounded-full bg-base-alt overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:color}}/>
    </div>
  );
}

export default function FinancialDashboardPage() {
  const router = useRouter();
  const { data: fin, isLoading } = useQuery(
    ["financial-dashboard"],
    () => authFetch("/api/v1/financial/dashboard").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const { data: cashFlow } = useQuery(
    ["cash-flow"],
    () => authFetch("/api/v1/financial/cash-flow").then(r=>r.json()),
    { staleTime: 60000 }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">💰</div><div className="text-secondary animate-pulse">Loading financial data…</div></div>
    </div>
  );

  const rev = fin?.revenue || {};
  const costs = fin?.costs || {};
  const po = fin?.po_spend || {};
  const summary = fin?.summary || {};
  const aged = fin?.aged_receivables || [];
  const projects = fin?.projects_pl || [];
  const monthly = fin?.monthly_trend || [];
  const vendorSpend = fin?.vendor_spend || [];

  const maxMonthly = Math.max(...monthly.map(m=>Number(m.invoiced||0)), 1);
  const maxAged = Math.max(...aged.map(a=>Number(a.amount||0)), 1);
  const maxVendor = Math.max(...vendorSpend.map(v=>Number(v.total_spend||0)), 1);

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0A0F1E 0%,#0D1A2A 50%,#0A1520 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Financial Operations</div>
              <h1 className="tb-hero-title">P&L Dashboard</h1>
              <p className="tb-hero-description">Revenue · Collections · Aged Receivables · Project P&L</p>
            </div>
            <div className="flex gap-2">
              <a href="/api/v1/pdf/report/invoices" target="_blank"
                 className="tb-btn-secondary" style={{fontSize:"0.75rem",textDecoration:"none",display:"inline-flex",alignItems:"center"}}>
                📄 PDF Report
              </a>
              <button onClick={()=>router.push("/reports")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
                📊 All Reports
              </button>
            </div>
          </div>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total Invoiced",value:fmtEGP(rev.total_invoiced),sub:"All time",color:"#60A5FA"},
              {label:"Collected",value:fmtEGP(rev.total_collected),sub:`${fmtPct(summary.collection_rate_pct)} rate`,color:"#34D399"},
              {label:"Outstanding",value:fmtEGP(rev.total_outstanding),sub:`${rev.unpaid_count||0} unpaid invoices`,color:(rev.total_outstanding||0)>0?"#FBBF24":"#34D399"},
              {label:"SOW Pipeline",value:fmtEGP(costs.total_sow_value),sub:`${costs.sow_count||0} documents`,color:"#A78BFA"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
                <div className="text-xs opacity-50 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* LEFT COLUMN — 2/3 width */}
          <div className="xl:col-span-2 space-y-4">

            {/* Revenue vs Collection Bar */}
            <div className="tb-section">
              <div className="tb-section-title">Revenue Overview</div>
              <div className="space-y-3 mt-3">
                {[
                  {label:"Total Invoiced",value:Number(rev.total_invoiced||0),color:"#60A5FA"},
                  {label:"Collected",value:Number(rev.total_collected||0),color:"#34D399"},
                  {label:"Outstanding",value:Number(rev.total_outstanding||0),color:"#FBBF24"},
                ].map((row,i)=>{
                  const max = Number(rev.total_invoiced||1);
                  const pct = Math.min(100,(row.value/max)*100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-secondary">{row.label}</span>
                        <span className="font-bold" style={{color:row.color}}>{fmtEGPFull(row.value)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-base-alt overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:row.color}}/>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-border flex justify-between text-xs">
                  <span className="text-tertiary">Collection Rate</span>
                  <span className="font-black" style={{color:Number(summary.collection_rate_pct||0)>70?"#34D399":"#FBBF24"}}>
                    {fmtPct(summary.collection_rate_pct)}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Trend */}
            {monthly.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-title">Monthly Revenue Trend</div>
                <div className="mt-3 space-y-2">
                  {monthly.map((m,i)=>(
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-tertiary w-16 flex-shrink-0">{m.month}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 rounded-full bg-base-alt overflow-hidden">
                            <div className="h-full rounded-full bg-blue-400" style={{width:`${Math.min(100,(Number(m.invoiced||0)/maxMonthly)*100)}%`}}/>
                          </div>
                          <span className="text-xs text-secondary w-20 text-right">{fmtEGP(m.invoiced)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 rounded-full bg-base-alt overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-400" style={{width:`${Math.min(100,(Number(m.collected||0)/maxMonthly)*100)}%`}}/>
                          </div>
                          <span className="text-xs text-tertiary w-20 text-right">{fmtEGP(m.collected)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-2 border-t border-border">
                    <span className="flex items-center gap-1 text-xs"><span className="w-3 h-2 rounded-full bg-blue-400 inline-block"/>Invoiced</span>
                    <span className="flex items-center gap-1 text-xs"><span className="w-3 h-2 rounded-full bg-emerald-400 inline-block"/>Collected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Project P&L Table */}
            <div className="tb-section">
              <div className="tb-section-title">Project P&L Overview</div>
              {projects.length === 0 ? (
                <div className="tb-empty" style={{padding:"24px"}}><div className="tb-empty-title">No projects</div></div>
              ) : (
                <div className="space-y-3 mt-3">
                  {projects.map((proj,i)=>{
                    const budget = Number(proj.budget||0);
                    const completion = Number(proj.completion_pct||0);
                    const earned = budget * completion / 100;
                    return (
                      <div key={i} className="p-3 rounded-xl bg-base-alt border border-border">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="text-sm font-bold text-primary">{proj.title}</div>
                            <div className="text-xs text-tertiary">{proj.status} · {proj.manager_name||"—"}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-black text-emerald-400">{fmtEGP(budget)}</div>
                            <div className="text-xs text-tertiary">Budget</div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs mb-2">
                          <span className="text-secondary">Earned: <span className="font-bold text-primary">{fmtEGP(earned)}</span></span>
                          <span className="text-secondary">Completion: <span className="font-bold text-emerald-400">{completion}%</span></span>
                          <span className="text-secondary">Remaining: <span className="font-bold text-yellow-400">{fmtEGP(budget-earned)}</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-base overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-400 transition-all" style={{width:`${completion}%`}}/>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-tertiary">0%</span>
                          <span className="text-tertiary">100%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="tb-section">
              <div className="tb-section-title">Cost Structure (SOWs)</div>
              <div className="space-y-3 mt-3">
                {[
                  {label:"Labor Cost",value:Number(costs.total_labor||0),color:"#60A5FA"},
                  {label:"Materials Cost",value:Number(costs.total_materials||0),color:"#FBBF24"},
                  {label:"Overhead & Profit",value:Number(costs.total_overhead_profit||0),color:"#34D399"},
                ].map((row,i)=>{
                  const total = Number(costs.total_sow_value||1);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-secondary">{row.label}</span>
                        <span className="font-bold" style={{color:row.color}}>{fmtEGPFull(row.value)} ({fmtPct(row.value/total*100)})</span>
                      </div>
                      <MiniBar value={row.value} max={total} color={row.color}/>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — 1/3 width */}
          <div className="space-y-4">

            {/* Aged Receivables */}
            <div className="tb-section">
              <div className="tb-section-title" style={{color:"#FBBF24"}}>⏰ Aged Receivables</div>
              {aged.length === 0 ? (
                <div className="text-center py-4 text-sm text-emerald-400 font-bold">✅ No outstanding invoices</div>
              ) : (
                <div className="space-y-3 mt-3">
                  {aged.map((bucket,i)=>{
                    const color = AGING_COLORS[bucket.bucket] || "#94A3B8";
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{color}}>{bucket.bucket}</span>
                          <div className="text-right">
                            <span className="font-bold text-primary">{fmtEGP(bucket.amount)}</span>
                            <span className="text-tertiary ml-1">({bucket.count} inv)</span>
                          </div>
                        </div>
                        <MiniBar value={Number(bucket.amount||0)} max={maxAged} color={color}/>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border flex justify-between text-xs font-bold">
                    <span className="text-secondary">Total Outstanding</span>
                    <span className="text-red-400">{fmtEGPFull(rev.total_outstanding||0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Spend by Category */}
            <div className="tb-section">
              <div className="tb-section-title">Spend by Category</div>
              <div className="space-y-3 mt-3">
                {vendorSpend.length === 0 ? (
                  <div className="text-sm text-tertiary text-center py-4">No PO data yet</div>
                ) : (
                  vendorSpend.map((v,i)=>(
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-secondary">{v.category}</span>
                        <span className="font-bold text-primary">{fmtEGP(v.total_spend)}</span>
                      </div>
                      <MiniBar value={Number(v.total_spend||0)} max={maxVendor} color="#A78BFA"/>
                      <div className="text-xs text-tertiary mt-0.5">{v.vendor_count} vendors · {v.po_count} POs</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cash Flow Summary */}
            <div className="tb-section">
              <div className="tb-section-title">Cash Flow Summary</div>
              <div className="space-y-2 mt-3">
                {[
                  {label:"PO Commitments",value:po.total_po_value||0,color:"#F87171",icon:"↑"},
                  {label:"Invoice Revenue",value:rev.total_invoiced||0,color:"#34D399",icon:"↓"},
                  {label:"Net Position",value:(Number(rev.total_invoiced||0)-Number(po.total_po_value||0)),color:"#60A5FA",icon:"="},
                ].map((row,i)=>(
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-base-alt">
                    <div className="flex items-center gap-2">
                      <span className="font-black" style={{color:row.color}}>{row.icon}</span>
                      <span className="text-xs text-secondary">{row.label}</span>
                    </div>
                    <span className="text-sm font-black" style={{color:row.color}}>{fmtEGP(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="tb-section">
              <div className="tb-section-title">Quick Access</div>
              <div className="space-y-2 mt-3">
                {[
                  {label:"Invoice Management",path:"/supply-chain/invoices",icon:"📄"},
                  {label:"Purchase Orders",path:"/supply-chain/purchase-orders-v2",icon:"📦"},
                  {label:"Invoice Aging Report",path:"/reports",icon:"📊"},
                  {label:"Executive Dashboard",path:"/executive/dashboard",icon:"📈"},
                ].map((link,i)=>(
                  <button key={i} onClick={()=>router.push(link.path)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-base-alt hover:bg-surface border border-transparent hover:border-border transition-colors text-left">
                    <span>{link.icon}</span>
                    <span className="text-sm text-secondary">{link.label}</span>
                    <span className="text-brand ml-auto text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

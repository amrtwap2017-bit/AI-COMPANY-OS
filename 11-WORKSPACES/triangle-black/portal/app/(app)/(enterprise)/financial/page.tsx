"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n: any) => { if (n===null||n===undefined) return "—"; const num=Number(n||0); if(num>=1000000) return `EGP ${(num/1000000).toFixed(2)}M`; if(num>=1000) return `EGP ${(num/1000).toFixed(1)}K`; return `EGP ${num.toLocaleString()}`; };
const fmtEGPFull = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtPct  = (n) => `${Number(n||0).toFixed(1)}%`;
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

const AGING_COLORS = {"Current":"#547C4D","1-30 Days":"#B07A2A","31-60 Days":"#B07A2A","61-90 Days":"#A84A3D","90+ Days":"#A84A3D"};

function MiniBar({ value, max, color="#5B7C8C" }: any) {
  const pct = max > 0 ? Math.min(100,(value/max)*100) : 0;
  return (
    <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:color}}/>
    </div>
  );
}

export default function FinancialDashboardPage() {
  const router = useRouter();
  const { data: fin, isLoading } = useQuery(["financial-dashboard"],()=>authFetch("/api/v1/financial/dashboard").then(r => r.json()),{staleTime:60000});
  const { data: cashFlow }       = useQuery(["cash-flow"],           ()=>authFetch("/api/v1/financial/cash-flow").then(r => r.json()),{staleTime:60000});

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">💰</div><div className="text-secondary animate-pulse">Loading financial data…</div></div>
    </div>
  );

  const rev        = fin?.revenue          || {};
  const costs      = fin?.costs            || {};
  const po         = fin?.po_spend         || {};
  const summary    = fin?.summary          || {};
  const aged       = fin?.aged_receivables || [];
  const projects   = fin?.projects_pl      || [];
  const monthly    = fin?.monthly_trend    || [];
  const vendorSpend= fin?.vendor_spend     || [];

  const maxMonthly = Math.max(...monthly.map((m: any) =>Number(m.invoiced||0)),1);
  const maxAged    = Math.max(...aged.map((a: any) =>Number(a.amount||0)),1);
  const maxVendor  = Math.max(...vendorSpend.map((v: any) =>Number(v.total_spend||0)),1);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Financial Operations</div>
              <h1 className="tb-hero-title">P&L Dashboard</h1>
              <p className="tb-hero-description">Revenue · Collections · Aged Receivables · Project P&L</p>
            </div>
            <div className="tb-action-bar">
              <a href="/api/v1/pdf/report/invoices" target="_blank"
                className="tb-btn tb-btn-secondary tb-btn-sm" style={{textDecoration:"none"}}>
                📄 PDF Report
              </a>
              <button onClick={()=>router.push("/reports")} className="tb-btn tb-btn-secondary tb-btn-sm">
                📊 All Reports
              </button>
            </div>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Total Invoiced", value:fmtEGP(rev.total_invoiced),  sub:"All time",                             color:"var(--color-info)"},
              {label:"Collected",      value:fmtEGP(rev.total_collected),  sub:`${fmtPct(summary.collection_rate_pct)} rate`,color:"var(--color-success)"},
              {label:"Outstanding",    value:fmtEGP(rev.total_outstanding),sub:`${rev.unpaid_count||0} unpaid invoices`,color:(rev.total_outstanding||0)>0?"var(--color-warning)":"var(--color-success)"},
              {label:"SOW Pipeline",   value:fmtEGP(costs.total_sow_value),sub:`${costs.sow_count||0} documents`,      color:"var(--color-brand)"},
            ].map((k: any, i: number) =>(
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
          <div className="xl:col-span-2 flex flex-col gap-4">

            <div className="tb-section">
              <div className="tb-section-title">Revenue Overview</div>
              <div className="flex flex-col gap-3 mt-3">
                {[
                  {label:"Total Invoiced", value:Number(rev.total_invoiced||0),  color:"#5B7C8C"},
                  {label:"Collected",      value:Number(rev.total_collected||0),  color:"#547C4D"},
                  {label:"Outstanding",    value:Number(rev.total_outstanding||0),color:"#B07A2A"},
                ].map((row: any, i: any) =>{
                  const max = Number(rev.total_invoiced||1);
                  const pct = Math.min(100,(row.value/max)*100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-secondary">{row.label}</span>
                        <span className="font-bold" style={{color:row.color}}>{fmtEGPFull(row.value)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-surface-alt overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:row.color}}/>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-default flex justify-between text-xs">
                  <span className="text-tertiary">Collection Rate</span>
                  <span className={`font-black ${Number(summary.collection_rate_pct||0)>70?"text-success":"text-warning"}`}>
                    {fmtPct(summary.collection_rate_pct)}
                  </span>
                </div>
              </div>
            </div>

            {monthly.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-title">Monthly Revenue Trend</div>
                <div className="mt-3 flex flex-col gap-2">
                  {monthly.map((m: any, i: number) =>(
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-tertiary w-16 flex-shrink-0">{m.month}</div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 rounded-full bg-surface-alt overflow-hidden">
                            <div className="h-full rounded-full bg-blue-400" style={{width:`${Math.min(100,(Number(m.invoiced||0)/maxMonthly)*100)}%`}}/>
                          </div>
                          <span className="text-xs text-secondary w-20 text-right">{fmtEGP(m.invoiced)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 rounded-full bg-surface-alt overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-400" style={{width:`${Math.min(100,(Number(m.collected||0)/maxMonthly)*100)}%`}}/>
                          </div>
                          <span className="text-xs text-tertiary w-20 text-right">{fmtEGP(m.collected)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-2 border-t border-default">
                    <span className="flex items-center gap-1 text-xs text-secondary"><span className="w-3 h-2 rounded-full bg-blue-400 inline-block"/>Invoiced</span>
                    <span className="flex items-center gap-1 text-xs text-secondary"><span className="w-3 h-2 rounded-full bg-emerald-400 inline-block"/>Collected</span>
                  </div>
                </div>
              </div>
            )}

            <div className="tb-section">
              <div className="tb-section-title">Project P&L Overview</div>
              {projects.length === 0 ? (
                <div className="tb-empty" style={{padding:"24px"}}><div className="tb-empty-title">No projects</div></div>
              ) : (
                <div className="flex flex-col gap-3 mt-3">
                  {projects.map((proj: any, i: any) =>{
                    const budget     = Number(proj.budget||0);
                    const completion = Number(proj.completion_pct||0);
                    const earned     = budget * completion / 100;
                    return (
                      <div key={i} className="p-3 rounded-xl bg-surface-alt border border-default">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="text-sm font-bold text-primary">{proj.title}</div>
                            <div className="text-xs text-tertiary">{proj.status} · {proj.manager_name||"—"}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-black text-success">{fmtEGP(budget)}</div>
                            <div className="text-xs text-tertiary">Budget</div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs mb-2">
                          <span className="text-secondary">Earned: <span className="font-bold text-primary">{fmtEGP(earned)}</span></span>
                          <span className="text-secondary">Completion: <span className="font-bold text-success">{completion}%</span></span>
                          <span className="text-secondary">Remaining: <span className="font-bold text-warning">{fmtEGP(budget-earned)}</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-base overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-400 transition-all" style={{width:`${completion}%`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Cost Structure (SOWs)</div>
              <div className="flex flex-col gap-3 mt-3">
                {[
                  {label:"Labor Cost",           value:Number(costs.total_labor||0),            color:"#5B7C8C"},
                  {label:"Materials Cost",        value:Number(costs.total_materials||0),        color:"#B07A2A"},
                  {label:"Overhead & Profit",     value:Number(costs.total_overhead_profit||0),  color:"#547C4D"},
                ].map((row: any, i: any) =>{
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

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title text-warning">⏰ Aged Receivables</div>
              {aged.length === 0 ? (
                <div className="text-center py-4 text-sm text-success font-bold">✅ No outstanding invoices</div>
              ) : (
                <div className="flex flex-col gap-3 mt-3">
                  {aged.map((bucket: any, i: any) =>{
                    const color = (AGING_COLORS as Record<string, any>)[bucket.bucket] || "#6D5F53";
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
                  <div className="pt-2 border-t border-default flex justify-between text-xs font-bold">
                    <span className="text-secondary">Total Outstanding</span>
                    <span className="text-danger">{fmtEGPFull(rev.total_outstanding||0)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Spend by Category</div>
              <div className="flex flex-col gap-3 mt-3">
                {vendorSpend.length === 0 ? (
                  <div className="text-sm text-tertiary text-center py-4">No PO data yet</div>
                ) : vendorSpend.map((v: any, i: number) =>(
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-secondary">{v.category}</span>
                      <span className="font-bold text-primary">{fmtEGP(v.total_spend)}</span>
                    </div>
                    <MiniBar value={Number(v.total_spend||0)} max={maxVendor} color="#8D7443"/>
                    <div className="text-xs text-tertiary mt-0.5">{v.vendor_count} vendors · {v.po_count} POs</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Cash Flow Summary</div>
              <div className="flex flex-col gap-2 mt-3">
                {[
                  {label:"PO Commitments",  value:po.total_po_value||0,                                              color:"var(--color-danger)",  icon:"↑"},
                  {label:"Invoice Revenue", value:rev.total_invoiced||0,                                             color:"var(--color-success)", icon:"↓"},
                  {label:"Net Position",    value:(Number(rev.total_invoiced||0)-Number(po.total_po_value||0)),       color:"var(--color-info)",    icon:"="},
                ].map((row: any, i: any) =>(
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
                    <div className="flex items-center gap-2">
                      <span className="font-black" style={{color:row.color}}>{row.icon}</span>
                      <span className="text-xs text-secondary">{row.label}</span>
                    </div>
                    <span className="text-sm font-black" style={{color:row.color}}>{fmtEGP(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Access</div>
              <div className="flex flex-col gap-2 mt-3">
                {[
                  {label:"Invoice Management",  path:"/supply-chain/invoices",        icon:"📄"},
                  {label:"Purchase Orders",      path:"/supply-chain/purchase-orders-v2",icon:"📦"},
                  {label:"Invoice Aging Report", path:"/reports",                      icon:"📊"},
                  {label:"Executive Dashboard",  path:"/executive/dashboard",          icon:"📈"},
                ].map((link: any, i: any) =>(
                  <button key={i} onClick={()=>router.push(link.path)} className="tb-action-item w-full justify-start">
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

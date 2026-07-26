// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtNum = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

function KPICard({ label, value, sub, color="text-slate-800", bg="bg-white", icon, link }) {
  const inner = (
    <div className={`${bg} rounded-xl border border-slate-200 px-4 py-4 hover:shadow-md transition-all ${link ? "cursor-pointer hover:border-blue-300" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        {link && <span className="text-xs text-slate-300 group-hover:text-blue-400">→</span>}
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm font-medium text-slate-600 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
  return link ? <Link href={link} className="group">{inner}</Link> : inner;
}

function ProgressBar({ value, max, color="bg-blue-500", label, sublabel }) {
  const pct = max > 0 ? Math.min(100, (value/max)*100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-slate-400">{sublabel}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{width:`${pct}%`}} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: woRaw = [], isLoading: woL } = useQuery(
    ["analytics-wo"],
    () => authFetch("/api/v1/work-orders/?limit=500").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const { data: invRaw = [], isLoading: invL } = useQuery(
    ["analytics-inv"],
    () => authFetch("/api/v1/invoices/?limit=500").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const { data: leadsRaw = [], isLoading: leadsL } = useQuery(
    ["analytics-leads"],
    () => authFetch("/api/v1/leads/?limit=500").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const { data: contractsRaw = [], isLoading: contractsL } = useQuery(
    ["analytics-contracts"],
    () => authFetch("/api/v1/contracts/?limit=500").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const { data: assetsRaw = [], isLoading: assetsL } = useQuery(
    ["analytics-assets"],
    () => authFetch("/api/v1/assets/?limit=500").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const { data: twin = {}, isLoading: twinL } = useQuery(
    ["analytics-twin"],
    () => authFetch("/api/v1/twin/state").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const wos       = toArr(woRaw);
  const invs      = toArr(invRaw);
  const leads     = toArr(leadsRaw);
  const contracts = toArr(contractsRaw);
  const assets    = toArr(assetsRaw);

  const isLoading = woL || invL || leadsL || contractsL || assetsL || twinL;

  // Work Orders
  const woOpen      = wos.filter(w => w.status === "open").length;
  const woInProg    = wos.filter(w => w.status === "in_progress").length;
  const woCompleted = wos.filter(w => w.status === "completed").length;
  const woCritical  = wos.filter(w => w.priority === "critical" && !["completed","cancelled"].includes(w.status)).length;
  const woTotal     = wos.length;
  const woCompRate  = woTotal > 0 ? Math.round((woCompleted/woTotal)*100) : 0;

  // Finance
  const totalRev  = invs.reduce((s,i) => s+(i.amount||0), 0);
  const paidRev   = invs.filter(i => i.status==="paid").reduce((s,i) => s+(i.amount||0), 0);
  const overdueRev = invs.filter(i => i.status==="overdue").reduce((s,i) => s+(i.amount||0), 0);
  const collRate  = totalRev > 0 ? Math.round((paidRev/totalRev)*100) : 0;
  const invPaid   = invs.filter(i => i.status==="paid").length;
  const invOverdue = invs.filter(i => i.status==="overdue").length;

  // Commercial
  const leadsNew   = leads.filter(l => l.status==="new").length;
  const leadsWon   = leads.filter(l => ["won","converted"].includes(l.status)).length;
  const convRate   = leads.length > 0 ? Math.round((leadsWon/leads.length)*100) : 0;
  const activeContracts = contracts.filter(c => c.status==="active").length;
  const contractVal = contracts.filter(c => c.status==="active").reduce((s,c) => s+(c.total_value||c.value||0),0);
  const expiring30  = contracts.filter(c => {
    if (!c.end_date || c.status !== "active") return false;
    try { return (new Date(c.end_date)-new Date())/(1000*60*60*24) <= 30; } catch { return false; }
  }).length;

  // Assets
  const assetOp    = assets.filter(a => a.status==="Operational").length;
  const assetFault = assets.filter(a => a.status==="In Fault").length;
  const assetMaint = assets.filter(a => a.status==="Under Maintenance").length;
  const assetRate  = assets.length > 0 ? Math.round((assetOp/assets.length)*100) : 0;

  // Twin
  const twinScore  = twin.health_score ?? 0;
  const twinLabel  = twin.health_label ?? "—";
  const twinColor  = twinScore >= 95 ? "text-emerald-600" : twinScore >= 80 ? "text-amber-600" : "text-red-600";
  const twinDomains = twin.operational_domains || [];

  const by = (v) => isLoading ? "…" : v;

  return (
    <PageWrapper>
      <PageHeader
        title="Analytics & Intelligence"
        subtitle="Real-time operational performance dashboard"
        breadcrumbs={[{label:"Analytics"}]}
      />

      {/* ── SECTION 1: Operations ──────────────────────── */}
      <div className="mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Operations Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <KPICard label="Total Work Orders"  value={by(woTotal)}     icon="🔧" link="/operations/work-orders" />
          <KPICard label="Open"               value={by(woOpen)}      icon="📂" color="text-blue-700"    link="/operations/work-orders" />
          <KPICard label="In Progress"        value={by(woInProg)}    icon="⚙️"  color="text-indigo-700"  link="/operations/work-orders" />
          <KPICard label="Critical Open"      value={by(woCritical)}  icon="🚨" color="text-red-700"     link="/operations/work-orders" />
          <KPICard label="Completion Rate"    value={by(`${woCompRate}%`)} icon="✅" color={woCompRate>=80?"text-emerald-700":"text-amber-700"} />
        </div>
      </div>

      {/* ── SECTION 2: Finance ─────────────────────────── */}
      <div className="mt-6 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Financial Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <KPICard label="Total Revenue"    value={by(`EGP ${fmtNum(totalRev)}`)}  icon="💰" color="text-slate-800" />
          <KPICard label="Collected"        value={by(`EGP ${fmtNum(paidRev)}`)}   icon="✅" color="text-emerald-700" />
          <KPICard label="Collection Rate" value={by(`${collRate}%`)}              icon="📊" color={collRate>=80?"text-emerald-700":"text-amber-700"} />
          <KPICard label="Overdue Amount"  value={by(`EGP ${fmtNum(overdueRev)}`)} icon="⚠️" color={overdueRev>0?"text-red-700":"text-emerald-700"} />
        </div>
        {!isLoading && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <ProgressBar value={paidRev} max={totalRev} color="bg-emerald-500"
              label={`Revenue collected: EGP ${fmtNum(paidRev)}`}
              sublabel={`${collRate}% of EGP ${fmtNum(totalRev)}`} />
            <ProgressBar value={invPaid} max={invs.length} color="bg-blue-500"
              label={`Invoices paid: ${invPaid}`}
              sublabel={`${invs.length > 0 ? Math.round((invPaid/invs.length)*100) : 0}% of ${invs.length} total`} />
            {invOverdue > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <span>⚠️</span>
                <span className="font-semibold">{invOverdue} overdue invoices</span>
                <span>— EGP {fmtNum(overdueRev)} pending collection</span>
                <Link href="/commercial/invoices" className="ml-auto text-red-700 font-semibold hover:underline">Review →</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 3: Commercial ──────────────────────── */}
      <div className="mt-6 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Commercial Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Total Leads"        value={by(leads.length)}          icon="🎯" link="/commercial/leads" />
          <KPICard label="New Leads"          value={by(leadsNew)}              icon="🆕" color="text-blue-700"    link="/commercial/leads" />
          <KPICard label="Conversion Rate"    value={by(`${convRate}%`)}        icon="📈" color={convRate>=20?"text-emerald-700":"text-amber-700"} />
          <KPICard label="Active Contracts"   value={by(activeContracts)}       icon="📄" link="/commercial/contracts" />
        </div>
        {!isLoading && contractVal > 0 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">Active Contract Portfolio</p>
              <p className="text-2xl font-bold text-blue-900 mt-0.5">EGP {fmtNum(contractVal)}</p>
            </div>
            <div className="text-right">
              {expiring30 > 0 && (
                <div className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                  ⚠️ {expiring30} contracts expiring in 30 days
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 4: Assets + Digital Twin ───────────── */}
      <div className="mt-6 mb-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Asset Health & Digital Twin</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Asset Registry</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                {label:"Total",      value:by(assets.length),  color:"text-slate-800"},
                {label:"Operational",value:by(assetOp),        color:"text-emerald-700"},
                {label:"In Fault",   value:by(assetFault),     color:"text-red-700"},
              ].map(k => (
                <div key={k.label} className="text-center">
                  <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  <div className="text-xs text-slate-500">{k.label}</div>
                </div>
              ))}
            </div>
            {!isLoading && assets.length > 0 && (
              <>
                <ProgressBar value={assetOp} max={assets.length} color="bg-emerald-500"
                  label={`Operational: ${assetOp} assets`} sublabel={`${assetRate}%`} />
                {assetMaint > 0 && (
                  <ProgressBar value={assetMaint} max={assets.length} color="bg-amber-500"
                    label={`Under Maintenance: ${assetMaint}`} sublabel={`${Math.round((assetMaint/assets.length)*100)}%`} />
                )}
                {assetFault > 0 && (
                  <ProgressBar value={assetFault} max={assets.length} color="bg-red-500"
                    label={`In Fault: ${assetFault}`} sublabel={`${Math.round((assetFault/assets.length)*100)}%`} />
                )}
              </>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${twinScore>=95?"bg-emerald-50 border-emerald-200":twinScore>=80?"bg-amber-50 border-amber-200":"bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Digital Twin Health</h3>
              <div className={`text-3xl font-bold ${twinColor}`}>{by(`${twinScore}/100`)}</div>
            </div>
            <div className="space-y-2">
              {twinDomains.map(d => {
                const hasIssue = (d.overdue||0)>0 || (d.critical_open||0)>0 || (d.below_min||0)>0;
                return (
                  <div key={d.domain} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${hasIssue?"bg-amber-500":"bg-emerald-500"}`} />
                      <span className="font-medium text-slate-700">{d.domain}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-semibold text-slate-700">{d.total}</span>
                      {d.overdue>0 && <span className="text-amber-600 font-semibold">{d.overdue} overdue</span>}
                      {d.critical_open>0 && <span className="text-red-600 font-semibold">{d.critical_open} critical</span>}
                      {!hasIssue && <span className="text-emerald-600">✓ OK</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

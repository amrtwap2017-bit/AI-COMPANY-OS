"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

export default function AnalyticsHub() {
  const router = useRouter();
  const { data: dash }        = useQuery(["an-dash"],    () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: twin }        = useQuery(["an-twin"],    () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: woRaw }       = useQuery(["an-wos"],     () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }      = useQuery(["an-inv"],     () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: contractRaw } = useQuery(["an-cont"],    () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: assetRaw }    = useQuery(["an-assets"],  () => authFetch("/api/v1/assets/").then(r=>r.json()));

  const wos       = toArr(woRaw);
  const invoices  = toArr(invRaw);
  const contracts = toArr(contractRaw);
  const assets    = toArr(assetRaw);
  const d         = dash || {};
  const score     = twin?.health_score ?? 0;

  const completionRate = wos.length > 0 ? Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100) : 0;
  const totalRevenue   = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const collectionRate = invoices.length > 0 ? Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100) : 0;
  const assetUptime    = assets.length > 0 ? Math.round(assets.filter(a=>a.status==="Operational").length/assets.length*100) : 100;
  const pmCompliance   = (d.maintenance?.pm_plans||0) > 0 ? Math.round(((d.maintenance?.pm_plans||0)-(d.maintenance?.overdue||0))/(d.maintenance?.pm_plans||1)*100) : 100;

  const kpiSections = [
    {
      title: "Operations",
      icon: "⚙️",
      color: "blue",
      path: "/operations",
      kpis: [
        { label: "Total Work Orders",  value: wos.length,                              unit: "",   target: null },
        { label: "Open",               value: d.work_orders?.open ?? 0,               unit: "",   target: null },
        { label: "Completion Rate",    value: completionRate,                           unit: "%",  target: 85 },
        { label: "In Progress",        value: d.work_orders?.in_progress ?? 0,         unit: "",   target: null },
      ]
    },
    {
      title: "Maintenance",
      icon: "🔧",
      color: "amber",
      path: "/maintenance",
      kpis: [
        { label: "Total Assets",       value: assets.length,                           unit: "",   target: null },
        { label: "Asset Uptime",       value: assetUptime,                             unit: "%",  target: 95 },
        { label: "PM Compliance",      value: pmCompliance,                            unit: "%",  target: 90 },
        { label: "PM Overdue",         value: d.maintenance?.overdue ?? 0,             unit: "",   target: 0 },
      ]
    },
    {
      title: "Finance",
      icon: "💰",
      color: "emerald",
      path: "/invoices",
      kpis: [
        { label: "Total Revenue",      value: fmtEGP(totalRevenue),                    unit: "",   target: null },
        { label: "Collection Rate",    value: collectionRate,                           unit: "%",  target: 90 },
        { label: "Paid Invoices",      value: d.finance?.paid ?? 0,                   unit: "",   target: null },
        { label: "Overdue",            value: d.finance?.overdue ?? 0,                unit: "",   target: 0 },
      ]
    },
    {
      title: "Commercial",
      icon: "💼",
      color: "purple",
      path: "/commercial",
      kpis: [
        { label: "Active Contracts",   value: d.commercial?.active_contracts ?? 0,    unit: "",   target: null },
        { label: "Open Leads",         value: d.commercial?.open_leads ?? 0,           unit: "",   target: null },
        { label: "Expiring 30d",       value: d.commercial?.expiring_30d ?? 0,         unit: "",   target: 0 },
        { label: "Pending Signature",  value: contracts.filter(c=>c.status==="pending_signature").length, unit: "", target: null },
      ]
    },
  ];

  const subPages = [
    { title: "Scorecards",      icon: "🏆", desc: "KPI progress vs targets",     path: "/analytics/scorecards" },
    { title: "SLA Reports",     icon: "⏱️", desc: "Response time compliance",    path: "/analytics/sla" },
    { title: "Performance Trends", icon: "📈", desc: "Trend analysis over time", path: "/analytics/trends" },
    { title: "Cost Analysis",   icon: "💵", desc: "Revenue and spend analysis",  path: "/analytics/costs" },
  ];

  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Analytics</div>
          <h1 className="text-3xl font-black text-primary">Analytics Hub</h1>
          <p className="text-secondary mt-1">Live KPIs, performance metrics, and business intelligence</p>
        </div>
        <div className={`rounded-2xl border px-6 py-4 text-center ${score>=95?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className={`text-4xl font-black ${score>=95?"text-emerald-500":"text-amber-500"}`}>{score}</div>
          <div className="text-xs text-secondary mt-1">Platform Twin</div>
        </div>
      </div>

      {/* Sub-page navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subPages.map((s, i) => (
          <button key={i} onClick={() => router.push(s.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-bold text-primary group-hover:text-amber-600 transition-colors">{s.title}</div>
            <div className="text-xs text-secondary mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* KPI Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpiSections.map((section, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.icon}</span>
                <h2 className="font-bold text-primary">{section.title}</h2>
              </div>
              <button onClick={() => router.push(section.path)} className="text-xs text-amber-500 hover:underline">View →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {section.kpis.map((kpi, j) => {
                const isGood = kpi.target === null ? true : kpi.target === 0 ? Number(kpi.value) === 0 : Number(kpi.value) >= kpi.target;
                const showBar = kpi.unit === "%";
                return (
                  <div key={j} className="bg-base-alt dark:bg-surface-alt rounded-xl p-3">
                    <div className="text-xs text-secondary mb-1">{kpi.label}</div>
                    <div className={`text-xl font-black ${kpi.target !== null ? (isGood ? "text-emerald-500" : "text-red-500") : "text-primary"}`}>
                      {kpi.value}{kpi.unit}
                    </div>
                    {showBar && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${isGood ? "bg-emerald-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(Number(kpi.value) || 0, 100)}%` }} />
                      </div>
                    )}
                    {kpi.target !== null && <div className="text-[10px] text-tertiary mt-0.5">Target: {kpi.target}{kpi.unit}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Twin domain matrix */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Digital Twin — All 8 Domains</h2>
          <button onClick={() => router.push("/executive/intelligence")} className="text-xs text-amber-500 hover:underline">Full report →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {(twin?.operational_domains ?? []).map((dom, i) => {
            const hasIssue = (dom.overdue ?? 0) > 0 || (dom.critical_open ?? 0) > 0 || (dom.below_min ?? 0) > 0;
            return (
              <div key={i} className={`rounded-xl border p-3 text-center ${hasIssue ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"}`}>
                <div className="text-2xl font-black">{dom.total ?? "—"}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${hasIssue ? "text-amber-600" : "text-emerald-600"}`}>{dom.domain}</div>
                <div className="text-[9px] text-tertiary mt-0.5">{hasIssue ? "⚠ Action" : "✓ OK"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

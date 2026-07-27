"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutivePage() {
  const router = useRouter();
  const { data: twin }        = useQuery(["exe-twin"],     () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }        = useQuery(["exe-dash"],     () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), { refetchInterval: 30000 });
  const { data: woRaw }       = useQuery(["exe-wos"],      () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }      = useQuery(["exe-inv"],      () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: contractRaw } = useQuery(["exe-cont"],     () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: notifRaw }    = useQuery(["exe-notifs"],   () => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const { data: autoStatus }  = useQuery(["exe-auto"],     () => authFetch("/api/v1/automation/status").then(r=>r.json()));

  const wos       = toArr(woRaw);
  const invoices  = toArr(invRaw);
  const contracts = toArr(contractRaw);
  const notifs    = toArr(notifRaw);
  const d         = dash || {};
  const now       = new Date();
  const score     = twin?.health_score ?? 0;

  const criticalWOs      = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const overdueWOs       = wos.filter(w => w.due_date && new Date(w.due_date) < now && w.status !== "completed");
  const expiringContracts = contracts.filter(c => c.end_date && new Date(c.end_date) >= now && new Date(c.end_date) <= new Date(now.getTime() + 30*86400000) && c.status === "active");
  const totalRevenue     = invoices.filter(i => i.status === "paid").reduce((s,i) => s+Number(i.total_amount||0), 0);
  const pendingRevenue   = invoices.filter(i => i.status === "pending").reduce((s,i) => s+Number(i.total_amount||0), 0);
  const unreadNotifs     = notifs.filter(n => !n.is_read);
  const pending          = autoStatus?.pending_actions || {};
  const totalPending     = Object.values(pending).reduce((s,v) => s+Number(v), 0);

  const completionRate   = wos.length > 0 ? Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100) : 0;
  const collectionRate   = invoices.length > 0 ? Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100) : 0;

  const riskScore = criticalWOs.length * 10 + overdueWOs.length * 3 + expiringContracts.length * 5 + (d.maintenance?.overdue||0) * 2;
  const riskLevel = riskScore === 0 ? "None" : riskScore < 15 ? "Low" : riskScore < 30 ? "Medium" : "High";
  const riskColor = riskScore === 0 ? "emerald" : riskScore < 15 ? "blue" : riskScore < 30 ? "amber" : "red";

  const scoreColor = score >= 95 ? "text-emerald-400" : score >= 80 ? "text-amber-400" : "text-red-400";

  const executiveNav = [
    { label: "Intelligence",   icon: "🧠", path: "/executive/intelligence",  desc: "Platform AI overview" },
    { label: "Daily Review",   icon: "☀️", path: "/executive/daily-review",  desc: "Today's briefing" },
    { label: "Portfolio",      icon: "💼", path: "/executive/portfolio",      desc: "Revenue & contracts" },
    { label: "Risks",          icon: "⚠️", path: "/executive/risks",          desc: "Risk register" },
    { label: "Exceptions",     icon: "🚨", path: "/executive/exceptions",     desc: "Items needing action" },
    { label: "Scorecard",      icon: "🏆", path: "/executive/scorecard",      desc: "KPI performance" },
    { label: "Predictive",     icon: "🔮", path: "/executive/predictive",     desc: "Forward-looking insights" },
    { label: "Reports",        icon: "📊", path: "/executive/reports",        desc: "Executive reports" },
    { label: "Command",        icon: "⚡", path: "/executive/command",        desc: "Command center" },
    { label: "Workbench",      icon: "🛠️", path: "/executive/workbench",      desc: "Full workbench" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Dark header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Executive Center</div>
            <h1 className="text-3xl font-black text-white">Executive Dashboard</h1>
            <p className="text-slate-400 mt-1 text-sm">Real-time business intelligence and decision support</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-5xl font-black ${scoreColor}`}>{score}</div>
              <div className="text-xs text-slate-400 mt-1">Platform Health</div>
              <div className={`text-xs font-bold mt-0.5 ${scoreColor}`}>{twin?.health_label ?? "—"}</div>
            </div>
            <div className={`border rounded-2xl px-5 py-4 text-center ${riskColor === "emerald" ? "border-emerald-500/30 bg-emerald-500/10" : riskColor === "amber" ? "border-amber-500/30 bg-amber-500/10" : "border-red-500/30 bg-red-500/10"}`}>
              <div className={`text-2xl font-black text-${riskColor}-400`}>{riskScore}</div>
              <div className="text-xs text-slate-400 mt-0.5">Risk Score</div>
              <div className={`text-xs font-bold text-${riskColor}-400`}>{riskLevel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Top KPIs — 6 boxes */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Active Contracts",  value: d.commercial?.active_contracts ?? 0, sub: `${expiringContracts.length} expiring soon`,    color: "emerald", path: "/commercial/contracts" },
            { label: "Revenue Collected", value: fmtEGP(totalRevenue),                sub: `${collectionRate}% collection rate`,             color: "amber",   path: "/invoices" },
            { label: "Pending Revenue",   value: fmtEGP(pendingRevenue),              sub: `${invoices.filter(i=>i.status==="pending").length} invoices`,        color: "blue",    path: "/invoices" },
            { label: "Critical WOs",      value: criticalWOs.length,                  sub: `${overdueWOs.length} overdue`,                   color: criticalWOs.length > 0 ? "red" : "emerald", path: "/executive/exceptions" },
            { label: "WO Completion",     value: `${completionRate}%`,                sub: `${wos.filter(w=>w.status==="completed").length} completed`,          color: completionRate >= 80 ? "emerald" : "amber",  path: "/analytics/scorecards" },
            { label: "Unread Alerts",     value: unreadNotifs.length,                 sub: `${totalPending} auto pending`,                   color: "purple",  path: "/inbox" },
          ].map((k,i) => (
            <button key={i} onClick={() => router.push(k.path)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
              <div className="text-xs text-slate-500 mb-2 font-medium">{k.label}</div>
              <div className={`text-2xl font-black text-${k.color}-500 group-hover:scale-105 transition-transform origin-left`}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-1 truncate">{k.sub}</div>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left — Action items */}
          <div className="space-y-4">
            {/* Critical issues */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white">🚨 Executive Alerts</h2>
                <button onClick={() => router.push("/executive/exceptions")} className="text-xs text-amber-500">All →</button>
              </div>
              {criticalWOs.length === 0 && expiringContracts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm text-slate-400">No executive alerts</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalWOs.slice(0,4).map((w,i) => (
                    <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                      className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 text-left hover:bg-red-100 transition-colors">
                      <span className="text-xs font-black px-1.5 py-0.5 bg-red-500 text-white rounded mt-0.5 flex-shrink-0">CRIT</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-red-900 dark:text-red-300 truncate">{w.title}</div>
                        <div className="text-xs text-red-500">Work Order · {w.status}</div>
                      </div>
                    </button>
                  ))}
                  {expiringContracts.slice(0,3).map((c,i) => {
                    const days = Math.ceil((new Date(c.end_date)-Date.now())/86400000);
                    return (
                      <button key={i} onClick={() => router.push(`/commercial/contracts/${c.id}`)}
                        className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 text-left hover:bg-amber-100 transition-colors">
                        <span className="text-xs font-black px-1.5 py-0.5 bg-amber-500 text-white rounded mt-0.5 flex-shrink-0">{days}d</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 truncate">{c.title||`Contract ${c.id?.slice(0,8)}`}</div>
                          <div className="text-xs text-amber-500">Contract expiring · {fmtDate(c.end_date)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Domain summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Business Summary</h2>
              <div className="space-y-2">
                {[
                  { label: "Total WOs",         value: wos.length,                           icon: "⚙️" },
                  { label: "PM Plans",           value: d.maintenance?.pm_plans ?? 0,         icon: "📅" },
                  { label: "Open Leads",         value: d.commercial?.open_leads ?? 0,        icon: "👤" },
                  { label: "Purchase Requests",  value: d.procurement?.purchase_requests ?? 0, icon: "🛒" },
                  { label: "Technicians",        value: d.platform?.technicians ?? 0,         icon: "👷" },
                  { label: "Projects",           value: d.platform?.projects ?? 0,            icon: "🏗️" },
                ].map((item,i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center + Right — Main intelligence */}
          <div className="xl:col-span-2 space-y-4">

            {/* Twin domains */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white">Digital Twin — {score}/100 {twin?.health_label}</h2>
                <button onClick={() => router.push("/executive/intelligence")} className="text-xs text-amber-500">Intelligence →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(twin?.operational_domains ?? []).map((dom,i) => {
                  const hasIssue = (dom.overdue??0)>0 || (dom.critical_open??0)>0 || (dom.below_min??0)>0;
                  const vals = Object.entries(dom).filter(([k])=>k!=="domain").map(([k,v])=>`${k}: ${v}`).join(" · ");
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${hasIssue?"bg-amber-50 border-amber-200 dark:bg-amber-900/20":"bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20"}`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{dom.domain}</div>
                        <div className={`text-xs font-black ${hasIssue?"text-amber-600":"text-emerald-600"}`}>{hasIssue?"⚠":"✓"}</div>
                      </div>
                      <div className="text-2xl font-black">{dom.total ?? "—"}</div>
                      <div className="text-[9px] text-slate-400 mt-1 leading-tight truncate">{vals}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finance snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white">Finance Snapshot</h2>
                <button onClick={() => router.push("/invoices")} className="text-xs text-amber-500">Full report →</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Paid",       count: d.finance?.paid??0,      color: "emerald" },
                  { label: "Pending",    count: d.finance?.pending??0,    color: "amber" },
                  { label: "Overdue",    count: d.finance?.overdue??0,    color: "red" },
                  { label: "Cancelled",  count: d.finance?.cancelled??0,  color: "slate" },
                ].map((s,i) => (
                  <div key={i} className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <div className={`text-2xl font-black text-${s.color}-500`}>{s.count}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="flex h-3">
                  <div className="bg-emerald-500 h-3" style={{width:`${(d.finance?.paid||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                  <div className="bg-amber-400 h-3" style={{width:`${(d.finance?.pending||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                  <div className="bg-red-500 h-3" style={{width:`${(d.finance?.overdue||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Paid</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Pending</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Overdue</span>
              </div>
            </div>

            {/* Executive sub-pages */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Executive Views</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {executiveNav.map((nav,i) => (
                  <button key={i} onClick={() => router.push(nav.path)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 transition-all group">
                    <span className="text-xl">{nav.icon}</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center group-hover:text-amber-600">{nav.label}</span>
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

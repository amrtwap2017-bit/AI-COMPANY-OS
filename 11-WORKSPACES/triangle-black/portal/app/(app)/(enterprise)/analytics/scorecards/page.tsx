"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function AnalyticsScorecards() {
  const router = useRouter();
  const { data: dash } = useQuery(["sc-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: twin } = useQuery(["sc-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: woRaw } = useQuery(["sc-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: techRaw } = useQuery(["sc-techs"], () => authFetch("/api/v1/technicians/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["sc-inv"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: contractRaw } = useQuery(["sc-cont"], () => authFetch("/api/v1/contracts/").then(r => r.json()));

  const wos = toArr(woRaw);
  const techs = toArr(techRaw);
  const invoices = toArr(invoiceRaw);
  const contracts = toArr(contractRaw);
  const d = dash || {};
  const score = twin?.health_score ?? 0;

  const completionRate = wos.length > 0 ? Math.round(wos.filter((w: any) => w.status === "completed").length / wos.length * 100) : 0;
  const totalInvoiced = invoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const paidInvoiced = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const collectionRate = totalInvoiced > 0 ? Math.round(paidInvoiced / totalInvoiced * 100) : 0;
  const contractRenewalRate = contracts.length > 0 ? Math.round(contracts.filter((c: any) => c.renewal_count > 0).length / contracts.length * 100) : 0;
  const techUtilization = techs.length > 0 ? Math.round(wos.filter((w: any) => w.status === "in_progress").length / techs.length * 100) : 0;

  const scorecards = [
    { name: "Platform Health", score, target: 98, unit: "/100", color: score >= 95 ? "emerald" : score >= 80 ? "amber" : "red", desc: "Digital Twin composite score", path: "/executive/intelligence" },
    { name: "WO Completion Rate", score: completionRate, target: 85, unit: "%", color: completionRate >= 85 ? "emerald" : completionRate >= 70 ? "amber" : "red", desc: `${wos.filter((w: any) => w.status === "completed").length} of ${wos.length} completed`, path: "/operations/work-orders" },
    { name: "Invoice Collection", score: collectionRate, target: 90, unit: "%", color: collectionRate >= 90 ? "emerald" : collectionRate >= 75 ? "amber" : "red", desc: `${invoices.filter((i: any) => i.status === "paid").length} of ${invoices.length} paid`, path: "/invoices" },
    { name: "Contract Active Rate", score: Math.round(contracts.filter((c: any) => c.status === "active").length / Math.max(contracts.length, 1) * 100), target: 60, unit: "%", color: "blue", desc: `${contracts.filter((c: any) => c.status === "active").length} active contracts`, path: "/commercial/contracts" },
    { name: "Tech Utilization", score: Math.min(techUtilization, 100), target: 70, unit: "%", color: techUtilization >= 70 ? "emerald" : "amber", desc: `${wos.filter((w: any) => w.status === "in_progress").length} WOs in progress / ${techs.length} techs`, path: "/operations/technicians" },
    { name: "Contract Renewal Rate", score: contractRenewalRate, target: 50, unit: "%", color: contractRenewalRate >= 50 ? "emerald" : "amber", desc: `${contracts.filter((c: any) => c.renewal_count > 0).length} renewed contracts`, path: "/commercial/contracts" },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Analytics</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Performance Scorecards</h1>
        <p className="text-slate-500 mt-1">KPI performance across all operational domains</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {scorecards.map((sc, i) => {
          const pct = Math.min(100, Math.max(0, sc.score));
          const vs = sc.score >= sc.target;
          return (
            <button key={i} onClick={() => router.push(sc.path)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{sc.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sc.desc}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${vs ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {vs ? "ON TARGET" : "BELOW"}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-5xl font-black text-${sc.color}-500`}>{sc.score}</span>
                <span className="text-xl text-slate-400 mb-1">{sc.unit}</span>
                <span className="text-sm text-slate-400 mb-1 ml-auto">target: {sc.target}{sc.unit}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                <div className={`h-3 rounded-full bg-${sc.color}-500 transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain breakdown table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Domain Scorecard Summary</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left pb-3 text-slate-500 font-medium">Domain</th>
              <th className="text-right pb-3 text-slate-500 font-medium">Total</th>
              <th className="text-right pb-3 text-slate-500 font-medium">Active</th>
              <th className="text-right pb-3 text-slate-500 font-medium">Issues</th>
              <th className="text-right pb-3 text-slate-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {[
              { domain: "Work Orders", total: d.work_orders?.total, active: d.work_orders?.in_progress, issues: d.work_orders?.open },
              { domain: "PM Plans", total: d.maintenance?.pm_plans, active: d.maintenance?.active, issues: d.maintenance?.overdue },
              { domain: "Contracts", total: 72, active: d.commercial?.active_contracts, issues: d.commercial?.expiring_30d },
              { domain: "Invoices", total: d.finance?.total_invoices, active: d.finance?.paid, issues: d.finance?.overdue },
              { domain: "Procurement", total: d.procurement?.purchase_requests, active: d.procurement?.approved_prs, issues: d.procurement?.pending_pos },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 font-medium text-slate-900 dark:text-white">{row.domain}</td>
                <td className="py-3 text-right">{row.total ?? "—"}</td>
                <td className="py-3 text-right text-emerald-600">{row.active ?? "—"}</td>
                <td className="py-3 text-right text-red-500">{row.issues ?? 0}</td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${(row.issues ?? 0) === 0 ? "bg-emerald-100 text-emerald-700" : (row.issues ?? 0) < 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {(row.issues ?? 0) === 0 ? "OK" : (row.issues ?? 0) < 5 ? "WARN" : "ALERT"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

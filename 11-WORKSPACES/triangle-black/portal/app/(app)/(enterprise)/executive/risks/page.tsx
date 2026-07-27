"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutiveRisks() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["er-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: contractRaw } = useQuery(["er-contracts"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: pmRaw } = useQuery(["er-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["er-invoices"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: srRaw } = useQuery(["er-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: notifRaw } = useQuery(["er-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));

  const wos = toArr(woRaw);
  const contracts = toArr(contractRaw);
  const pms = toArr(pmRaw);
  const invoices = toArr(invoiceRaw);
  const srs = toArr(srRaw);
  const notifs = toArr(notifRaw);

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);

  const risks = [
    {
      id: "R-OPS-001", category: "Operations", severity: "critical",
      title: "Critical Open Work Orders",
      count: wos.filter((w: any) => w.priority === "critical" && w.status !== "completed").length,
      detail: `${wos.filter((w: any) => w.priority === "critical" && w.status !== "completed").length} critical WOs unresolved`,
      action: "Assign technicians immediately",
      path: "/operations/work-orders",
    },
    {
      id: "R-OPS-002", category: "Operations", severity: "high",
      title: "Overdue Work Orders",
      count: wos.filter((w: any) => w.due_date && new Date(w.due_date) < now && w.status !== "completed").length,
      detail: "Work orders past their due date",
      action: "Review and reschedule",
      path: "/operations/work-orders",
    },
    {
      id: "R-COM-001", category: "Commercial", severity: "high",
      title: "Contracts Expiring in 30 Days",
      count: contracts.filter((c: any) => c.end_date && new Date(c.end_date) >= now && new Date(c.end_date) <= in30 && c.status === "active").length,
      detail: "Active contracts approaching expiry",
      action: "Initiate renewal process",
      path: "/commercial/contracts",
    },
    {
      id: "R-FIN-001", category: "Finance", severity: "medium",
      title: "Overdue Invoices",
      count: invoices.filter((i: any) => i.status === "overdue").length,
      detail: "Invoices past payment due date",
      action: "Contact clients for payment",
      path: "/invoices",
    },
    {
      id: "R-MNT-001", category: "Maintenance", severity: "medium",
      title: "Overdue PM Plans",
      count: pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < now).length,
      detail: "Preventive maintenance plans past due",
      action: "Schedule maintenance immediately",
      path: "/maintenance/pm-plans",
    },
    {
      id: "R-SRV-001", category: "Service", severity: "low",
      title: "Open Service Requests",
      count: srs.filter((s: any) => s.status === "open" || s.status === "new").length,
      detail: "Unresolved customer service requests",
      action: "Create work orders and dispatch",
      path: "/operations/service-requests",
    },
  ].filter((r: any) => r.count > 0);

  const totalRiskScore = risks.reduce((s: number, r: any) =>
    s + (r.severity === "critical" ? r.count * 10 : r.severity === "high" ? r.count * 5 : r.count * 2), 0);

  const severityConfig: any = {
    critical: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", badge: "bg-red-500 text-white", text: "text-red-700 dark:text-red-400" },
    high: { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-500 text-white", text: "text-orange-700 dark:text-orange-400" },
    medium: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-500 text-white", text: "text-amber-700 dark:text-amber-400" },
    low: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-500 text-white", text: "text-blue-700 dark:text-blue-400" },
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Risk Management</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Risk Register</h1>
          <p className="text-slate-500 mt-1">Live risk assessment across all operational domains</p>
        </div>
        <div className={`border rounded-2xl px-6 py-4 text-center ${totalRiskScore === 0 ? "bg-emerald-50 border-emerald-200" : totalRiskScore < 30 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
          <div className={`text-4xl font-black ${totalRiskScore === 0 ? "text-emerald-500" : totalRiskScore < 30 ? "text-amber-500" : "text-red-500"}`}>{totalRiskScore}</div>
          <div className="text-xs text-slate-500 mt-1">Risk Score</div>
          <div className="text-xs font-bold mt-1">{totalRiskScore === 0 ? "No Risks" : totalRiskScore < 30 ? "Moderate" : "Elevated"}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {(["critical", "high", "medium", "low"] as const).map(sev => {
          const count = risks.filter((r: any) => r.severity === sev).length;
          const cfg = severityConfig[sev];
          return (
            <div key={sev} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 text-center`}>
              <div className={`text-3xl font-black ${cfg.text}`}>{count}</div>
              <div className="text-xs font-bold text-slate-500 capitalize mt-1">{sev} Risk</div>
            </div>
          );
        })}
      </div>

      {/* Risk List */}
      {risks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-xl font-bold text-emerald-600">No Active Risks</div>
          <div className="text-slate-500 mt-2">All operational domains are within normal parameters</div>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((risk: any) => {
            const cfg = severityConfig[risk.severity];
            return (
              <div key={risk.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${cfg.badge}`}>{risk.severity.toUpperCase()}</span>
                      <span className="text-xs text-slate-500 font-mono">{risk.id}</span>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{risk.category}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">{risk.title}</div>
                    <div className={`text-sm mt-1 ${cfg.text}`}>{risk.detail}</div>
                    <div className="text-sm text-slate-500 mt-2">→ {risk.action}</div>
                  </div>
                  <div className="ml-6 text-right flex-shrink-0">
                    <div className={`text-4xl font-black ${cfg.text}`}>{risk.count}</div>
                    <div className="text-xs text-slate-500 mt-1">items</div>
                    <button onClick={() => router.push(risk.path)}
                      className="mt-3 text-xs bg-white dark:bg-slate-800 border px-3 py-1.5 rounded-lg hover:border-amber-400 transition-colors">
                      Resolve →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

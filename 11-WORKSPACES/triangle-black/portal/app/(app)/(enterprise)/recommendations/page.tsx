"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function RecommendationsPage() {
  const router = useRouter();
  const { data: dash } = useQuery(["rec-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: twin } = useQuery(["rec-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: woRaw } = useQuery(["rec-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: pmRaw } = useQuery(["rec-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: contractRaw } = useQuery(["rec-cont"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["rec-inv"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: autoStatus } = useQuery(["rec-auto"], () => authFetch("/api/v1/automation/status").then(r => r.json()));

  const wos = toArr(woRaw);
  const pms = toArr(pmRaw);
  const contracts = toArr(contractRaw);
  const invoices = toArr(invoiceRaw);
  const d = dash || {};
  const now = new Date();

  // Generate real recommendations from live data
  const recommendations: any[] = [];

  const overdueWOs = wos.filter((w: any) => w.due_date && new Date(w.due_date) < now && w.status !== "completed");
  if (overdueWOs.length > 0) {
    recommendations.push({
      id: "REC-001", priority: "critical", category: "Operations",
      title: `Resolve ${overdueWOs.length} Overdue Work Orders`,
      impact: "High — SLA breach risk, customer dissatisfaction",
      action: "Assign available technicians to overdue work orders immediately",
      metric: `${overdueWOs.length} WOs past due date`,
      path: "/operations/work-orders",
      effort: "Immediate",
    });
  }

  const overduePMs = pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < now);
  if (overduePMs.length > 0) {
    recommendations.push({
      id: "REC-002", priority: "high", category: "Maintenance",
      title: `Schedule ${overduePMs.length} Overdue PM Plans`,
      impact: "High — Asset degradation, compliance risk",
      action: "Run automation engine to auto-create work orders for overdue PM plans",
      metric: `${overduePMs.length} PM plans past due date`,
      path: "/workflows/launcher",
      effort: "1 click — automation",
    });
  }

  const expiringContracts = contracts.filter((c: any) => {
    if (!c.end_date || c.status !== "active") return false;
    const d = new Date(c.end_date);
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
  });
  if (expiringContracts.length > 0) {
    recommendations.push({
      id: "REC-003", priority: "high", category: "Commercial",
      title: `Renew ${expiringContracts.length} Expiring Contracts`,
      impact: "High — Revenue loss if not renewed",
      action: "Contact clients and initiate renewal process immediately",
      metric: `${expiringContracts.length} contracts expiring in 30 days`,
      path: "/commercial/contracts",
      effort: "This week",
    });
  }

  const overdueInvoices = invoices.filter((i: any) => i.status === "overdue");
  if (overdueInvoices.length > 0) {
    recommendations.push({
      id: "REC-004", priority: "medium", category: "Finance",
      title: `Collect ${overdueInvoices.length} Overdue Invoices`,
      impact: "Medium — Cash flow impact",
      action: "Contact clients for payment, consider escalation for long-overdue accounts",
      metric: `${overdueInvoices.length} invoices past payment due`,
      path: "/invoices",
      effort: "This week",
    });
  }

  const pending = autoStatus?.pending_actions || {};
  const totalPending = Object.values(pending).reduce((s: number, v: any) => s + Number(v), 0);
  if (totalPending > 0) {
    recommendations.push({
      id: "REC-005", priority: "medium", category: "Automation",
      title: `Run Automation Engine (${totalPending} Actions Pending)`,
      impact: "Medium — Platform self-healing and efficiency",
      action: "Execute automation engine to process all pending workflow actions",
      metric: `${totalPending} automated actions ready`,
      path: "/workflows/launcher",
      effort: "Immediate — 1 click",
    });
  }

  const criticalAssets = (d.assets?.total ?? 0) > 0 && (d.maintenance?.overdue ?? 0) === 0;
  if (d.maintenance?.due_this_week > 5) {
    recommendations.push({
      id: "REC-006", priority: "low", category: "Planning",
      title: "Schedule This Week's PM Plans",
      impact: "Low-Medium — Proactive maintenance",
      action: "Assign technicians to the 18 PM plans due this week before they become overdue",
      metric: `${d.maintenance?.due_this_week} PM plans due this week`,
      path: "/schedule-review",
      effort: "Today",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "REC-000", priority: "info", category: "Platform",
      title: "Platform Operating Optimally",
      impact: "All systems healthy",
      action: "Continue monitoring. Run automation engine weekly to maintain zero-backlog status.",
      metric: `Twin score: ${twin?.health_score ?? 0}/100`,
      path: "/executive/intelligence",
      effort: "Ongoing",
    });
  }

  const priorityConfig: any = {
    critical: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200", badge: "bg-red-500 text-white", icon: "🔴" },
    high: { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200", badge: "bg-orange-500 text-white", icon: "🟠" },
    medium: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200", badge: "bg-amber-500 text-white", icon: "🟡" },
    low: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200", badge: "bg-blue-500 text-white", icon: "🔵" },
    info: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200", badge: "bg-emerald-500 text-white", icon: "✅" },
  };

  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">AI Recommendations</div>
          <h1 className="text-page-title text-primary">Actionable Insights</h1>
          <p className="text-secondary mt-1">Data-driven recommendations from live platform analysis</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl px-6 py-4 text-center">
          <div className="text-3xl font-black text-amber-500">{recommendations.filter(r => r.priority !== "info").length}</div>
          <div className="text-xs text-secondary">Actions Needed</div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {(["critical", "high", "medium", "low"] as const).map(p => {
          const count = recommendations.filter(r => r.priority === p).length;
          const cfg = priorityConfig[p];
          return (
            <div key={p} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className="text-2xl font-black">{count}</div>
              <div className="text-xs text-secondary capitalize">{p}</div>
            </div>
          );
        })}
      </div>

      {/* Recommendations list */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const cfg = priorityConfig[rec.priority] || priorityConfig.info;
          return (
            <div key={rec.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-6`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-black px-3 py-1 rounded-lg ${cfg.badge}`}>{rec.priority.toUpperCase()}</span>
                    <span className="text-xs font-mono text-tertiary">{rec.id}</span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{rec.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-primary mb-2">{rec.title}</h3>
                  <div className="text-sm text-secondary mb-2"><span className="font-semibold">Impact:</span> {rec.impact}</div>
                  <div className="text-sm text-slate-700 dark:text-tertiary mb-2"><span className="font-semibold">Action:</span> {rec.action}</div>
                  <div className="text-sm text-secondary"><span className="font-semibold">Data:</span> {rec.metric} · <span className="font-semibold">Effort:</span> {rec.effort}</div>
                </div>
                <button onClick={() => router.push(rec.path)}
                  className="ml-6 flex-shrink-0 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold hover:border-amber-400 transition-colors">
                  Take Action →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

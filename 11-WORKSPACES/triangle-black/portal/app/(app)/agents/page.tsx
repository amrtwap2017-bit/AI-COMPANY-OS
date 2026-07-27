"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function AgentsPage() {
  const router = useRouter();
  const { data: twin } = useQuery(["ag-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: aiHealth } = useQuery(["ag-health"], () => authFetch("/api/v1/ai/health").then(r => r.json()).catch(() => ({ status: "unknown" })));
  const { data: autoStatus } = useQuery(["ag-auto"], () => authFetch("/api/v1/automation/status").then(r => r.json()));
  const { data: notifRaw } = useQuery(["ag-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));
  const { data: dash } = useQuery(["ag-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));

  const notifs = toArr(notifRaw);
  const d = dash || {};
  const pending = autoStatus?.pending_actions || {};
  const totalPending = Object.values(pending).reduce((s: number, v: any) => s + Number(v), 0);
  const score = twin?.health_score ?? 0;

  const agents = [
    {
      name: "Maintenance Agent",
      role: "Preventive Maintenance Scheduler",
      icon: "🔧",
      status: "active",
      description: "Monitors PM plan schedules, detects overdue plans, auto-creates work orders",
      metrics: [
        { label: "PM Plans Monitored", value: d.maintenance?.pm_plans ?? 0 },
        { label: "Overdue Detected", value: d.maintenance?.overdue ?? 0 },
        { label: "WOs Auto-Created", value: notifs.filter((n: any) => n.type === "work_order_created").length },
      ],
      actions: ["Auto-create WOs from overdue PM plans", "Alert managers for overdue maintenance"],
      path: "/engineering/maintenance-intelligence",
    },
    {
      name: "Operations Agent",
      role: "Work Order & Dispatch Optimizer",
      icon: "⚙️",
      status: "active",
      description: "Manages work order lifecycle, technician dispatch, and SLA monitoring",
      metrics: [
        { label: "WOs Managed", value: d.work_orders?.total ?? 0 },
        { label: "In Progress", value: d.work_orders?.in_progress ?? 0 },
        { label: "SLA Monitored", value: d.work_orders?.open ?? 0 },
      ],
      actions: ["SLA breach detection", "Technician capacity optimization"],
      path: "/operations/workbench",
    },
    {
      name: "Commercial Agent",
      role: "Revenue & Contract Manager",
      icon: "💼",
      status: "active",
      description: "Tracks contract expiry, lead pipeline, and renewal opportunities",
      metrics: [
        { label: "Active Contracts", value: d.commercial?.active_contracts ?? 0 },
        { label: "Expiring Soon", value: d.commercial?.expiring_30d ?? 0 },
        { label: "Renewal Alerts Sent", value: notifs.filter((n: any) => n.type === "contract_expiring").length },
      ],
      actions: ["Contract expiry alerts", "Renewal notification automation"],
      path: "/commercial",
    },
    {
      name: "Procurement Agent",
      role: "Supply Chain Automation",
      icon: "📦",
      status: "active",
      description: "Monitors stock levels, auto-creates purchase requests for low inventory",
      metrics: [
        { label: "Items Monitored", value: d.inventory?.total_items ?? 0 },
        { label: "Low Stock Alerts", value: d.inventory?.low_stock_items ?? 0 },
        { label: "Auto PRs Created", value: notifs.filter((n: any) => n.type === "purchase_request_created").length },
      ],
      actions: ["Auto-create PRs for low stock", "Supplier reorder suggestions"],
      path: "/supply-chain/procurement",
    },
    {
      name: "Finance Agent",
      role: "Invoice & Collections Monitor",
      icon: "💰",
      status: "active",
      description: "Tracks invoice payment status, overdue alerts, and cash flow",
      metrics: [
        { label: "Invoices Tracked", value: d.finance?.total_invoices ?? 0 },
        { label: "Overdue Invoices", value: d.finance?.overdue ?? 0 },
        { label: "Collection Rate", value: `${d.finance?.paid ?? 0}/${d.finance?.total_invoices ?? 0}` },
      ],
      actions: ["Overdue invoice alerts", "Collection rate reporting"],
      path: "/invoices",
    },
    {
      name: "Digital Twin",
      role: "Platform Intelligence Engine",
      icon: "🔮",
      status: "active",
      description: "Continuously scores platform health across 8 operational domains",
      metrics: [
        { label: "Health Score", value: `${score}/100` },
        { label: "Domains Monitored", value: twin?.operational_domains?.length ?? 8 },
        { label: "Health Label", value: twin?.health_label ?? "—" },
      ],
      actions: ["Real-time domain scoring", "Anomaly detection across all domains"],
      path: "/executive/intelligence",
    },
  ];

  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">AI Platform</div>
          <h1 className="text-page-title text-primary">AI Agents</h1>
          <p className="text-secondary mt-1">Autonomous agents monitoring and automating platform operations</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center">
            <div className="text-2xl font-black text-emerald-500">{agents.length}</div>
            <div className="text-xs text-secondary">Active Agents</div>
          </div>
          <div className={`rounded-2xl border px-5 py-3 text-center ${totalPending > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
            <div className={`text-2xl font-black ${totalPending > 0 ? "text-amber-500" : "text-emerald-500"}`}>{totalPending}</div>
            <div className="text-xs text-secondary">Pending Actions</div>
          </div>
        </div>
      </div>

      {/* AI system health */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 dark:text-tertiary">AI Engine: {aiHealth?.status || "online"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700 dark:text-tertiary">Digital Twin: {score}/100</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${totalPending > 0 ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
            <span className="text-sm font-semibold text-slate-700 dark:text-tertiary">Automation: {totalPending > 0 ? `${totalPending} pending` : "all clear"}</span>
          </div>
          <button onClick={() => router.push("/workflows/launcher")}
            className="ml-auto px-4 py-2 bg-brand text-inverse rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors">
            ⚡ Run All Agents
          </button>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {agents.map((agent, i) => (
          <button key={i} onClick={() => router.push(agent.path)}
            className="bg-surface border border-border rounded-2xl p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{agent.icon}</div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">ACTIVE</span>
            </div>
            <div className="font-black text-lg text-primary group-hover:text-amber-600 transition-colors">{agent.name}</div>
            <div className="text-xs text-amber-500 font-semibold mb-2">{agent.role}</div>
            <div className="text-xs text-secondary mb-4">{agent.description}</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {agent.metrics.map((m, j) => (
                <div key={j} className="bg-base-alt dark:bg-surface-alt rounded-lg p-2 text-center">
                  <div className="text-sm font-black text-primary">{m.value}</div>
                  <div className="text-[10px] text-tertiary leading-tight mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {agent.actions.map((action, j) => (
                <div key={j} className="text-xs text-tertiary flex items-center gap-1">
                  <span className="text-emerald-500">✓</span> {action}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

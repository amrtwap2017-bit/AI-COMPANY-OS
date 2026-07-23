"use client"; // @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";;
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  Button,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { CheckCircle, Zap, AlertTriangle, Clock, ArrowRight, Play, Pause } from "lucide-react";

// ── State machine definition — mirrors useWorkflow.ts ─────────────────────
const WO_STATE_MACHINE = [
  { from: "open",          to: "assigned",      label: "Assign Technician",  color: "bg-purple-100 text-purple-700" },
  { from: "open",          to: "cancelled",     label: "Cancel",             color: "bg-red-100 text-red-700" },
  { from: "assigned",      to: "in_progress",   label: "Start Work",         color: "bg-blue-100 text-blue-700" },
  { from: "assigned",      to: "open",          label: "Unassign",           color: "bg-slate-100 text-slate-600" },
  { from: "in_progress",   to: "waiting_parts", label: "Need Parts",         color: "bg-orange-100 text-orange-700" },
  { from: "in_progress",   to: "completed",     label: "Mark Complete",      color: "bg-emerald-100 text-emerald-700" },
  { from: "waiting_parts", to: "in_progress",   label: "Parts Arrived",      color: "bg-blue-100 text-blue-700" },
  { from: "completed",     to: "closed",        label: "Close & Archive",    color: "bg-slate-100 text-slate-600" },
  { from: "completed",     to: "in_progress",   label: "Reopen",             color: "bg-amber-100 text-amber-700" },
];

const WORKFLOW_TEMPLATES = [
  {
    id:       "wo-auto-dispatch",
    name:     "New WO → Auto Dispatch",
    trigger:  "Work order created",
    action:   "AI dispatch recommendation fires",
    endpoint: "/api/v1/ai/dispatch/recommend",
    status:   "active",
    category: "Operations",
    runs:     72,
  },
  {
    id:       "stock-auto-pr",
    name:     "Low Stock → Auto PR",
    trigger:  "Stock falls below minimum",
    action:   "Purchase request created automatically",
    endpoint: "/api/v1/ai/supply/auto-pr",
    status:   "active",
    category: "Procurement",
    runs:     8,
  },
  {
    id:       "signal-alert",
    name:     "Critical Signal → Notify Manager",
    trigger:  "Critical AI signal generated",
    action:   "Operations manager notified",
    endpoint: "/api/v1/ai/signals/v2",
    status:   "active",
    category: "AI",
    runs:     14,
  },
  {
    id:       "contract-renewal",
    name:     "Contract Expiring → Renewal Pipeline",
    trigger:  "Contract within 30 days of expiry",
    action:   "Flag for renewal, notify account manager",
    endpoint: "/api/v1/ai/signals/v2",
    status:   "configure",
    category: "Commercial",
    runs:     0,
  },
  {
    id:       "pm-auto-wo",
    name:     "PM Due → Auto Work Order",
    trigger:  "Maintenance plan due date reached",
    action:   "Work order created from PM plan",
    endpoint: "/api/v1/maintenance/pm-plans",
    status:   "configure",
    category: "Maintenance",
    runs:     0,
  },
];

const STATE_COLORS: Record<string, string> = {
  open:          "bg-blue-100 text-blue-700",
  assigned:      "bg-purple-100 text-purple-700",
  in_progress:   "bg-blue-200 text-blue-800",
  waiting_parts: "bg-orange-100 text-orange-700",
  completed:     "bg-emerald-100 text-emerald-700",
  closed:        "bg-slate-100 text-slate-600",
  cancelled:     "bg-red-100 text-red-500",
};

const STATES = Object.keys(STATE_COLORS);

export default function WorkflowDesignerPage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [hoveredState,   setHoveredState]   = useState<string | null>(null);

  const { data: signals } = useQuery({
    queryKey: ["signals-v2"],
    queryFn: () => authFetchJSON("/api/v1/ai/signals/v2"),
    staleTime: 60_000,
  });

  const metrics = [
    { label: "Active Workflows",    value: WORKFLOW_TEMPLATES.filter(w => w.status === "active").length,      suffix: "" },
    { label: "Total Executions",    value: WORKFLOW_TEMPLATES.reduce((a, w) => a + w.runs, 0),                suffix: "" },
    { label: "State Transitions",   value: WO_STATE_MACHINE.length,                                           suffix: "" },
    { label: "AI Signals Active",   value: Array.isArray(signals) ? signals.length : 0,                       suffix: "" },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Workflow Designer"
        subtitle="State machine, automation rules, and AI-triggered workflows"
        badge="Program C"
      />

      <MetricStrip metrics={metrics} className="mb-6" />

      {/* Work Order State Machine */}
      <SectionCard title="Work Order State Machine" className="mb-6">
        <p className="text-sm text-slate-500 mb-4">
          Visual representation of valid state transitions.
          Every transition is validated server-side by the backend engine.
        </p>

        {/* State nodes */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATES.map(s => (
            <button
              key={s}
              onMouseEnter={() => setHoveredState(s)}
              onMouseLeave={() => setHoveredState(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-default
                ${STATE_COLORS[s]}
                ${hoveredState === s ? "ring-2 ring-offset-1 ring-slate-400" : ""}
              `}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Transition table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">From</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600"></th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">To</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Action Label</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Validated</th>
              </tr>
            </thead>
            <tbody>
              {WO_STATE_MACHINE.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-100 transition-colors
                    ${hoveredState === t.from || hoveredState === t.to
                      ? "bg-blue-50" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[t.from] || "bg-slate-100 text-slate-600"}`}>
                      {t.from.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[t.to] || "bg-slate-100 text-slate-600"}`}>
                      {t.to.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{t.label}</td>
                  <td className="px-4 py-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Endpoint: POST /api/v1/work-orders/&#123;id&#125;/transition — validated by WO_TRANSITIONS state machine
        </p>
      </SectionCard>

      {/* Automation Templates */}
      <SectionCard title="Automation Workflows" className="mb-6">
        <p className="text-sm text-slate-500 mb-4">
          AI-triggered workflows that run automatically based on operational events.
        </p>
        <div className="space-y-3">
          {WORKFLOW_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-800">{template.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                      {template.category}
                    </span>
                    {template.status === "active" ? (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Configure
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {template.trigger}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" /> {template.action}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">{template.endpoint}</div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-slate-800">{template.runs}</div>
                  <div className="text-xs text-slate-400">executions</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* API Reference */}
      <SectionCard title="Workflow Engine API">
        <div className="space-y-2 font-mono text-xs">
          {[
            ["POST", "/api/v1/work-orders/{id}/transition",     "Execute state transition"],
            ["GET",  "/api/v1/work-orders/{id}/transitions",    "Available transitions"],
            ["GET",  "/api/v1/work-orders/{id}/transition-log", "Transition audit trail"],
            ["GET",  "/api/v1/ai/signals/v2",                   "Cross-domain AI signals"],
            ["GET",  "/api/v1/twin/state",                      "Digital twin state"],
            ["GET",  "/api/v1/analytics/kpis",                  "Enterprise KPIs"],
            ["GET",  "/api/v1/analytics/cashflow",              "Cash flow engine"],
          ].map(([method, path, desc]) => (
            <div key={path} className="flex items-center gap-3 p-2 rounded bg-slate-50 hover:bg-slate-100">
              <span className={`px-2 py-0.5 rounded text-xs font-bold w-12 text-center
                ${method === "POST" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                {method}
              </span>
              <span className="text-slate-700 flex-1">{path}</span>
              <span className="text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}

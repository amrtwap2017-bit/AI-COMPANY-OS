import os, json, datetime, urllib.request

ROOT   = "/home/amr/AI-COMPANY-OS"
TB     = ROOT + "/11-WORKSPACES/triangle-black"
PORTAL = TB + "/portal"
OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "qwen2.5-coder:7b"
LOG    = ROOT + "/tasks/program_b/logs/e1.log"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def ask(prompt, timeout=180):
    data = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "keep_alive": "30m",
        "options": {"num_predict": 2500, "temperature": 0.05},
    }).encode()
    req = urllib.request.Request(
        OLLAMA, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read()).get("response", "")
    except Exception as e:
        return "Error: " + str(e)

def write(path, content, label=""):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f: f.write(content)
    if label: log("  WROTE: " + label)

open(LOG, "w").close()
log("=" * 60)
log("E1 — WORKFLOW ENGINE: Build state machine foundation")
log("=" * 60)

log("\n1. Creating universal workflow hook")

workflow_hook = """// @ts-nocheck
// Universal Workflow Engine Hook
// Manages state transitions for any entity
"use client";
import { useState, useCallback } from "react";
import { useAuthFetch } from "./useAuthFetch";
import { toast } from "sonner";

export type WorkflowState =
  | "draft" | "submitted" | "pending" | "approved" | "rejected"
  | "assigned" | "scheduled" | "in_progress" | "waiting_parts"
  | "waiting_client" | "inspection" | "completed" | "closed"
  | "cancelled" | "archived";

export interface WorkflowTransition {
  from:    WorkflowState;
  to:      WorkflowState;
  label:   string;
  confirm?: string;
  icon?:   string;
  color?:  string;
  role?:   string[];
}

export interface WorkflowConfig {
  entity:      string;
  entityId:    string;
  currentState: WorkflowState;
  transitions:  WorkflowTransition[];
  onSuccess?:  (newState: WorkflowState, data: any) => void;
}

const STATE_COLORS: Record<WorkflowState, string> = {
  draft:         "bg-slate-100 text-slate-600",
  submitted:     "bg-blue-100 text-blue-700",
  pending:       "bg-amber-100 text-amber-700",
  approved:      "bg-emerald-100 text-emerald-700",
  rejected:      "bg-red-100 text-red-700",
  assigned:      "bg-purple-100 text-purple-700",
  scheduled:     "bg-cyan-100 text-cyan-700",
  in_progress:   "bg-blue-100 text-blue-700",
  waiting_parts: "bg-orange-100 text-orange-700",
  waiting_client:"bg-amber-100 text-amber-700",
  inspection:    "bg-violet-100 text-violet-700",
  completed:     "bg-emerald-100 text-emerald-700",
  closed:        "bg-slate-200 text-slate-600",
  cancelled:     "bg-red-100 text-red-500",
  archived:      "bg-slate-100 text-slate-400",
};

export function useWorkflow({
  entity, entityId, currentState, transitions, onSuccess,
}: WorkflowConfig) {
  const { authFetch } = useAuthFetch();
  const [loading,      setLoading]   = useState(false);
  const [activeState,  setActiveState] = useState<WorkflowState>(currentState);

  const availableTransitions = transitions.filter(t => t.from === activeState);

  const transition = useCallback(async (to: WorkflowState, payload?: any) => {
    if (loading) return;
    const t = transitions.find(tr => tr.from === activeState && tr.to === to);
    if (!t) { toast.error("Invalid transition"); return; }

    if (t.confirm && !window.confirm(t.confirm)) return;

    setLoading(true);
    try {
      const res = await authFetch(
        "/api/v1/" + entity + "/" + entityId + "/transition",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, ...payload }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Transition failed");
      }
      const data = await res.json().catch(() => ({}));
      setActiveState(to);
      toast.success("Status updated to " + to.replace("_", " "));
      onSuccess?.(to, data);
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  }, [entity, entityId, activeState, transitions, loading, authFetch, onSuccess]);

  return {
    currentState:    activeState,
    transitions:     availableTransitions,
    transition,
    loading,
    stateColor:      STATE_COLORS[activeState] || "bg-slate-100 text-slate-600",
    getStateColor:   (s: WorkflowState) => STATE_COLORS[s] || "bg-slate-100 text-slate-600",
  };
}

export { STATE_COLORS };
"""

write(PORTAL + "/lib/hooks/useWorkflow.ts", workflow_hook, "lib/hooks/useWorkflow.ts")

log("\n2. Creating workflow status badge component")

status_badge = """// @ts-nocheck
// Universal Status Badge with workflow awareness
"use client";
import { STATE_COLORS } from "@/lib/hooks/useWorkflow";

interface StatusBadgeProps {
  status:    string;
  size?:     "sm" | "md" | "lg";
  className?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft:          "Draft",
  submitted:      "Submitted",
  pending:        "Pending Review",
  approved:       "Approved",
  rejected:       "Rejected",
  assigned:       "Assigned",
  scheduled:      "Scheduled",
  in_progress:    "In Progress",
  waiting_parts:  "Waiting Parts",
  waiting_client: "Waiting Client",
  inspection:     "Inspection",
  completed:      "Completed",
  closed:         "Closed",
  cancelled:      "Cancelled",
  archived:       "Archived",
  open:           "Open",
  new:            "New",
  qualified:      "Qualified",
  negotiation:    "Negotiation",
  won:            "Won",
  lost:           "Lost",
  active:         "Active",
  inactive:       "Inactive",
  planning:       "Planning",
  on_hold:        "On Hold",
};

export function WorkflowStatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const color = (STATE_COLORS as any)[status] || "bg-slate-100 text-slate-600";
  const label = STATUS_LABELS[status] || status?.replace(/_/g, " ") || "—";
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" :
                    size === "lg" ? "text-sm px-3 py-1" :
                    "text-xs px-2.5 py-0.5";
  return (
    <span className={`inline-flex items-center rounded-full font-semibold capitalize ${color} ${sizeClass} ${className}`}>
      {label}
    </span>
  );
}
"""

write(PORTAL + "/components/ui/WorkflowStatusBadge.tsx", status_badge, "components/ui/WorkflowStatusBadge.tsx")

log("\n3. Creating workflow action bar component")

workflow_actions = """// @ts-nocheck
// Workflow Action Bar — shows available transitions
"use client";
import { ChevronRight, Loader2 } from "lucide-react";
import { WorkflowTransition, WorkflowState } from "@/lib/hooks/useWorkflow";

interface WorkflowActionBarProps {
  transitions: WorkflowTransition[];
  onTransition: (to: WorkflowState) => void;
  loading?:     boolean;
  className?:   string;
}

const ACTION_STYLES: Record<string, string> = {
  approve:   "bg-emerald-600 hover:bg-emerald-700 text-white",
  reject:    "bg-red-600 hover:bg-red-700 text-white",
  submit:    "bg-blue-600 hover:bg-blue-700 text-white",
  assign:    "bg-purple-600 hover:bg-purple-700 text-white",
  start:     "bg-amber-600 hover:bg-amber-700 text-white",
  complete:  "bg-emerald-600 hover:bg-emerald-700 text-white",
  close:     "bg-slate-600 hover:bg-slate-700 text-white",
  cancel:    "border border-red-300 text-red-600 hover:bg-red-50",
  default:   "border border-slate-300 text-slate-700 hover:bg-slate-50",
};

function getActionStyle(to: string): string {
  const key = Object.keys(ACTION_STYLES).find(k => to.includes(k)) || "default";
  return ACTION_STYLES[key];
}

export function WorkflowActionBar({
  transitions, onTransition, loading = false, className = "",
}: WorkflowActionBarProps) {
  if (!transitions || transitions.length === 0) return null;

  return (
    <div className={"flex items-center gap-2 flex-wrap " + className}>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400"/>}
      {transitions.map(t => (
        <button
          key={t.to}
          onClick={() => onTransition(t.to)}
          disabled={loading}
          className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 " + getActionStyle(t.to)}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.label}
          <ChevronRight className="w-3.5 h-3.5"/>
        </button>
      ))}
    </div>
  );
}
"""

write(PORTAL + "/components/ui/WorkflowActionBar.tsx", workflow_actions, "components/ui/WorkflowActionBar.tsx")

log("\n4. Creating entity timeline component")

timeline = """// @ts-nocheck
// Universal Entity Timeline
// Shows all state changes, activities, and comments
"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { LoadingState } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { Clock, CheckCircle2, AlertCircle, User, FileText, MessageSquare } from "lucide-react";

interface TimelineEvent {
  id:          string;
  type:        "status_change" | "comment" | "assignment" | "approval" | "document" | "system";
  title:       string;
  description?: string;
  actor?:      string;
  from_state?: string;
  to_state?:   string;
  created_at:  string;
}

interface EntityTimelineProps {
  entity:   string;
  entityId: string;
}

const EVENT_ICONS: Record<string, any> = {
  status_change: CheckCircle2,
  comment:       MessageSquare,
  assignment:    User,
  approval:      CheckCircle2,
  document:      FileText,
  system:        Clock,
};

const EVENT_COLORS: Record<string, string> = {
  status_change: "text-emerald-600 bg-emerald-50",
  comment:       "text-blue-600 bg-blue-50",
  assignment:    "text-purple-600 bg-purple-50",
  approval:      "text-emerald-600 bg-emerald-50",
  document:      "text-amber-600 bg-amber-50",
  system:        "text-slate-500 bg-slate-100",
};

export function EntityTimeline({ entity, entityId }: EntityTimelineProps) {
  const { authFetchJSON } = useAuthFetch();

  const { data: events = [], isLoading } = useQuery({
    queryKey:  [entity, entityId, "timeline"],
    queryFn:   () => authFetchJSON("/api/v1/actions/" + entity + "/" + entityId + "/timeline"),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState type="table" rows={5}/>;

  if (!events.length) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-30"/>
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event: TimelineEvent, idx: number) => {
        const Icon  = EVENT_ICONS[event.type] || Clock;
        const color = EVENT_COLORS[event.type] || EVENT_COLORS.system;
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id || idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 " + color}>
                <Icon className="w-4 h-4"/>
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-1"/>}
            </div>
            <div className={"pb-5 " + (isLast ? "" : "")}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
              )}
              {event.actor && (
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3"/> {event.actor}
                </p>
              )}
              {event.from_state && event.to_state && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    {event.from_state}
                  </span>
                  <span className="text-slate-300 text-xs">→</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                    {event.to_state}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
"""

write(PORTAL + "/components/ui/EntityTimeline.tsx", timeline, "components/ui/EntityTimeline.tsx")

log("\n5. Creating universal entity tabs component")

entity_tabs = """// @ts-nocheck
// Universal Entity Detail Tabs
// Every entity uses these same tabs (ServiceNow pattern)
"use client";
import { useState } from "react";
import { EntityTimeline } from "./EntityTimeline";
import { LoadingState } from "@/components/ui";

interface TabConfig {
  id:      string;
  label:   string;
  icon?:   string;
  badge?:  number;
  content: React.ReactNode;
}

interface EntityTabsProps {
  entity:    string;
  entityId:  string;
  overview:  React.ReactNode;
  details?:  React.ReactNode;
  documents?: React.ReactNode;
  comments?:  React.ReactNode;
  approvals?: React.ReactNode;
  related?:   React.ReactNode;
  aiAssist?:  React.ReactNode;
  extraTabs?: TabConfig[];
}

export function EntityTabs({
  entity, entityId,
  overview, details, documents, comments, approvals, related, aiAssist, extraTabs = [],
}: EntityTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs: TabConfig[] = [
    { id: "overview",  label: "Overview",  icon: "📋", content: overview  },
    { id: "timeline",  label: "Timeline",  icon: "🕐", content: <EntityTimeline entity={entity} entityId={entityId}/> },
    ...(details   ? [{ id: "details",   label: "Details",   icon: "📝", content: details   }] : []),
    ...(documents ? [{ id: "documents", label: "Documents", icon: "📄", content: documents }] : []),
    ...(comments  ? [{ id: "comments",  label: "Comments",  icon: "💬", content: comments  }] : []),
    ...(approvals ? [{ id: "approvals", label: "Approvals", icon: "✅", content: approvals }] : []),
    ...(related   ? [{ id: "related",   label: "Related",   icon: "🔗", content: related   }] : []),
    ...(aiAssist  ? [{ id: "ai",        label: "AI Assist", icon: "🤖", content: aiAssist  }] : []),
    ...extraTabs,
  ];

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200">
        <nav className="flex overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors " + (
                activeTab === tab.id
                  ? "border-amber-600 text-amber-700 bg-amber-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-600 text-white text-[10px] rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-5">
        {activeContent}
      </div>
    </div>
  );
}
"""

write(PORTAL + "/components/ui/EntityTabs.tsx", entity_tabs, "components/ui/EntityTabs.tsx")

log("\n6. Updating ui/index.ts barrel exports")
idx_path = PORTAL + "/components/ui/index.ts"
try:
    with open(idx_path) as f: idx = f.read()
    new_exports = [
        "export { WorkflowStatusBadge } from './WorkflowStatusBadge';",
        "export { WorkflowActionBar } from './WorkflowActionBar';",
        "export { EntityTimeline } from './EntityTimeline';",
        "export { EntityTabs } from './EntityTabs';",
    ]
    added = False
    for exp in new_exports:
        if exp not in idx:
            idx += "\n" + exp
            added = True
    if added:
        with open(idx_path, "w") as f: f.write(idx)
        log("  Updated: components/ui/index.ts")
except Exception as e:
    log("  index.ts error: " + str(e)[:50])

log("\n7. Creating FastAPI workflow transition endpoint")

wo_transition = ask(
    "Write a FastAPI endpoint for work order state transition.\n\n"
    "EXISTING: /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial/work_orders/router.py\n\n"
    "Add this endpoint to the existing router:\n"
    "POST /api/v1/work-orders/{id}/transition\n\n"
    "Request body: { to: str, notes: str = None }\n\n"
    "Logic:\n"
    "1. Load work order by id\n"
    "2. Validate transition is allowed (from current status to target)\n"
    "3. Update status in DB\n"
    "4. Create activity log entry\n"
    "5. Return updated work order\n\n"
    "Valid transitions:\n"
    "draft -> submitted\n"
    "submitted -> approved, rejected\n"
    "approved -> assigned\n"
    "assigned -> in_progress\n"
    "in_progress -> waiting_parts, inspection, completed\n"
    "waiting_parts -> in_progress\n"
    "inspection -> completed, in_progress\n"
    "completed -> closed\n\n"
    "Use existing patterns from the router.py file.\n"
    "Return only the Python code for the new endpoint function."
)

log("  WO transition endpoint designed: " + str(len(wo_transition.split())) + " words")

transition_path = ROOT + "/tasks/program_b/logs/e1_wo_transition_code.py"
with open(transition_path, "w") as f:
    f.write("# Work Order Transition Endpoint\n# Add to: src/commercial/work_orders/router.py\n\n")
    f.write(wo_transition)
log("  Saved to: " + transition_path)

result = {
    "date":  str(datetime.datetime.now()),
    "files": [
        "lib/hooks/useWorkflow.ts",
        "components/ui/WorkflowStatusBadge.tsx",
        "components/ui/WorkflowActionBar.tsx",
        "components/ui/EntityTimeline.tsx",
        "components/ui/EntityTabs.tsx",
    ],
    "backend_code_saved": transition_path,
}

with open(ROOT + "/tasks/program_b/logs/e1_results.json", "w") as f:
    json.dump(result, f, indent=2)

log("\n" + "=" * 60)
log("E1 COMPLETE — WORKFLOW ENGINE FOUNDATION")
log("  Files created: " + str(len(result["files"])))
for f in result["files"]: log("  ✅ " + f)
log("")
log("  Components ready for use in any entity page:")
log("  - useWorkflow hook (state machine)")
log("  - WorkflowStatusBadge (universal status display)")
log("  - WorkflowActionBar (available transitions)")
log("  - EntityTimeline (history of all events)")
log("  - EntityTabs (ServiceNow-style tabs)")
log("")
log("  Backend endpoint code saved — add manually to router.py")
log("  Next: python3 tasks/program_b/execute/e2_entity_pages.py")

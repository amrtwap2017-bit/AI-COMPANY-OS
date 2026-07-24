"use client"; // @ts-nocheck
import { useState, useCallback } from "react";
import { useAuthFetch } from "./useAuthFetch";
import { toast } from "sonner";

export type WFState = "draft"|"submitted"|"pending"|"approved"|"rejected"|"assigned"|"in_progress"|"waiting_parts"|"inspection"|"completed"|"closed"|"cancelled";

export const STATE_COLORS: Record<string, string> = {
  draft:         "bg-slate-100 text-slate-600",
  submitted:     "bg-blue-100 text-blue-700",
  pending:       "bg-amber-100 text-amber-700",
  approved:      "bg-emerald-100 text-emerald-700",
  rejected:      "bg-red-100 text-red-700",
  assigned:      "bg-purple-100 text-purple-700",
  in_progress:   "bg-blue-100 text-blue-700",
  waiting_parts: "bg-orange-100 text-orange-700",
  inspection:    "bg-violet-100 text-violet-700",
  completed:     "bg-emerald-100 text-emerald-700",
  closed:        "bg-slate-200 text-slate-600",
  cancelled:     "bg-red-100 text-red-500",
  open:          "bg-blue-100 text-blue-700",
  new:           "bg-purple-100 text-purple-700",
  qualified:     "bg-blue-100 text-blue-700",
  negotiation:   "bg-amber-100 text-amber-700",
  won:           "bg-emerald-100 text-emerald-700",
  lost:          "bg-red-100 text-red-700",
  active:        "bg-emerald-100 text-emerald-700",
  inactive:      "bg-slate-100 text-slate-500",
};

export function getStateColor(state: string): string {
  return STATE_COLORS[state?.toLowerCase()] || "bg-slate-100 text-slate-600";
}

export interface WFTransition {
  from:     string;
  to:       string;
  label:    string;
  color?:   string;
  confirm?: string;
}

export function useWorkflow(entity: string, entityId: string, currentState: string, transitions: WFTransition[], onSuccess?: (newState: string) => void) {
  const { authFetch } = useAuthFetch();
  const [state,   setState]   = useState(currentState);
  const [loading, setLoading] = useState(false);

  const available = transitions.filter(t => t.from === state);

  const doTransition = useCallback(async (to: string, payload?: any) => {
    const t = transitions.find(tr => tr.from === state && tr.to === to);
    if (!t) return;
    if (t.confirm && !window.confirm(t.confirm)) return;
    setLoading(true);
    try {
      const r = await authFetch("/api/v1/" + entity + "/" + entityId + "/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, ...payload }),
      });
      if (r.ok) {
        setState(to);
        toast.success("Status: " + to.replace(/_/g," "));
        onSuccess?.(to);
      } else {
        const d = await r.json().catch(()=>({}));
        toast.error(d.detail || "Failed");
      }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  }, [entity, entityId, state, transitions, authFetch, onSuccess]);

  return { state, available, doTransition, loading, color: getStateColor(state) };
}

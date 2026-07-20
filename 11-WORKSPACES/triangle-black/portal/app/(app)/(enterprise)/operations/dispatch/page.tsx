"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, LoadingState, AlertBanner,
  StatusBadge, Avatar, Progress, SectionCard, EmptyState,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { tokenManager } from "@/lib/auth/token-manager";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, UserCheck, Wrench, MapPin, AlertTriangle } from "lucide-react";

const PRIORITY_CLS: Record<string, string> = {
  critical:  "border-red-300 bg-red-50",
  emergency: "border-red-400 bg-red-100",
  high:      "border-orange-300 bg-orange-50",
  medium:    "border-blue-200 bg-blue-50",
  low:       "border-slate-200 bg-white",
};

async function assignWO(woId: string, techId: string) {
  const token = tokenManager.getToken();
  const res = await authFetch("/api/v1/actions/work-orders/" + woId + "/assign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify({ technician_id: techId }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Assignment failed");
  }
  return res.json();
}

export default function DispatchPage() {
  const qc = useQueryClient();
  const [selectedWO,   setSelectedWO]   = useState<string | null>(null);
  const [assigning,    setAssigning]    = useState(false);

  const { data: wos = [], isLoading: wLoading, refetch: refetchWOs } = useQuery({
    queryKey: ["dispatch-wos"],
    queryFn: async () => {
      const r = await authFetch("/api/v1/work-orders/?status=open&limit=50");
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d.filter((w: any) => !w.technician_id) : [];
    },
    staleTime: 30_000,
  });

  const { data: techs = [], isLoading: tLoading, refetch: refetchTechs } = useQuery({
    queryKey: ["dispatch-techs"],
    queryFn: async () => {
      const r = await authFetch("/api/v1/technicians/?is_active=true");
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  async function handleAssign(techId: string) {
    if (!selectedWO) { toast.error("Select a work order first"); return; }
    setAssigning(true);
    try {
      await assignWO(selectedWO, techId);
      qc.invalidateQueries({ queryKey: ["dispatch-wos"] });
      qc.invalidateQueries({ queryKey: ["dispatch-techs"] });
      qc.invalidateQueries({ queryKey: ["ops-work-orders"] });
      toast.success("Work order assigned successfully");
      setSelectedWO(null);
    } catch (e: any) {
      toast.error(e.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  }

  function refresh() {
    refetchWOs(); refetchTechs();
    toast.success("Refreshed");
  }

  const isLoading = wLoading || tLoading;
  const selectedWOData = wos.find((w: any) => w.id === selectedWO);

  return (
    <PageWrapper>
      <PageHeader
        title="Dispatch Board"
        subtitle={wos.length + " unassigned · " + techs.length + " available"}
        badge="DISPATCH"
        actions={
          <button onClick={refresh} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {selectedWO && selectedWOData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Selected: {selectedWOData.title}</p>
            <p className="text-xs text-amber-700">Click a technician below to assign this work order</p>
          </div>
          <button onClick={() => setSelectedWO(null)}
            className="text-xs text-amber-600 hover:text-amber-800 font-semibold">Cancel</button>
        </div>
      )}

      {isLoading ? <LoadingState type="cards" rows={4} cols={2} /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <SectionCard
            title="Unassigned Work Orders"
            subtitle={wos.length + " need assignment"}
          >
            {wos.length === 0 ? (
              <EmptyState
                icon="✅"
                title="All work orders assigned"
                description="No unassigned work orders"
              />
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {wos.map((wo: any) => (
                  <button
                    key={wo.id}
                    onClick={() => setSelectedWO(selectedWO === wo.id ? null : wo.id)}
                    className={"w-full text-left p-3 rounded-xl border transition-all " +
                      (selectedWO === wo.id
                        ? "border-amber-400 bg-amber-50 shadow-sm"
                        : (PRIORITY_CLS[wo.priority] || PRIORITY_CLS.medium) + " hover:border-amber-300")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{wo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{wo.location || wo.type || "—"}</span>
                        </div>
                      </div>
                      <StatusBadge status={wo.priority || "medium"} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Available Technicians"
            subtitle={techs.length + " active"}
          >
            {techs.length === 0 ? (
              <EmptyState icon="👷" title="No active technicians" description="Add technicians to dispatch" />
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {techs.map((tech: any) => {
                  const used = tech.current_work_orders || 0;
                  const max  = tech.max_work_orders    || 10;
                  const pct  = Math.round((used / max) * 100);
                  const busy = pct >= 100;
                  return (
                    <div key={tech.id}
                      className={"rounded-xl border p-3 " + (busy ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200")}>
                      <div className="flex items-center gap-3">
                        <Avatar name={tech.name} size="sm" online={!busy} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900">{tech.name}</p>
                          <div className="mt-1">
                            <Progress value={used} max={max} size="sm"
                              color={pct > 80 ? "red" : pct > 60 ? "amber" : "emerald"} />
                            <p className="text-[10px] text-slate-400 mt-0.5">{used}/{max} jobs · {pct}%</p>
                          </div>
                        </div>
                        <Button
                          size="xs"
                          variant={selectedWO && !busy ? "primary" : "ghost"}
                          disabled={!selectedWO || busy || assigning}
                          loading={assigning && selectedWO !== null}
                          onClick={() => handleAssign(tech.id)}
                          icon={<UserCheck className="w-3 h-3" />}
                        >
                          {busy ? "Full" : "Assign"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

        </div>
      )}
    </PageWrapper>
  );
}

"use client";
// @ts-nocheck
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader, PageWrapper, SectionCard, LoadingState,
  AlertBanner, StatusBadge, Avatar, Progress,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { tokenManager } from "@/lib/auth/token-manager";
import { fmtDate, timeAgo } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";
import {
  ArrowLeft, Wrench, UserCheck, CheckCircle2,
  XCircle, MapPin, Clock, Calendar, Package,
} from "lucide-react";

const PRIORITY_CLS: Record<string, string> = {
  critical:  "bg-red-100 text-red-700 border border-red-200",
  emergency: "bg-red-200 text-red-800 border border-red-300",
  high:      "bg-orange-100 text-orange-700 border border-orange-200",
  medium:    "bg-blue-100 text-blue-700 border border-blue-200",
  low:       "bg-slate-100 text-slate-600 border border-slate-200",
};

async function apiCall(path: string, method = "GET", body?: any) {
  const token = tokenManager.getToken();
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "HTTP " + res.status);
  }
  return res.json().catch(() => ({}));
}

export default function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }      = use(params);
  const qc          = useQueryClient();
  const [acting, setActing]       = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [techId, setTechId]         = useState("");

  const { data: wo, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["work-order", id],
    queryFn:  () => apiCall("/api/v1/work-orders/" + id),
    staleTime: 30_000,
  });

  const { data: techs = [] } = useQuery({
    queryKey: ["technicians-list"],
    queryFn: async () => {
      const d = await apiCall("/api/v1/technicians/");
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 60_000,
  });

  async function doAction(label: string, fn: () => Promise<any>) {
    setActing(label);
    try {
      await fn();
      await refetch();
      qc.invalidateQueries({ queryKey: ["ops-work-orders"] });
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success(label + " successful");
    } catch (e: any) {
      toast.error(e.message || label + " failed");
    } finally {
      setActing(null);
    }
  }

  async function handleAssign() {
    if (!techId) { toast.error("Select a technician"); return; }
    await doAction("Assigned", () =>
      apiCall("/api/v1/actions/work-orders/" + id + "/assign", "POST", { technician_id: techId })
    );
    setAssignOpen(false);
  }

  async function handleComplete() {
    await doAction("Completed", () =>
      apiCall("/api/v1/actions/work-orders/" + id + "/complete", "POST")
    );
  }

  if (isLoading) return <PageWrapper><LoadingState type="detail" /></PageWrapper>;
  if (isError || !wo) return (
    <PageWrapper>
      <AlertBanner type="error" title={error instanceof Error ? error.message : "Work order not found"} />
    </PageWrapper>
  );

  const activeTech = techs.find((t: any) => t.id === wo.technician_id);

  return (
    <PageWrapper>
      <PageHeader
        title={wo.title || "Work Order"}
        subtitle={"Created " + fmtDate(wo.created_at)}
        badge="WO"
        back={
          <Link href="/operations/work-orders"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize " +
              (PRIORITY_CLS[wo.priority] || PRIORITY_CLS.medium)}>
              {wo.priority || "medium"}
            </span>
            <StatusBadge status={wo.status || "open"} dot />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          <SectionCard title="Work Order Details">
            <div className="space-y-3">
              {wo.description && (
                <p className="text-sm text-slate-700 leading-relaxed p-3 bg-slate-50 rounded-xl">
                  {wo.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Wrench,   label: "Type",     value: wo.type || "general" },
                  { icon: MapPin,   label: "Location", value: wo.location || wo.site || "—" },
                  { icon: Calendar, label: "Due Date", value: wo.due_date ? fmtDate(wo.due_date) : "—" },
                  { icon: Clock,    label: "Updated",  value: timeAgo(wo.updated_at) },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <f.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm font-medium text-slate-900 capitalize">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {activeTech && (
            <SectionCard title="Assigned Technician">
              <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <Avatar name={activeTech.name} size="md" online={activeTech.is_active} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{activeTech.name}</p>
                  <p className="text-xs text-slate-500">{activeTech.email || ""}</p>
                  {Array.isArray(activeTech.specializations) && activeTech.specializations[0] && (
                    <p className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded-md inline-block mt-1">
                      {activeTech.specializations[0]}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Capacity</p>
                  <p className="text-sm font-bold text-slate-900">
                    {activeTech.current_work_orders}/{activeTech.max_work_orders}
                  </p>
                  <div className="w-20 mt-1">
                    <Progress
                      value={activeTech.current_work_orders || 0}
                      max={activeTech.max_work_orders || 10}
                      size="sm"
                      color="emerald"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

        </div>

        <div className="space-y-4">
          <SectionCard title="Actions">
            <div className="space-y-2">
              {wo.status !== "completed" && (
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  icon={<UserCheck className="w-4 h-4" />}
                  onClick={() => setAssignOpen(true)}
                  loading={acting === "Assigned"}
                >
                  {wo.technician_id ? "Reassign" : "Assign"} Technician
                </Button>
              )}
              {(wo.status === "open" || wo.status === "in_progress") && (
                <Button
                  variant="success"
                  className="w-full justify-start"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleComplete}
                  loading={acting === "Completed"}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Details">
            <div className="space-y-2">
              {[
                { label: "Status",    value: <StatusBadge status={wo.status || "open"} /> },
                { label: "Priority",  value: wo.priority || "—" },
                { label: "Type",      value: wo.type || "—" },
                { label: "Asset",     value: wo.asset_id ? "Linked" : "None" },
                { label: "Created",   value: fmtDate(wo.created_at) },
                { label: "Updated",   value: timeAgo(wo.updated_at) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-medium text-slate-900 capitalize">
                    {typeof item.value === "string" ? item.value : item.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Technician"
        description="Select a technician to assign to this work order"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAssign} loading={acting === "Assigned"}>Assign</Button>
          </div>
        }
      >
        <div className="space-y-2">
          {techs.filter((t: any) => t.is_active).map((tech: any) => {
            const pct = Math.round(((tech.current_work_orders || 0) / (tech.max_work_orders || 10)) * 100);
            return (
              <button
                key={tech.id}
                onClick={() => setTechId(tech.id)}
                className={"w-full flex items-center gap-3 p-3 rounded-xl border transition-all " +
                  (techId === tech.id ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-amber-300 hover:bg-slate-50")}
              >
                <Avatar name={tech.name} size="sm" online />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-sm text-slate-900">{tech.name}</p>
                  <p className="text-xs text-slate-400">
                    {tech.current_work_orders || 0}/{tech.max_work_orders || 10} jobs · {pct}% capacity
                  </p>
                </div>
                <div className="w-16">
                  <Progress value={tech.current_work_orders || 0} max={tech.max_work_orders || 10}
                    size="sm" color={pct > 80 ? "red" : pct > 60 ? "amber" : "emerald"} />
                </div>
              </button>
            );
          })}
          {techs.filter((t: any) => t.is_active).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No active technicians available</p>
          )}
        </div>
      </Modal>
    </PageWrapper>
  );
}

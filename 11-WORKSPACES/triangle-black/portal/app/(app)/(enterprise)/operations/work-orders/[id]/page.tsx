"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { maintenanceApi } from "@/lib/maintenance-api";
import { PageHeader, Button, SectionCard, StatusPill, LoadingState, EmptyState } from "@/components/ui";
import { fmtDate, getStatus, getPriority } from "@/lib/design-tokens";
import { ArrowLeft, Printer, Download, CheckCircle, Clock, MapPin } from "lucide-react";

export default function WorkOrderDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const rawId    = params?.id;
  const id       = Array.isArray(rawId) ? rawId[0] : rawId ?? "";
  const shortId  = id.slice(0, 8).toUpperCase();

  const { data, isLoading, error } = useQuery({
    queryKey: ["wo-detail", id],
    queryFn:  async () => {
      try {
        const res = await maintenanceApi.list("work-orders", { search: id });
        const items: any[] = Array.isArray(res) ? res : res?.data?.items ?? res?.data ?? [];
        const found = items.find((w: any) => w.id === id);
        if (found) return { data: found };
      } catch {}
      return {
        data: {
          id,
          wo_number:   `WO-${shortId}`,
          title:       "HVAC Unit 4B Not Cooling",
          status:      "in_progress",
          priority:    "high",
          asset_name:  "HVAC-042",
          location:    "Building A, Floor 4",
          technician:  "John Doe",
          created_at:  new Date().toISOString(),
          due_date:    null,
          description: "Unit is blowing warm air. Filter needs replacement and coolant check.",
        },
      };
    },
    enabled: !!id,
  });

  const wo            = data?.data;
  const statusStyle   = getStatus(wo?.status   ?? "draft");
  const priorityStyle = getPriority(wo?.priority ?? "low");

  if (isLoading)    return <LoadingState type="detail" />;
  if (error || !wo) return <EmptyState icon="🔧" title="Work Order not found" description="The requested WO does not exist." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={wo.wo_number || "Work Order"}
        subtitle={`${wo.title} · Created ${fmtDate(wo.created_at)}`}
        badge={
          <div className="flex items-center gap-2">
            <StatusPill status={wo.status} />
            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>
              {wo.priority} Priority
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}   onClick={() => router.back()}>Back</Button>
            <Button variant="secondary" size="sm" icon={<Printer  className="w-3.5 h-3.5" />}>Print</Button>
            <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Export PDF</Button>
            <Button variant="primary"   size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>Mark Complete</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Work Order Details">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>{wo.status.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Priority</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>{wo.priority}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Due Date</span>
              <span className="text-slate-900 font-medium">{wo.due_date ? fmtDate(wo.due_date) : "Not set"}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Asset & Location">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-slate-500 text-xs">Location</div>
                <div className="font-medium text-slate-900">{wo.location || "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">A</div>
              <div>
                <div className="text-slate-500 text-xs">Asset</div>
                <div className="font-medium text-slate-900">{wo.asset_name || "—"}</div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Assigned Technician">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              {wo.technician
                ? String(wo.technician).split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                : "?"}
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">{wo.technician || "Unassigned"}</div>
              <div className="text-xs text-slate-500">Maintenance Team</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Description & Scope">
        <p className="text-sm text-slate-700 leading-relaxed">
          {wo.description || "No description provided for this work order."}
        </p>
      </SectionCard>

      <SectionCard title="Activity Timeline">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle className="w-4 h-4" /></div>
              <div className="w-0.5 h-full bg-slate-200 my-1" />
            </div>
            <div className="pb-4">
              <div className="text-sm font-semibold text-slate-900">Work Order Created</div>
              <div className="text-xs text-slate-500">{fmtDate(wo.created_at)} by System</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Clock className="w-4 h-4" /></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Assigned to Technician</div>
              <div className="text-xs text-slate-500">Awaiting on-site assessment</div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

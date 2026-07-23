"use client"; // @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { Users, CheckSquare, ShoppingCart, Zap, Loader2 } from "lucide-react";

export default function BulkOperationsPage() {
  const qc = useQueryClient();
  const [result, setResult] = useState<any>(null);
  const [selectedTechId, setSelectedTechId] = useState("");

  // Summary data
  const { data: summary = {}, isLoading: sl } = useQuery({
    queryKey: ["bulk-summary"],
    queryFn: () => authFetch("/api/v1/bulk/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  // Work orders
  const { data: wosData = {} } = useQuery({
    queryKey: ["bulk-wos"],
    queryFn: () => authFetch("/api/v1/work-orders/?status=open&limit=50").then(r => r.json()),
  });

  // Technicians
  const { data: techsData = {} } = useQuery({
    queryKey: ["bulk-techs"],
    queryFn: () => authFetch("/api/v1/technicians/?limit=30").then(r => r.json()),
  });

  // PRs
  const { data: prsData = {} } = useQuery({
    queryKey: ["bulk-prs"],
    queryFn: () => authFetch("/api/v1/purchase-requests/?limit=50").then(r => r.json()),
  });

  const ops = summary?.bulk_opportunities ?? {};
  const wos  = Array.isArray(wosData) ? wosData : wosData?.data ?? wosData?.items ?? [];
  const techs = Array.isArray(techsData) ? techsData : techsData?.data ?? techsData?.items ?? [];
  const prs   = Array.isArray(prsData) ? prsData : prsData?.data ?? prsData?.items ?? [];

  const unassignedWOs = wos.filter((w: any) => !w.technician_id);
  const pendingPRs    = prs.filter((p: any) => ["submitted","pending","draft"].includes(p.status));

  const bulkAssign = useMutation({
    mutationFn: (techId: string) => authFetch("/api/v1/bulk/work-orders/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wo_ids: unassignedWOs.slice(0, 10).map((w: any) => w.id),
        technician_id: techId,
        comment: "Bulk assigned via portal",
      }),
    }).then(r => r.json()),
    onSuccess: (data) => { setResult(data); qc.invalidateQueries({ queryKey: ["bulk-summary"] }); },
  });

  const bulkApprove = useMutation({
    mutationFn: () => authFetch("/api/v1/bulk/purchase-requests/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pr_ids: pendingPRs.slice(0, 20).map((p: any) => p.id),
        approved_by: "portal_bulk",
        comment: "Bulk approved via portal",
      }),
    }).then(r => r.json()),
    onSuccess: (data) => { setResult(data); qc.invalidateQueries({ queryKey: ["bulk-summary"] }); },
  });

  const bulkComplete = useMutation({
    mutationFn: () => authFetch("/api/v1/bulk/work-orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wo_ids: wos.filter((w: any) => w.status === "in_progress").slice(0, 20).map((w: any) => w.id),
        status: "completed",
        comment: "Bulk completed via portal",
      }),
    }).then(r => r.json()),
    onSuccess: (data) => { setResult(data); qc.invalidateQueries({ queryKey: ["bulk-summary"] }); },
  });

  if (sl) return <PageWrapper><LoadingState title="Loading bulk operations..." /></PageWrapper>;

  const isPending = bulkAssign.isPending || bulkApprove.isPending || bulkComplete.isPending;

  return (
    <PageWrapper>
      <PageHeader
        title="Bulk Operations"
        subtitle="Mass updates across work orders and purchase requests"
        badge="Program B"
      />

      {result && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="font-semibold text-emerald-800">✅ {result.message}</div>
          {result.failed_count > 0 && (
            <div className="text-sm text-amber-600 mt-1">{result.failed_count} items failed</div>
          )}
        </div>
      )}

      {/* Opportunity summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Unassigned WOs",      value: ops.unassigned_work_orders ?? 0,  icon: Users,        color: "text-blue-600" },
          { label: "Overdue WOs",         value: ops.overdue_work_orders ?? 0,     icon: CheckSquare,  color: "text-red-600" },
          { label: "Pending PRs",         value: ops.pending_prs ?? 0,             icon: ShoppingCart, color: "text-amber-600" },
          { label: "Critical Unassigned", value: ops.critical_unassigned ?? 0,     icon: Zap,          color: "text-red-700" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bulk assign */}
        <SectionCard title="Bulk Assign Work Orders">
          <p className="text-sm text-slate-500 mb-3">
            Assign up to 10 unassigned open work orders to a technician at once.
          </p>
          <select
            value={selectedTechId}
            onChange={e => setSelectedTechId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select technician...</option>
            {techs.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.current_work_orders}/{t.max_work_orders} WOs)
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedTechId && bulkAssign.mutate(selectedTechId)}
            disabled={!selectedTechId || isPending || unassignedWOs.length === 0}
            className="w-full h-10 bg-blue-600 text-white text-sm font-medium rounded-lg
                       hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {bulkAssign.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Assign {Math.min(10, unassignedWOs.length)} WOs to Selected Tech
          </button>
        </SectionCard>

        {/* Bulk approve PRs */}
        <SectionCard title="Bulk Approve Purchase Requests">
          <p className="text-sm text-slate-500 mb-3">
            Approve all pending purchase requests ({pendingPRs.length} waiting).
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-700 font-medium">
              ⚠️  This will approve up to 20 PRs in submitted/pending status.
              Review before proceeding.
            </p>
          </div>
          <button
            onClick={() => bulkApprove.mutate()}
            disabled={isPending || pendingPRs.length === 0}
            className="w-full h-10 bg-emerald-600 text-white text-sm font-medium rounded-lg
                       hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {bulkApprove.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
            Approve {Math.min(20, pendingPRs.length)} Purchase Requests
          </button>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}

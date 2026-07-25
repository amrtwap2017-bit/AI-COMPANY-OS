// @ts-nocheck
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingState, Modal, PageHeader, PageWrapper, SectionCard } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { CheckCircle, XCircle, Clock, ShoppingCart, Wrench, FolderOpen } from "lucide-react";
import { ApprovalModal } from "@/components/ui/ApprovalModal";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


const TYPE_ICONS: Record<string, any> = {
  purchase_request: ShoppingCart,
  work_order:       Wrench,
  project:          FolderOpen,
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  pending:   "bg-amber-100 text-amber-700",
  draft:     "bg-slate-100 text-slate-600",
  planning:  "bg-indigo-100 text-indigo-700",
  open:      "bg-slate-100 text-slate-600",
};

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<any>(null);

  // Purchase Requests pending approval
  const { data: prsData = {}, isLoading: pl } = useQuery({
    queryKey: ["approvals-prs"],
    queryFn: () => authFetch("/api/v1/purchase-requests/?status=submitted&limit=30").then(r => r.json()),
    refetchInterval: 60000,
  });

  // Projects in planning (need activation)
  const { data: projData = {}, isLoading: prjl } = useQuery({
    queryKey: ["approvals-projects"],
    queryFn: () => authFetch("/api/v1/projects/?status=planning&limit=20").then(r => r.json()),
    refetchInterval: 60000,
  });

  // Critical open WOs (need assignment approval)
  const { data: woData = {}, isLoading: wl } = useQuery({
    queryKey: ["approvals-wos"],
    queryFn: () => authFetch("/api/v1/work-orders/?priority=critical&status=open&limit=10").then(r => r.json()),
    refetchInterval: 30000,
  });

  if (pl || prjl || wl) return <PageWrapper><LoadingState title="Loading approvals..." /></PageWrapper>;

  const prs   = Array.isArray(prsData)  ? prsData  : prsData?.data  ?? prsData?.items  ?? [];
  const projs = Array.isArray(projData) ? projData : projData?.data ?? projData?.items ?? [];
  const wos   = Array.isArray(woData)   ? woData   : woData?.data   ?? woData?.items   ?? [];

  const totalPending = prs.length + projs.length + (wos || []).length;

  const openModal = (entityType: string, entity: any, invalidateKey: string[]) => {
    setModal({ entityType, entity, invalidateKey });
  };

  const closeModal = () => {
    setModal(null);
    qc.invalidateQueries({ queryKey: ["approvals-prs"] });
    qc.invalidateQueries({ queryKey: ["approvals-projects"] });
    qc.invalidateQueries({ queryKey: ["approvals-wos"] });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Approval Center"
        subtitle={`${totalPending} items waiting for approval`}
        badge={totalPending > 0 ? `${totalPending} pending` : "All clear"}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Purchase Requests", value: prs.length,   icon: ShoppingCart, color: "text-amber-600" },
          { label: "Projects",          value: projs.length, icon: FolderOpen,   color: "text-blue-600" },
          { label: "Critical WOs",      value: (wos || []).length,   icon: Wrench,       color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Purchase Requests */}
      {prs.length > 0 && (
        <SectionCard title={`Purchase Requests (${prs.length})`} className="mb-6">
          <div className="space-y-2">
            {toArr(prs).map((pr: any) => (
              <div key={pr.id}
                   className="flex items-center justify-between p-4
                              bg-white border border-slate-200 rounded-xl hover:border-amber-300">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{pr.title}</div>
                    <div className="text-xs text-slate-400">
                      {Number(pr.total_amount || 0).toLocaleString()} EGP
                      {pr.requested_by ? ` · by ${pr.requested_by}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[pr.status] ?? STATUS_COLORS.pending}`}>
                    {pr.status}
                  </span>
                  <button
                    onClick={() => openModal("purchase_request", pr, ["approvals-prs"])}
                    className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Projects to activate */}
      {projs.length > 0 && (
        <SectionCard title={`Projects for Activation (${projs.length})`} className="mb-6">
          <div className="space-y-2">
            {toArr(projs).map((proj: any) => (
              <div key={proj.id}
                   className="flex items-center justify-between p-4
                              bg-white border border-slate-200 rounded-xl hover:border-blue-300">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {proj.name ?? proj.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {proj.status} · {String(proj.created_at ?? "").slice(0,10)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openModal("project", proj, ["approvals-projects"])}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Activate
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Critical WOs */}
      {(wos || []).length > 0 && (
        <SectionCard title={`Critical WOs — Unassigned (${(wos || []).length})`} className="mb-6">
          <div className="space-y-2">
            {toArr(wos).map((wo: any) => (
              <div key={wo.id}
                   className="flex items-center justify-between p-4
                              bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{wo.title}</div>
                    <div className="text-xs text-slate-400">{wo.type} · {wo.priority}</div>
                  </div>
                </div>
                <button
                  onClick={() => openModal("workOrder", wo, ["approvals-wos"])}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Dispatch
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {totalPending === 0 && (
        <div className="text-center py-16">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">All Clear</h3>
          <p className="text-sm text-slate-400 mt-2">No items pending approval</p>
        </div>
      )}

      {/* Approval Modal */}
      {modal && (
        <ApprovalModal
          isOpen={true}
          onClose={closeModal}
          entityType={modal.entityType}
          entityId={modal.entity.id}
          entityTitle={modal.entity.title ?? modal.entity.name ?? modal.entity.id?.slice(0,8)}
          currentStatus={modal.entity.status}
          invalidateKey={modal.invalidateKey}
        />
      )}
    </PageWrapper>
  );
}

"use client"; // @ts-nocheck
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { CheckCircle, XCircle, X, Loader2 } from "lucide-react";

interface ApprovalModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  entityType:  "purchase_request" | "work_order" | "project";
  entityId:    string;
  entityTitle: string;
  currentStatus: string;
  invalidateKey: string[];
}

const ENDPOINTS: Record<string, { approve: string; reject: string }> = {
  purchase_request: {
    approve: (id: string) => `/api/v1/purchase-requests-portal${id}/approve`,
    reject:  (id: string) => `/api/v1/purchase-requests-portal${id}/reject`,
  },
  work_order: {
    approve: (id: string) => `/api/v1/work-orders/${id}/transition`,
    reject:  (id: string) => `/api/v1/work-orders/${id}/transition`,
  },
  project: {
    approve: (id: string) => `/api/v1/projects-portal${id}/transition`,
    reject:  (id: string) => `/api/v1/projects-portal${id}/transition`,
  },
};

export function ApprovalModal({
  isOpen, onClose, entityType, entityId,
  entityTitle, currentStatus, invalidateKey,
}: ApprovalModalProps) {
  const [comment, setComment] = useState("");
  const [result, setResult]   = useState<"approved"|"rejected"|null>(null);
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: () => authFetch(
      entityType === "purchase_request"
        ? `/api/v1/purchase-requests-portal${entityId}/approve`
        : entityType === "project"
          ? `/api/v1/projects-portal${entityId}/transition`
          : `/api/v1/work-orders/${entityId}/transition`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          entityType === "purchase_request"
            ? { comment, approved_by: "portal_user" }
            : { to: "active", comment }
        ),
      }
    ).then(r => r.json()),
    onSuccess: () => {
      setResult("approved");
      qc.invalidateQueries({ queryKey: invalidateKey });
      setTimeout(() => { setResult(null); setComment(""); onClose(); }, 1500);
    },
  });

  const reject = useMutation({
    mutationFn: () => authFetch(
      entityType === "purchase_request"
        ? `/api/v1/purchase-requests-portal${entityId}/reject`
        : entityType === "project"
          ? `/api/v1/projects-portal${entityId}/transition`
          : `/api/v1/work-orders/${entityId}/transition`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          entityType === "purchase_request"
            ? { reason: comment, rejected_by: "portal_user" }
            : { to: "cancelled", comment }
        ),
      }
    ).then(r => r.json()),
    onSuccess: () => {
      setResult("rejected");
      qc.invalidateQueries({ queryKey: invalidateKey });
      setTimeout(() => { setResult(null); setComment(""); onClose(); }, 1500);
    },
  });

  if (!isOpen) return null;
  const isPending = approve.isPending || reject.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-stone-800">Review & Approve</h2>
          <button onClick={onClose} className="text-tertiary hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-secondary uppercase font-semibold mb-1">{entityType.replace(/_/g," ")}</p>
            <p className="text-sm font-medium text-stone-800">{entityTitle}</p>
            <p className="text-xs text-tertiary mt-1">Current: {currentStatus}</p>
          </div>

          <label className="block text-xs font-medium text-slate-600 mb-1">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Add a comment or reason..."
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {result ? (
          <div className={`mx-6 mb-4 p-3 rounded-lg text-center text-sm font-medium
            ${result === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {result === "approved" ? "✅ Approved successfully" : "❌ Rejected"}
          </div>
        ) : (
          <div className="flex gap-3 px-6 pb-4">
            <button
              onClick={() => reject.mutate()}
              disabled={isPending}
              className="flex-1 h-10 flex items-center justify-center gap-2 border border-red-300
                         text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {reject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
            <button
              onClick={() => approve.mutate()}
              disabled={isPending}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-emerald-600
                         text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {approve.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovalModal;

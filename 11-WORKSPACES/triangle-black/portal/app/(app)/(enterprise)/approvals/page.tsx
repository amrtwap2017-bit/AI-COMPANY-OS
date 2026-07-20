// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "@/lib/api/enterprise";
import { PageHeader, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { PageWrapper } from "@/components/ui";
import { CheckCircle2, XCircle, Clock, FileText, RefreshCw, Package, ShoppingCart } from "lucide-react";
import { fmtDate } from "@/lib/design-tokens";

const TYPE_STYLES: Record<string,string> = {
  quote:            "bg-amber-100 text-amber-700",
  purchase_request: "bg-blue-100 text-blue-700",
  purchase_order:   "bg-purple-100 text-purple-700",
};

const TYPE_ICONS: Record<string, any> = {
  quote:            FileText,
  purchase_request: ShoppingCart,
  purchase_order:   Package,
};

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [acting, setActing] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["approvals-queue"],
    queryFn:  () => approvalsApi.queue(),
    refetchInterval: 30_000,
  });

  const queue: any[] = data?.data?.queue || [];
  const counts       = data?.data?.counts || {};

  async function handleAction(item: any, approve: boolean) {
    setActing(item.id);
    try {
      if (approve) await approvalsApi.approve(item.id, item.approval_type);
      else         await approvalsApi.reject(item.id, item.approval_type);
      qc.invalidateQueries({ queryKey: ["approvals-queue"] });
      qc.invalidateQueries({ queryKey: ["approvals-count"] });
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setActing(null);
    }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Approval Center"
        subtitle={queue.length + " items pending approval"}
        badge="APV"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {/* Count pills */}
      <div className="flex gap-2 flex-wrap">
        {[["Quotes", counts.quotes, "amber"], ["Purchase Requests", counts.purchase_requests, "blue"], ["Purchase Orders", counts.purchase_orders, "purple"]].map(([label, count, color]) => (
          <span key={String(label)} className={"text-xs font-semibold px-3 py-1.5 rounded-full bg-" + color + "-50 text-" + color + "-700 border border-" + color + "-200"}>
            {label}: {count ?? 0}
          </span>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />}

      {isLoading ? <LoadingState type="table" rows={5} /> :
       queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
          <p className="text-slate-500 mt-2">No pending approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item: any) => {
            const Icon = TYPE_ICONS[item.approval_type] || FileText;
            const isActing = acting === item.id;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 hover:border-amber-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full capitalize " + (TYPE_STYLES[item.approval_type] || "bg-slate-100 text-slate-600")}>
                      {item.approval_type?.replace("_"," ")}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{fmtDate(item.created_at)}
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                  {item.amount > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">Amount: EGP {Number(item.amount).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(item, true)}
                    disabled={isActing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(item, false)}
                    disabled={isActing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

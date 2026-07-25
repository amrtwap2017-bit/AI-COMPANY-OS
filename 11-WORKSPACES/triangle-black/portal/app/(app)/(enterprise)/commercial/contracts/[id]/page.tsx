// @ts-nocheck
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { RefreshCw, FileText, CreditCard, CheckCircle, Loader2 } from "lucide-react";

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


export default function ContractDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [renewed, setRenewed] = useState(false);
  const [renewalResult, setRenewalResult] = useState<any>(null);

  const { data: contract, isLoading: cl } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => authFetch(`/api/v1/contracts/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: graph = [] } = useQuery({
    queryKey: ["contract-graph", id],
    queryFn: () => authFetch(`/api/v1/knowledge-graph/entity/contract/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const renew = useMutation({
    mutationFn: (months: number) => authFetch(`/api/v1/contracts/${id}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ renewal_months: months, renewed_by: "portal_user" }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setRenewalResult(data);
      setRenewed(true);
      qc.invalidateQueries({ queryKey: ["contract", id] });
    },
  });

  if (cl) return <PageWrapper><LoadingState title="Loading contract..." /></PageWrapper>;
  if (!contract || contract.detail) return <PageWrapper><p className="p-8 text-slate-400">Contract not found</p></PageWrapper>;

  const hotel    = graph?.relationships?.hotel ?? {};
  const invoices = graph?.relationships?.invoices ?? [];

  const STATUS_COLOR: Record<string, string> = {
    active: "text-emerald-600", expired: "text-red-600",
    renewed: "text-blue-600",   draft: "text-slate-500",
    cancelled: "text-red-400",
  };

  const daysRemaining = contract.end_date
    ? Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / 86400000)
    : null;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining >= 0;
  const isExpired      = daysRemaining !== null && daysRemaining < 0;

  return (
    <PageWrapper>
      <PageHeader
        title={contract.title || "Contract Detail"}
        subtitle={`${hotel.name ?? "Client"} · ${contract.contract_type ?? "Contract"}`}
        badge={<span className={STATUS_COLOR[contract.status] ?? "text-slate-600"}>{contract.status}</span>}
      />

      {renewalResult && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="font-semibold text-emerald-800">✅ {renewalResult.message}</div>
          <div className="text-sm text-emerald-600 mt-1">
            New period: {renewalResult.new_start} → {renewalResult.new_end}
          </div>
        </div>
      )}

      {isExpiringSoon && !renewed && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="font-semibold text-amber-800">⚠️ Contract expiring in {daysRemaining} days</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Contract Details">
            <div className="space-y-2 text-sm">
              {[
                ["Status",      contract.status],
                ["Type",        contract.contract_type],
                ["Client",      hotel.name],
                ["Start Date",  String(contract.start_date ?? "").slice(0,10)],
                ["End Date",    String(contract.end_date ?? "").slice(0,10)],
                ["Days Left",   daysRemaining !== null ? `${daysRemaining} days` : "—"],
                ["Total Value", `${Number(contract.total_value || 0).toLocaleString()} EGP`],
              ].map(([k, v]) => v && (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className={`font-medium text-right ${k === "Days Left" && isExpiringSoon ? "text-amber-600" : "text-slate-800"}`}>{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Renewal actions */}
          {contract.status === "active" && !renewed && (
            <SectionCard title="Renewal Actions">
              <p className="text-xs text-slate-500 mb-3">
                Renew this contract to extend the service period.
              </p>
              <div className="space-y-2">
                {[12, 24].map(months => (
                  <button
                    key={months}
                    onClick={() => renew.mutate(months)}
                    disabled={renew.isPending}
                    className="w-full h-10 flex items-center justify-center gap-2 text-sm font-medium
                               rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {renew.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Renew {months} months
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {renewed && (
            <SectionCard title="Renewal Status">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Contract renewed successfully</span>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard title={`Invoice History (${invoices.length})`}>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b">
                      <th className="text-left py-2 font-medium">Invoice ID</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-right py-2 font-medium">Amount (EGP)</th>
                      <th className="text-left py-2 font-medium">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toArr(invoices).map((inv: any) => (
                      <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 font-mono text-xs text-slate-500">{inv.id?.slice(0,8)}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium
                            ${inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                              inv.status === "overdue" ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-600"}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-800">
                          {Number(inv.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-2 text-slate-500">{String(inv.due_date ?? "").slice(0,10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No invoices on this contract</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}

// @ts-nocheck
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

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


const RISK_STYLES: Record<string, string> = {
  high:   "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function RenewalsPage() {
  const qc = useQueryClient();
  const [renewed, setRenewed] = useState<Record<string, boolean>>({});
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["renewals-90"],
    queryFn: () => authFetch("/api/v1/customer-success/renewals").then(r => r.json()),
  });

  const renew = useMutation({
    mutationFn: ({ contractId, months }: { contractId: string; months: number }) =>
      authFetch(`/api/v1/contracts/${contractId}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renewal_months: months,
          renewed_by: "portal_user",
          notes: "Renewed via customer success portal",
        }),
      }).then(r => r.json()),
    onSuccess: (data, variables) => {
      if (data.success) {
        setRenewed(prev => ({ ...prev, [variables.contractId]: true }));
        qc.invalidateQueries({ queryKey: ["renewals-90"] });
      } else {
        setErrors(prev => ({ ...prev, [variables.contractId]: data.message || "Renewal failed" }));
      }
    },
    onError: (err, variables) => {
      setErrors(prev => ({ ...prev, [variables.contractId]: String(err) }));
    },
  });

  const renewals = data?.renewals ?? [];

  if (isLoading) return <PageWrapper><LoadingState title="Loading renewals..." /></PageWrapper>;

  return (
    <PageWrapper>
      <PageHeader
        title="Contract Renewals"
        subtitle="Contracts expiring in the next 90 days"
        badge="Program J"
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Expiring <30d",  value: toArr(renewals).filter((r: any) => r.risk_level === "high").length,   color: "text-red-600" },
          { label: "Expiring <60d",  value: toArr(renewals).filter((r: any) => r.risk_level === "medium").length, color: "text-amber-600" },
          { label: "Expiring <90d",  value: toArr(renewals).filter((r: any) => r.risk_level === "low").length,    color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`${(renewals || []).length} Contracts to Renew`}>
        <div className="space-y-3">
          {toArr(renewals).map((contract: any) => {
            const cid = contract.contract_id || contract.id;
            const isRenewed = renewed[cid];
            const error     = errors[cid];
            const riskStyle = RISK_STYLES[contract.risk_level] ?? RISK_STYLES.low;

            return (
              <div key={cid}
                   className={`flex items-center justify-between p-4 rounded-xl border
                     ${isRenewed ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${riskStyle}`}>
                    {contract.risk_level?.toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {contract.hotel_name || contract.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      Expires {contract.end_date?.slice(0,10)}
                      · {contract.days_remaining} days
                      · {Number(contract.total_value||0).toLocaleString()} EGP
                    </div>
                    {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {isRenewed ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> Renewed
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => renew.mutate({ contractId: cid, months: 12 })}
                        disabled={renew.isPending}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg
                                   hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" /> Renew 12m
                      </button>
                      <button
                        onClick={() => renew.mutate({ contractId: cid, months: 24 })}
                        disabled={renew.isPending}
                        className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg
                                   hover:bg-slate-700 flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" /> Renew 24m
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {(renewals || []).length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm">No contracts expiring in the next 90 days</p>
            </div>
          )}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}

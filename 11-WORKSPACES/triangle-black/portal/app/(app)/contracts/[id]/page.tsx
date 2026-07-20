"use client";
// @ts-nocheck
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader, PageWrapper, SectionCard, LoadingState,
  AlertBanner, StatusBadge,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { fmtDate, fmtCurrency } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";
import { tokenManager } from "@/lib/auth/token-manager";
import {
  ArrowLeft, FileCheck, Calendar, DollarSign,
  RotateCw, CheckCircle2, Clock,
} from "lucide-react";

async function apiCall(path: string, method = "GET") {
  const token = tokenManager.getToken();
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "HTTP " + res.status);
  }
  return res.json().catch(() => ({}));
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const qc       = useQueryClient();
  const [acting, setActing] = useState<string | null>(null);

  const { data: contract, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["contract", id],
    queryFn:  () => apiCall("/api/v1/contracts/" + id),
    staleTime: 30_000,
  });

  async function doAction(label: string, path: string) {
    setActing(label);
    try {
      await apiCall(path, "POST");
      await refetch();
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success(label + " successful");
    } catch (e: any) {
      toast.error(e.message || label + " failed");
    } finally {
      setActing(null);
    }
  }

  if (isLoading) return <PageWrapper><LoadingState type="detail" /></PageWrapper>;
  if (isError || !contract) return (
    <PageWrapper>
      <AlertBanner type="error" title={error instanceof Error ? error.message : "Contract not found"} />
    </PageWrapper>
  );

  const c = contract;

  return (
    <PageWrapper>
      <PageHeader
        title={c.title || "Contract"}
        subtitle={fmtCurrency(c.total_value || 0) + " annual value"}
        badge="CONTRACT"
        back={
          <Link href="/contracts"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> All Contracts
          </Link>
        }
        actions={<StatusBadge status={c.status} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Value",    value: fmtCurrency(c.total_value    || 0), color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          { label: "Monthly Value",  value: fmtCurrency(c.monthly_value  || 0), color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Duration",       value: (c.duration_months || "—") + " months", color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Renewals",       value: c.renewal_count || 0,              color: "bg-amber-50 border-amber-200 text-amber-700" },
        ].map(m => (
          <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
            <div className="text-xl font-bold">{m.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SectionCard title="Contract Details">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Calendar,   label: "Created",      value: fmtDate(c.created_at) },
                { icon: Calendar,   label: "End Date",     value: c.end_date ? fmtDate(c.end_date) : "—" },
                { icon: DollarSign, label: "Monthly",      value: fmtCurrency(c.monthly_value || 0) },
                { icon: RotateCw,   label: "Renewals",     value: c.renewal_count + " times" },
                { icon: Clock,      label: "Duration",     value: (c.duration_months || "—") + " months" },
                { icon: FileCheck,  label: "Status",       value: c.status },
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
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Actions">
            <div className="space-y-2">
              {c.status === "pending_signature" && (
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  loading={acting === "Activated"}
                  onClick={() => doAction("Activated", "/api/v1/contracts/" + id + "/activate")}
                >
                  Activate Contract
                </Button>
              )}
              {c.status === "active" && (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  icon={<RotateCw className="w-4 h-4" />}
                  loading={acting === "Renewed"}
                  onClick={() => doAction("Renewed", "/api/v1/contracts/" + id + "/renew")}
                >
                  Renew Contract
                </Button>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}

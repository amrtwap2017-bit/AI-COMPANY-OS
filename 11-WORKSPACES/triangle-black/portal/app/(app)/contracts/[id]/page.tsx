// @ts-nocheck
"use client";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {contractsApi, extendedContractsApi} from "@/lib/api";
import { Contract } from "@/lib/types";
import { Card, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { CONTRACT_STATUS_CONFIG, formatEGP, formatDate } from "@/lib/utils";
import { ArrowLeft, Play, RefreshCw, Calendar, TrendingUp } from "lucide-react";

export default function ContractDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [renewMonths, setRenewMonths] = useState(12);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => contractsApi.get(id).then((r) => r as Contract),
  });

  async function doAction(action: string, fn: () => Promise<unknown>) {
    setLoading(action);
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["contract", id] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
    } catch (e) { console.error(e); }
    finally { setLoading(null); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!contract) return <div role="alert">Contract not found</div>;

  const cfg = CONTRACT_STATUS_CONFIG[contract.status as keyof typeof CONTRACT_STATUS_CONFIG]
    || { label: contract.status, color: "text-gray-600", bg: "bg-gray-100" };

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Contracts
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>
            {contract.renewal_count > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Renewed ×{contract.renewal_count}
              </span>
            )}
          </div>
          {contract.description && (
            <p className="text-gray-500 mt-1">{contract.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-700">{formatEGP(contract.total_value)}</p>
          <p className="text-sm text-gray-500">{formatEGP(contract.monthly_value)}/month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding={false}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Services Included</h2>
            </div>
            <table className="w-full text-sm" aria-label="Contract services">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th scope="col" className="px-6 py-3 text-left">Service</th>
                  <th scope="col" className="px-6 py-3 text-right">Duration</th>
                  <th scope="col" className="px-6 py-3 text-right">Monthly</th>
                  <th scope="col" className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {contract.services.map((item, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{item.service}</td>
                    <td className="px-6 py-3 text-right text-gray-500">{item.qty} mo</td>
                    <td className="px-6 py-3 text-right text-gray-500">{formatEGP(item.unit_price)}</td>
                    <td className="px-6 py-3 text-right font-semibold">{formatEGP(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-amber-600">
                  <td colSpan={3} className="px-6 py-4 text-white font-bold text-right">Annual Total</td>
                  <td className="px-6 py-4 text-[#F59E0B] font-bold text-right text-lg">
                    {formatEGP(contract.total_value)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader title="Contract Details" />
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium">{formatDate(contract.created_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Duration</dt>
                <dd className="font-medium">{contract.duration_months} months</dd>
              </div>
              {contract.start_date && (
                <div>
                  <dt className="text-gray-500">Start Date</dt>
                  <dd className="font-medium">{formatDate(contract.start_date)}</dd>
                </div>
              )}
              {contract.end_date && (
                <div>
                  <dt className="text-gray-500">End Date</dt>
                  <dd className="font-medium">{formatDate(contract.end_date)}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Monthly Value</dt>
                <dd className="font-medium text-amber-700">{formatEGP(contract.monthly_value)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Renewals</dt>
                <dd className="font-medium">{contract.renewal_count}</dd>
              </div>
            </dl>
            {contract.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{contract.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions" />
            <div className="space-y-3">
              {contract.status === "pending_signature" && (
                <Button className="w-full" variant="success"
                  loading={loading === "activate"}
                  onClick={() => doAction("activate", () =>
                    extendedContractsApi.activate(id))}
                >
                  <Play className="w-4 h-4" /> Activate Contract
                </Button>
              )}
              {["active","renewed"].includes(contract.status) && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">
                    Renewal Duration (months)
                  </label>
                  <select
                    value={renewMonths}
                    onChange={(e) => setRenewMonths(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2
                      focus:outline-none focus:ring-2 focus:ring-amber-500"
                    aria-label="Renewal duration in months"
                  >
                    {[6,12,24,36].map((m) => (
                      <option key={m} value={m}>{m} months</option>
                    ))}
                  </select>
                  <Button className="w-full" variant="secondary"
                    loading={loading === "renew"}
                    onClick={() => doAction("renew", () =>
                      extendedContractsApi.renew(id, renewMonths))}
                  >
                    <RefreshCw className="w-4 h-4" /> Renew Contract
                  </Button>
                </div>
              )}
            </div>

            {/* Status flow */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-medium">Contract Lifecycle</p>
              {(["pending_signature","active","renewed"] as const).map((s) => {
                const c = CONTRACT_STATUS_CONFIG[s];
                const active = contract.status === s;
                const done = (s === "pending_signature" && ["active","renewed"].includes(contract.status))
                  || (s === "active" && contract.status === "renewed");
                return (
                  <div key={s} className="flex items-center gap-2 mb-1.5">
                    <div className={`w-2 h-2 rounded-full
                      ${active ? "bg-amber-600" : done ? "bg-green-500" : "bg-gray-200"}`} />
                    <span className={`text-xs
                      ${active ? "font-semibold text-amber-700"
                        : done ? "text-green-600" : "text-gray-400"}`}>
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Value summary */}
          <Card>
            <p className="text-xs text-gray-500 mb-3 font-medium">Value Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly</span>
                <span className="font-semibold">{formatEGP(contract.monthly_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Annual</span>
                <span className="font-bold text-amber-700">{formatEGP(contract.total_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Services</span>
                <span className="font-medium">{contract.services.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { contractsApi } from "@/lib/api";
import { Contract } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { CONTRACT_STATUS_CONFIG, formatEGP, formatDate } from "@/lib/utils";
import { FileCheck, ChevronRight, TrendingUp } from "lucide-react";

const FILTERS = [
  { value: "", label: "All" },
  { value: "pending_signature", label: "Pending Signature" },
  { value: "active", label: "Active" },
  { value: "renewed", label: "Renewed" },
  { value: "expired", label: "Expired" },
];

export default function ContractsPage() {
  const [filter, setFilter] = useState("");
  const router = useRouter();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", filter],
    queryFn: () => contractsApi.list(filter || undefined).then((r) => r as Contract[]),
    refetchInterval: 15000,
  });

  const totalValue = contracts.reduce((s, c) => s + c.total_value, 0);
  const activeValue = contracts
    .filter((c) => ["active","renewed"].includes(c.status))
    .reduce((s, c) => s + c.total_value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contracts.length} contracts · {formatEGP(activeValue)} active value
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Contracts", value: contracts.length, sub: formatEGP(totalValue) },
          { label: "Active", value: contracts.filter(c => c.status === "active").length,
            sub: "Running contracts" },
          { label: "Pending Signature", value: contracts.filter(c => c.status === "pending_signature").length,
            sub: "Awaiting activation" },
          { label: "Renewals", value: contracts.filter(c => c.status === "renewed").length,
            sub: "Renewed contracts" },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1B2B4B]">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]
              ${filter === f.value
                ? "bg-[#1B2B4B] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div role="status" className="text-center py-12 text-gray-400">Loading contracts...</div>
      )}

      {!isLoading && contracts.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No contracts yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Contracts are created automatically when quotes are approved
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {contracts.map((contract) => {
          const cfg = CONTRACT_STATUS_CONFIG[contract.status as keyof typeof CONTRACT_STATUS_CONFIG]
            || { label: contract.status, color: "text-gray-600", bg: "bg-gray-100" };
          return (
            <button
              key={contract.id}
              onClick={() => router.push(`/contracts/${contract.id}`)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-5
                hover:border-[#1B2B4B] hover:shadow-md transition-all group
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]"
              aria-label={`Contract: ${contract.title}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900 group-hover:text-[#1B2B4B] transition-colors truncate">
                      {contract.title}
                    </p>
                    <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>
                    {contract.renewal_count > 0 && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Renewed ×{contract.renewal_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {contract.duration_months} months ·{" "}
                    {formatEGP(contract.monthly_value)}/mo ·{" "}
                    Created {formatDate(contract.created_at)}
                    {contract.end_date && ` · Ends ${formatDate(contract.end_date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#1B2B4B]">
                      {formatEGP(contract.total_value)}
                    </p>
                    <p className="text-xs text-gray-400">annual value</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1B2B4B]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

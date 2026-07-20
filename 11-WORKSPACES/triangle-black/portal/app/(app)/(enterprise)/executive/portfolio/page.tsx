// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { executiveIntelligenceApi } from "@/lib/executive-intelligence-api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function fmt(n: number) {
  return n >= 1000000 ? `EGP ${(n/1000000).toFixed(1)}M` : n >= 1000 ? `EGP ${(n/1000).toFixed(0)}K` : `EGP ${n || 0}`;
}

const statusBadge: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-gray-100 text-gray-600",
  signed: "bg-blue-100 text-blue-700",
  completed: "bg-purple-100 text-purple-700",
  terminated: "bg-red-100 text-red-700",
};

export default function PortfolioPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["portfolio-overview"],
    queryFn: () => executiveIntelligenceApi.portfolioOverview(),
  });

  const contracts = data?.contracts || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/executive" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Portfolio</h1>
          <p className="text-sm text-gray-500">{data?.total_contracts || 0} contracts · Active value {fmt(data?.active_value || 0)} · MRR {fmt(data?.monthly_recurring || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Portfolio Value", value: fmt(data?.total_value || 0), color: "gray" },
          { label: "Active Contract Value", value: fmt(data?.active_value || 0), color: "emerald" },
          { label: "Monthly Recurring", value: fmt(data?.monthly_recurring || 0), color: "blue" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">{c.label}</div>
            <div className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contract</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Value</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Monthly</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Expires</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>}
            {contracts.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.company}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{c.title}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[c.status] || "bg-gray-100 text-gray-600"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(c.total_value || 0)}</td>
                <td className="px-4 py-3 text-right text-gray-500">{c.monthly_value ? fmt(c.monthly_value) : "—"}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                  {c.end_date ? new Date(c.end_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

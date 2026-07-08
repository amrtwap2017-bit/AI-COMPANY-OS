"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clientContractsApi } from "@/lib/api";
import { formatEGP, formatDate } from "@/lib/utils";
import {
  ArrowLeft, FileCheck, Calendar, Clock,
  Wrench, RefreshCw, DollarSign,
} from "lucide-react";

interface ContractService {
  service: string;
  qty: number;
  unit_price: number;
  total: number;
}

interface Contract {
  id: string;
  quote_id: string;
  lead_id: string;
  title: string;
  description?: string;
  services: ContractService[];
  total_value: number;
  monthly_value: number;
  status: string;
  start_date?: string;
  end_date?: string;
  duration_months: number;
  renewal_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending_signature: {
    label: "Pending Signature",
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: <Clock className="w-5 h-5 text-amber-600" />,
  },
  active: {
    label: "Active",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: <FileCheck className="w-5 h-5 text-green-600" />,
  },
  expired: {
    label: "Expired",
    color: "text-orange-700",
    bg: "bg-orange-100",
    icon: <Calendar className="w-5 h-5 text-orange-600" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: <FileCheck className="w-5 h-5 text-red-600" />,
  },
  draft: {
    label: "Draft",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: <FileCheck className="w-5 h-5 text-gray-500" />,
  },
};

export default function ClientContractDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: contract, isLoading } = useQuery({
    queryKey: ["client-contract", id],
    queryFn: () =>
      clientContractsApi.get(id).then((r) => r.data as Contract),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading contract...</span>
      </div>
    );

  if (!contract)
    return (
      <div role="alert" className="text-red-600 p-6">
        Contract not found.
      </div>
    );

  const cfg = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;

  const daysRemaining =
    contract.end_date
      ? Math.ceil(
          (new Date(contract.end_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Contracts
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}
            >
              {cfg.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {contract.title}
              </h1>
              {contract.description && (
                <p className="text-gray-500 mt-1 text-sm">
                  {contract.description}
                </p>
              )}
              <span
                className={`inline-block mt-2 text-sm font-semibold px-3 py-1 rounded-full ${cfg.color} ${cfg.bg}`}
              >
                {cfg.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#1B2B4B]">
              {formatEGP(contract.total_value)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Annual contract value</p>
            <p className="text-base font-semibold text-gray-700 mt-0.5">
              {formatEGP(contract.monthly_value)}/month
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span className="text-xs text-gray-500">Start Date</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {contract.start_date
                ? formatDate(contract.start_date)
                : "Not started"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span className="text-xs text-gray-500">End Date</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {contract.end_date ? formatDate(contract.end_date) : "—"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span className="text-xs text-gray-500">
                {daysRemaining !== null && daysRemaining > 0
                  ? "Days Remaining"
                  : "Duration"}
              </span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {daysRemaining !== null
                ? daysRemaining > 0
                  ? `${daysRemaining} days`
                  : "Expired"
                : `${contract.duration_months} months`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span className="text-xs text-gray-500">Renewals</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {contract.renewal_count === 0 ? "None yet" : `${contract.renewal_count}×`}
            </p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      {contract.services && contract.services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-gray-900">Services Covered</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Engineering services included in this contract
              </p>
            </div>
          </div>
          <table className="w-full text-sm" aria-label="Services covered">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th scope="col" className="px-8 py-4 text-left">Service</th>
                <th scope="col" className="px-8 py-4 text-right">Months</th>
                <th scope="col" className="px-8 py-4 text-right">Monthly Rate</th>
                <th scope="col" className="px-8 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {contract.services.map((svc, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-8 py-4 font-medium text-gray-900">
                    {svc.service}
                  </td>
                  <td className="px-8 py-4 text-right text-gray-600">
                    {svc.qty}
                  </td>
                  <td className="px-8 py-4 text-right text-gray-600">
                    {formatEGP(svc.unit_price)}
                  </td>
                  <td className="px-8 py-4 text-right font-semibold text-gray-900">
                    {formatEGP(svc.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-[#1B2B4B]">
                <td
                  colSpan={3}
                  className="px-8 py-5 font-bold text-white text-right text-base"
                >
                  Annual Total
                </td>
                <td className="px-8 py-5 font-bold text-[#F59E0B] text-right text-xl">
                  {formatEGP(contract.total_value)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Notes */}
      {contract.notes && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="font-semibold text-amber-800 mb-2">Notes</h3>
          <p className="text-sm text-amber-700">{contract.notes}</p>
        </div>
      )}

      {/* Pending Signature guidance */}
      {contract.status === "pending_signature" && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-800 mb-1">Next Steps</h3>
          <p className="text-sm text-blue-700">
            This contract is awaiting signature. Triangle Black will contact
            you to arrange signing. Once activated, services will begin on
            the agreed start date.
          </p>
        </div>
      )}

      {/* Active guidance */}
      {contract.status === "active" && daysRemaining !== null && daysRemaining <= 30 && (
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
          <h3 className="font-semibold text-orange-800 mb-1">
            Contract Expiring Soon
          </h3>
          <p className="text-sm text-orange-700">
            This contract expires in {daysRemaining} days. Contact Triangle
            Black to discuss renewal options.
          </p>
        </div>
      )}

      {/* Contact */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Questions about this contract?{" "}
          <a
            href="mailto:amr@triangleblack.com"
            className="text-[#1B2B4B] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
          >
            Contact Triangle Black
          </a>
        </p>
      </div>
    </div>
  );
}

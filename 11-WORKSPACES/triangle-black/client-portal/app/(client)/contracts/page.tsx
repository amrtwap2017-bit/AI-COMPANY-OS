"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clientContractsApi } from "@/lib/api";
import { formatEGP, formatDate } from "@/lib/utils";
import { FileCheck, ChevronRight, Calendar, DollarSign } from "lucide-react";

interface Contract {
  id: string;
  title: string;
  description?: string;
  services: { service: string; qty: number; unit_price: number; total: number }[];
  total_value: number;
  monthly_value: number;
  status: string;
  start_date?: string;
  end_date?: string;
  duration_months: number;
  renewal_count: number;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_signature: { label: "Pending Signature", color: "text-amber-700",  bg: "bg-amber-100"  },
  active:            { label: "Active",             color: "text-green-700",  bg: "bg-green-100"  },
  expired:           { label: "Expired",            color: "text-orange-700", bg: "bg-orange-100" },
  cancelled:         { label: "Cancelled",          color: "text-red-700",    bg: "bg-red-100"    },
  draft:             { label: "Draft",              color: "text-gray-600",   bg: "bg-gray-100"   },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

export default function ClientContractsPage() {
  const router = useRouter();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["client-contracts"],
    queryFn: () => clientContractsApi.list().then((r) => r.data as Contract[]),
    refetchInterval: 30000,
  });

  const active    = contracts.filter((c) => c.status === "active");
  const pending   = contracts.filter((c) => c.status === "pending_signature");
  const others    = contracts.filter((c) => !["active","pending_signature"].includes(c.status));
  const totalValue = active.reduce((s, c) => s + c.total_value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your engineering service agreements with Triangle Black
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-green-600" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-600">Active Contracts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{active.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pending Signature</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pending.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-600">Active Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatEGP(totalValue)}</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16" role="status">
          <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading contracts...</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && contracts.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No contracts yet</h3>
          <p className="text-gray-500 text-sm">
            Once a proposal is approved, your contract will appear here.
          </p>
        </div>
      )}

      {/* Pending Signature */}
      {!isLoading && pending.length > 0 && (
        <section aria-label="Pending signature contracts">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Pending Signature
          </h2>
          <div className="space-y-3">
            {pending.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                onClick={() => router.push(`/contracts/${contract.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active */}
      {!isLoading && active.length > 0 && (
        <section aria-label="Active contracts">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Active Contracts
          </h2>
          <div className="space-y-3">
            {active.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                onClick={() => router.push(`/contracts/${contract.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Others */}
      {!isLoading && others.length > 0 && (
        <section aria-label="Other contracts">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Other
          </h2>
          <div className="space-y-3">
            {others.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                onClick={() => router.push(`/contracts/${contract.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ContractRow({
  contract,
  onClick,
}: {
  contract: Contract;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-[#1B2B4B] hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{contract.title}</h3>
            <StatusBadge status={contract.status} />
          </div>
          {contract.description && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
              {contract.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">
                {formatEGP(contract.total_value)}
              </span>{" "}
              / year
            </span>
            <span className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">
                {formatEGP(contract.monthly_value)}
              </span>{" "}
              / month
            </span>
            {contract.start_date && (
              <span className="text-xs text-gray-500">
                From{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(contract.start_date)}
                </span>
              </span>
            )}
            {contract.end_date && (
              <span className="text-xs text-gray-500">
                To{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(contract.end_date)}
                </span>
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
      </div>
    </button>
  );
}

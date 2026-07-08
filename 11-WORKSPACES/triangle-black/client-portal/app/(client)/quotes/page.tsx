"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientQuotesApi } from "@/lib/api";
import { formatEGP, formatDate, QUOTE_STATUS, QuoteStatus } from "@/lib/utils";
import { FileText, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function QuotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["client-quotes"],
    queryFn: () => clientQuotesApi.list().then((r) => r.data),
    refetchInterval: 15000,
  });

  const filters = [
    { value: "all",      label: "All Proposals" },
    { value: "sent",     label: "Awaiting Approval" },
    { value: "approved", label: "Approved" },
    { value: "review",   label: "Under Review" },
    { value: "rejected", label: "Rejected" },
  ];

  const filtered = filter === "all"
    ? quotes
    : quotes.filter((q: { status: string }) => q.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Proposals</h1>
        <p className="text-gray-500 mt-1">
          Engineering service proposals from Triangle Black
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter proposals">
        {filters.map((f) => {
          const count = f.value === "all"
            ? quotes.length
            : quotes.filter((q: { status: string }) => q.status === f.value).length;
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]
                ${filter === f.value
                  ? "bg-[#1B2B4B] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5
                  ${filter === f.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div role="status" className="text-center py-12 text-gray-400">
          Loading proposals...
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500">No proposals in this category</p>
        </div>
      )}

      <div className="space-y-3" role="list" aria-label="Proposals list">
        {filtered.map((quote: {
          id: string; title: string; status: string;
          total: number; created_at: string;
          items: unknown[]; validity_date?: string;
        }) => {
          const cfg = QUOTE_STATUS[quote.status as QuoteStatus];
          const needsAction = quote.status === "sent";
          return (
            <button
              key={quote.id}
              role="listitem"
              onClick={() => router.push(`/quotes/${quote.id}`)}
              className={`w-full text-left bg-white rounded-xl border p-5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]
                ${needsAction
                  ? "border-amber-300 hover:border-amber-400 hover:shadow-md"
                  : "border-gray-200 hover:border-[#1B2B4B] hover:shadow-md"
                }`}
              aria-label={`${quote.title}, ${cfg.label}, ${formatEGP(quote.total)}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${needsAction ? "bg-amber-100" : "bg-gray-50"}`}>
                    {needsAction
                      ? <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                      : quote.status === "approved"
                        ? <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
                        : <FileText className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-[#1B2B4B] transition-colors">
                        {quote.title}
                      </p>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {(quote.items as unknown[]).length} services · Created {formatDate(quote.created_at)}
                      {quote.validity_date && ` · Valid until ${formatDate(quote.validity_date)}`}
                    </p>
                    {needsAction && (
                      <p className="text-xs font-medium text-amber-600 mt-1">
                        ⚠ Your approval is required
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-xl font-bold text-[#1B2B4B]">{formatEGP(quote.total)}</p>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1B2B4B] transition-colors" aria-hidden="true" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  return <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading...</div>}>
    <QuotesContent />
  </Suspense>;
}

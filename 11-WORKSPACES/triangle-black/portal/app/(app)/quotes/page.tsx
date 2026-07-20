// @ts-nocheck
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { quotesApi } from "@/lib/api";
import { Quote, QuoteStatus } from "@/lib/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { QUOTE_STATUS_CONFIG, formatEGP, formatDate } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "sent", label: "Sent" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function QuotesPage() {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => quotesApi.list().then((r) => r.data as Quote[]),
    refetchInterval: 15000,
  });

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);
  const totalValue = filtered.reduce((s, q) => s + q.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} quotes · {formatEGP(totalValue)} total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter quotes by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]
              ${filter === f.value
                ? "bg-[#1B2B4B] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                {quotes.filter((q) => q.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div role="status" className="text-center py-12 text-gray-400">Loading quotes...</div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" aria-hidden="true" />
                <p>No quotes found</p>
              </div>
            </Card>
          ) : (
            filtered.map((quote) => {
              const cfg = QUOTE_STATUS_CONFIG[quote.status as QuoteStatus];
              return (
                <button
                  key={quote.id}
                  onClick={() => router.push(`/quotes/${quote.id}`)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1B2B4B] hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]"
                  aria-label={`Quote: ${quote.title}, status: ${quote.status}, value: ${formatEGP(quote.total)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <p className="font-semibold text-gray-900 truncate">{quote.title}</p>
                        <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {quote.items.length} line items · Created {formatDate(quote.created_at)}
                        {quote.validity_date && ` · Valid until ${formatDate(quote.validity_date)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <p className="text-xl font-bold text-[#1B2B4B]">{formatEGP(quote.total)}</p>
                      <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

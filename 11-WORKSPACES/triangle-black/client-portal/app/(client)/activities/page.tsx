"use client";
import { useQuery } from "@tanstack/react-query";
import { clientQuotesApi } from "@/lib/api";
import { formatEGP, formatDate, QUOTE_STATUS, QuoteStatus } from "@/lib/utils";
import Link from "next/link";
import { FileText, CheckCircle, XCircle, Clock, Eye, Send } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  approved: CheckCircle,
  rejected: XCircle,
  sent: Send,
  review: Eye,
  draft: Clock,
};

const COLORS: Record<string, string> = {
  approved: "text-green-600 bg-green-50 border-green-200",
  rejected: "text-red-600 bg-red-50 border-red-200",
  sent: "text-amber-600 bg-amber-50 border-amber-200",
  review: "text-blue-600 bg-blue-50 border-blue-200",
  draft: "text-gray-500 bg-gray-50 border-gray-200",
};

export default function ActivitiesPage() {
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["client-quotes"],
    queryFn: () => clientQuotesApi.list().then((r) => r.data),
    refetchInterval: 30000,
  });

  const sorted = [...quotes].sort((a: { updated_at: string }, b: { updated_at: string }) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
        <p className="text-gray-500 mt-1">Track the status of all your proposals</p>
      </div>

      {isLoading && (
        <div role="status" className="text-center py-12 text-gray-400">Loading history...</div>
      )}

      {!isLoading && sorted.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500">No activity yet</p>
        </div>
      )}

      <ol className="relative border-l-2 border-gray-200 space-y-6 ml-4" aria-label="Activity timeline">
        {sorted.map((quote: {
          id: string; title: string; status: string;
          total: number; updated_at: string;
        }) => {
          const cfg = QUOTE_STATUS[quote.status as QuoteStatus];
          const Icon = ICONS[quote.status] || FileText;
          const colorClass = COLORS[quote.status] || "text-gray-500 bg-gray-50 border-gray-200";
          return (
            <li key={quote.id} className="ml-8">
              <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white ${colorClass}`}>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <Link
                href={`/quotes/${quote.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1B2B4B] hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] group"
                aria-label={`${quote.title} — ${cfg.label}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-[#1B2B4B] transition-colors">
                      {quote.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Updated {formatDate(quote.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-[#1B2B4B]">{formatEGP(quote.total)}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

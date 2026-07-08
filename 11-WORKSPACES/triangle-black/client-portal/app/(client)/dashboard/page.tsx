"use client";
import { useQuery } from "@tanstack/react-query";
import { clientQuotesApi, clientDashboardApi } from "@/lib/api";
import { useClientAuth } from "@/lib/auth-context";
import { formatEGP, formatDate, QUOTE_STATUS, QuoteStatus } from "@/lib/utils";
import Link from "next/link";
import {
  FileText, CheckCircle, Clock, TrendingUp,
  ChevronRight, AlertCircle,
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color = "text-[#1B2B4B]" }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useClientAuth();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["client-quotes"],
    queryFn: () => clientQuotesApi.list().then((r) => r.data),
    refetchInterval: 30000,
  });

  const approved = quotes.filter((q: { status: string }) => q.status === "approved");
  const pending = quotes.filter((q: { status: string }) => q.status === "sent");
  const total = quotes.reduce((s: number, q: { total: number }) => s + q.total, 0);
  const approvedValue = approved.reduce((s: number, q: { total: number }) => s + q.total, 0);
  const recent = [...quotes]
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your engineering service proposals
        </p>
      </div>

      {/* Action Required Banner */}
      {pending.length > 0 && (
        <div
          role="alert"
          className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700">
              You have {pending.length} proposal{pending.length > 1 ? "s" : ""} awaiting your approval.
            </p>
          </div>
          <Link
            href="/quotes?filter=sent"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <section aria-label="Overview statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Proposals" value={quotes.length}
            sub="All time" icon={FileText} />
          <StatCard label="Awaiting Approval" value={pending.length}
            sub="Needs your review" icon={Clock}
            color={pending.length > 0 ? "text-amber-600" : "text-gray-900"} />
          <StatCard label="Approved Contracts" value={approved.length}
            sub={formatEGP(approvedValue)} icon={CheckCircle}
            color="text-green-600" />
          <StatCard label="Total Value" value={formatEGP(total)}
            sub="All proposals" icon={TrendingUp} color="text-[#1B2B4B]" />
        </div>
      </section>

      {/* Recent Proposals */}
      <section aria-label="Recent proposals">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
          <Link
            href="/quotes"
            className="text-sm text-[#1B2B4B] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div role="status" className="text-center py-8 text-gray-400">
            Loading proposals...
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-500">No proposals yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Contact Triangle Black to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((quote: {
              id: string; title: string; status: string;
              total: number; created_at: string; items: unknown[];
            }) => {
              const cfg = QUOTE_STATUS[quote.status as QuoteStatus];
              return (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1B2B4B] hover:shadow-md transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]"
                  aria-label={`${quote.title} — ${cfg.label} — ${formatEGP(quote.total)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-[#1B2B4B] transition-colors">
                        {quote.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(quote.items as unknown[]).length} services · {formatDate(quote.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-[#1B2B4B]">{formatEGP(quote.total)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1B2B4B] transition-colors" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Contact */}
      <section aria-label="Contact Triangle Black">
        <div className="bg-[#1B2B4B] rounded-2xl p-6 text-white">
          <h2 className="font-bold text-lg mb-2">Need assistance?</h2>
          <p className="text-white/70 text-sm mb-4">
            Contact your Triangle Black engineering team for any questions about your proposals or services.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:amr@triangleblack.com"
              className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
            >
              Email Us
            </a>
            <a
              href="tel:+201001234567"
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Call +20 100 123 4567
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

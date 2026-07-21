"use client";
// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, PageWrapper, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { quotesApi } from "@/lib/api";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";
import { ChevronRight, Plus, RefreshCw, FileText } from "lucide-react";

const STATUS: Record<string, { label: string; cls: string }> = {
  draft:    { label: "Draft",    cls: "bg-slate-100 text-slate-600" },
  review:   { label: "Review",   cls: "bg-blue-50 text-blue-700" },
  sent:     { label: "Sent",     cls: "bg-indigo-50 text-indigo-700" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600" },
};

const FILTERS = ["all", "draft", "review", "sent", "approved", "rejected"];

export default function QuotesPage() {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const { data: quotes = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => quotesApi.list().then((r: any) => Array.isArray(r) ? r : r?.data || r?.items || []),
    staleTime: 30_000,
  });

  const filtered  = filter === "all" ? quotes : quotes.filter((q: any) => q.status === filter);
  const totalVal  = filtered.reduce((s: number, q: any) => s + (q.total || 0), 0);

  return (
    <PageWrapper>
      <PageHeader
        title="Quotes"
        subtitle={filtered.length + " quotes · " + fmtCurrency(totalVal)}
        badge="QUOTE"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
            <Link href="/quotes/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors">
              <Plus className="w-4 h-4" /> New Quote
            </Link>
          </div>
        }
      />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (filter === f ? "bg-amber-600 text-white" : "text-slate-500 hover:bg-slate-100")}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-1.5 opacity-70">{quotes.filter((q: any) => q.status === f).length}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState type="table" rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No quotes"
          description="Create your first quote"
          action={<Link href="/quotes/new" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-xl">New Quote</Link>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((q: any) => {
            const st = STATUS[q.status] || { label: q.status, cls: "bg-slate-100 text-slate-600" };
            return (
              <button key={q.id} onClick={() => router.push("/quotes/" + q.id)}
                className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700 truncate">{q.title}</p>
                      <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold " + st.cls}>{st.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {(q.items || []).length} items · {fmtDate(q.created_at)}
                      {q.validity_date ? " · Valid until " + fmtDate(q.validity_date) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-lg font-bold text-slate-900">{fmtCurrency(q.total || 0)}</p>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

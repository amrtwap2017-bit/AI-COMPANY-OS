// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return fmtDate(d); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchQuotations = async () => {
  try {
    const res = await authFetch(`/api/v1/supply-chain/quotations`);
  if (!res.ok) return [];
  return res.json();
  } catch (error) {
    if (error.message === "Not found") {
      const fallbackResponse = await authFetch(`/api/v1/quotations`).then(r => r.json());
      if (!fallbackResponse.ok) return [];
      return fallbackResponse.json();
    }
    throw error;
  }
};

const QuotationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "received" | "accepted" | "rejected" | "expired">("all");

  const { data: quotations, isLoading, isError } = useQuery(["quotations"], fetchQuotations, {
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !quotations) return <EmptyState title="No quotations recorded" note="Create RFQs in Supply Chain Workbench" />;

  const filteredQuotations = toArr(quotations).filter((q: any) => {
    switch (statusFilter) {
      case "received":
        return q.status === "received" || q.status === "pending";
      case "accepted":
        return q.status === "accepted";
      case "rejected":
        return q.status === "rejected";
      case "expired":
        return q.status === "expired";
      default:
        return true;
    }
  });

  const metrics = {
    totalQuotes: quotations.length,
    pendingReview: toArr(quotations).filter((q: any) => q.status === "received" || q.status === "pending").length,
    accepted: toArr(quotations).filter((q: any) => q.status === "accepted").length,
    expired: toArr(quotations).filter((q: any) => q.status === "expired").length,
  };

  return (
    <PageWrapper>
      <PageHeader title="Supplier Quotations" />
      <SectionCard>
        <MetricStrip metrics={metrics} />
      </SectionCard>
      <div className="flex gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-md ${statusFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("received")}
          className={`px-3 py-2 rounded-md ${statusFilter === "received" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Received
        </button>
        <button
          onClick={() => setStatusFilter("accepted")}
          className={`px-3 py-2 rounded-md ${statusFilter === "accepted" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Accepted
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`px-3 py-2 rounded-md ${statusFilter === "rejected" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Rejected
        </button>
        <button
          onClick={() => setStatusFilter("expired")}
          className={`px-3 py-2 rounded-md ${statusFilter === "expired" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Expired
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toArr(filteredQuotations).map((q: any) => (
          <SectionCard key={q.id}>
            <h3 className="font-bold">{q.quotation_number}</h3>
            <StatusBadge status={q.status} />
            <p>{new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(q.total_amount)}</p>
            <p className={q.valid_until < new Date().toISOString() ? "text-red-500" : ""}>
              Valid Until: {fmtDate(q.valid_until)}
            </p>
            {q.rfq_id && (
              <a href={`/supply-chain/rfqs/${q.rfq_id}`} className="block mt-2 text-blue-500 hover:text-blue-700">
                View RFQ
              </a>
            )}
          </SectionCard>
        ))}
      </div>
    </PageWrapper>
  );
};

export default QuotationsPage;
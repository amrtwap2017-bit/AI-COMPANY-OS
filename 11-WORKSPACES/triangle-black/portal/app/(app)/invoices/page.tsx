// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchInvoices = async () => {
  const res = await authFetch(`/api/v1/invoices`);
  if (!res.ok) return [];
  return res.json();
};

const InvoicesPage = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue" | "cancelled">("all");

  const { data: invoices, isLoading, isError } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !invoices) return <EmptyState />;

  const today = new Date().toISOString().slice(0, 10);
  const totalInvoices = invoices.length;
  const totalValueEGP = toArr(invoices).reduce((acc: any, invoice: any) => acc + invoice.total_amount, 0);
  const pendingCount = toArr(invoices).filter(invoice => invoice.status === "pending").length;
  const overdueCount = toArr(invoices).filter(invoice => new Date(invoice.due_date) < new Date(today) && invoice.status !== "paid").length;

  const filteredInvoices = invoices
    .filter(invoice => statusFilter === "all" || invoice.status === statusFilter)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <PageWrapper>
      <PageHeader title="Invoice Management" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Invoices", value: totalInvoices },
            { label: "Total Value EGP", value: (Number(totalValueEGP) || 0).toFixed(2) + " EGP" },
            { label: "Pending", value: pendingCount, color: "bg-yellow-500" },
            { label: "Overdue", value: overdueCount, color: "bg-red-500" },
          ]}
        />
      </SectionCard>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-2 py-1 rounded mr-2 ${statusFilter === "all" ? "bg-blue-500 text-white" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-2 py-1 rounded mr-2 ${statusFilter === "pending" ? "bg-blue-500 text-white" : ""}`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter("paid")}
          className={`px-2 py-1 rounded mr-2 ${statusFilter === "paid" ? "bg-green-500 text-white" : ""}`}
        >
          Paid
        </button>
        <button
          onClick={() => setStatusFilter("overdue")}
          className={`px-2 py-1 rounded mr-2 ${statusFilter === "overdue" ? "bg-red-500 text-white" : ""}`}
        >
          Overdue
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`px-2 py-1 rounded ${statusFilter === "cancelled" ? "bg-gray-300 text-black" : ""}`}
        >
          Cancelled
        </button>
      </div>
      {filteredInvoices.length > 0 ? (
        <ul>
          {toArr(filteredInvoices).map(invoice => (
            <li key={invoice.id} className="flex items-center justify-between mb-2">
              <span className="font-bold">{invoice.invoice_number}</span>
              <StatusBadge status={invoice.status} />
              <span>{(Number(invoice.total_amount) || 0).toFixed(2)} EGP</span>
              <span
                className={`text-red-500 ${new Date(invoice.due_date) < new Date(today) && invoice.status !== "paid" ? "" : "hidden"}`}
              >
                Overdue
              </span>
              <span>{invoice.created_at}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState />
      )}
    </PageWrapper>
  );
};

export default InvoicesPage;
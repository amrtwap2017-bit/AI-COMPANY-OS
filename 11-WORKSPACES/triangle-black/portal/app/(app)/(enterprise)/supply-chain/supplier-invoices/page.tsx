"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchInvoices = async () => {
  const response = await fetch("/api/v1/supply-chain/supplier-invoices", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return response.json();
};

const SupplierInvoicesPage = () => {
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Paid" | "Overdue" | "Disputed">("All");

  const { data: invoices, isLoading, isError } = useQuery(["invoices"], fetchInvoices, {
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !invoices) return <EmptyState title="No supplier invoices recorded" description="Please create an invoice via the PO workflow." />;

  const totalInvoices = invoices.length;
  const pendingPayment = invoices.filter(i => i.status === "Pending").length;
  const overdue = invoices.filter(i => new Date(i.due_date) < new Date() && i.status !== "Paid").length;
  const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Pending" && invoice.status === "Pending") return true;
    if (statusFilter === "Paid" && invoice.status === "Paid") return true;
    if (statusFilter === "Overdue" && new Date(invoice.due_date) < new Date() && invoice.status !== "Paid") return true;
    if (statusFilter === "Disputed" && invoice.status === "Disputed") return true;
    return false;
  });

  const overdueInvoices = filteredInvoices.filter(i => new Date(i.due_date) < new Date() && i.status !== "Paid");

  return (
    <PageWrapper>
      <PageHeader title="Supplier Invoices" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Invoices", value: totalInvoices },
            { label: "Pending Payment", value: pendingPayment, color: "text-yellow-500" },
            { label: "Overdue", value: overdue, color: "text-red-500" },
            { label: "Total Amount EGP", value: (Number(totalAmount) || 0).toFixed(2), currency: true },
          ]}
        />
      </SectionCard>
      <div className="flex items-center justify-between mb-4">
        <select
          className="border border-gray-300 rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "All" | "Pending" | "Paid" | "Overdue" | "Disputed")}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Disputed">Disputed</option>
        </select>
      </div>
      {overdueInvoices.length > 0 && (
        <SectionCard title="Overdue Invoices">
          <ul className="list-disc pl-4">
            {overdueInvoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between mb-2">
                <span className="font-bold">{invoice.invoice_number}</span>
                <StatusBadge status={invoice.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      {filteredInvoices.length > 0 && (
        <SectionCard title="Invoice List">
          <ul className="list-disc pl-4">
            {filteredInvoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between mb-2">
                <span className="font-bold">{invoice.invoice_number}</span>
                <StatusBadge status={invoice.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </PageWrapper>
  );
};

export default SupplierInvoicesPage;
// @ts-nocheck
"use client";

import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Modal } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import Link from "next/link";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function InvoicesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: invoices, isLoading, isError } = useQuery(["invoices"], () => authFetch("/api/v1/invoices/?limit=100").then(r => r.json()), { refetchInterval: 60000 });

  const filteredInvoices = toArr(invoices).filter(item => 
    item.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === "" || item.status === selectedStatus)
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await authFetch("/api/v1/invoices/?limit=100", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_id: "tb-default-hotel-000000000001",
          invoice_number: e.target.invoice_number.value,
          total_amount: parseFloat(e.target.total_amount.value),
          status: e.target.status.value,
          due_date: e.target.due_date.value
        })
      });
      setShowCreate(false);
      e.target.reset();
    } catch (err) {
      alert(err?.detail || "Failed");
    }
  };

  return (
    <PageWrapper>
      <PageHeader 
        title="Invoices" 
        subtitle="Manage your invoices here." 
        breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Invoices" }]} 
        actions={<Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>+ New</Button>}
      />
      <div className="grid grid-cols-4 gap-4">
        <SectionCard title="Total Invoices" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{toArr(invoices).length}</span>}>
          Total number of invoices.
        </SectionCard>
        <SectionCard title="Pending Invoices" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">{toArr(invoices).filter(i => i.status === "pending").length}</span>}>
          Invoices that are pending payment.
        </SectionCard>
        <SectionCard title="Paid Invoices" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">{toArr(invoices).filter(i => i.status === "paid").length}</span>}>
          Invoices that have been paid.
        </SectionCard>
        <SectionCard title="Overdue Invoices" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">{toArr(invoices).filter(i => i.status === "overdue").length}</span>}>
          Invoices that are overdue.
        </SectionCard>
      </div>
      <div className="flex items-center justify-between mb-4">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search invoices..." className="border border-slate-200 px-3 py-2 rounded-md" />
        {toArr(invoices).length > 0 && (
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="border border-slate-200 px-3 py-2 rounded-md">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        )}
      </div>
      {isLoading && <LoadingState />}
      {isError && <EmptyState title="Failed to load invoices" />}
      {!isLoading && !isError && filteredInvoices.length === 0 && <EmptyState title="No records found" />}
      {!isLoading && !isError && filteredInvoices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice Number</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Amount</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-sm text-slate-700">{item.invoice_number}</td>
                  <td className="py-3 px-3 text-sm text-slate-700">${item.total_amount.toFixed(2)}</td>
                  <td className="py-3 px-3 text-sm text-slate-700">
                    {item.status === "pending" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>}
                    {item.status === "paid" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Paid</span>}
                    {item.status === "overdue" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Overdue</span>}
                  </td>
                  <td className="py-3 px-3 text-sm text-slate-700">{item.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Invoice" size="md">
        <form onSubmit={handleCreateSubmit}>
          <div className="mb-4">
            <label htmlFor="invoice_number" className="block text-sm font-medium text-slate-700">Invoice Number</label>
            <input type="text" id="invoice_number" name="invoice_number" required className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div className="mb-4">
            <label htmlFor="total_amount" className="block text-sm font-medium text-slate-700">Total Amount</label>
            <input type="number" id="total_amount" name="total_amount" required step="0.01" className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
            <select id="status" name="status" required className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="due_date" className="block text-sm font-medium text-slate-700">Due Date</label>
            <input type="date" id="due_date" name="due_date" required className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
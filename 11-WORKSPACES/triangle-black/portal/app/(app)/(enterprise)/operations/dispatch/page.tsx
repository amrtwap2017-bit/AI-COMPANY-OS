// @ts-nocheck
"use client";

import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Modal } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import Link from "next/link";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function DispatchPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: workOrders, isLoading, isError } = useQuery(
    ["work-orders"],
    () => authFetch("/api/v1/work-orders/?limit=100").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const filteredWorkOrders = toArr(workOrders).filter(order => {
    return order.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
           (selectedStatus === "" || order.status === selectedStatus);
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const response = await authFetch("/api/v1/work-orders/", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        setShowCreate(false);
        e.target.reset();
        refetch();
      } else {
        alert(response.detail || "Failed");
      }
    } catch (err) {
      alert(err?.detail || "Failed");
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Dispatch"
        subtitle="Manage work orders for hotels"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + New
          </Button>
        }
      />
      {isLoading && <LoadingState />}
      {isError && <EmptyState title="Failed to load data" />}
      {!isLoading && !isError && filteredWorkOrders.length === 0 && (
        <EmptyState title="No records found" />
      )}
      {!isLoading && !isError && filteredWorkOrders.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <SectionCard title="Total Orders" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">42</span>}>
              Total number of work orders
            </SectionCard>
            <SectionCard title="Pending Orders" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">17</span>}>
              Orders that need attention
            </SectionCard>
            <SectionCard title="Completed Orders" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">25</span>}>
              Orders that are completed
            </SectionCard>
            <SectionCard title="High Priority Orders" action={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">3</span>}>
              Orders with high priority
            </SectionCard>
          </div>
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-slate-200 px-3 py-2 rounded-md"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 px-3 py-2 rounded-md"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filteredWorkOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-sm text-slate-700">{order.title}</td>
                    <td className="py-3 px-3 text-sm text-slate-700">{order.description}</td>
                    <td className="py-3 px-3 text-sm text-slate-700">{order.type}</td>
                    <td className="py-3 px-3 text-sm text-slate-700">
                      {order.priority === "high" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">HIGH</span>
                      )}
                      {order.priority === "medium" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">MEDIUM</span>
                      )}
                      {order.priority === "low" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">LOW</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm text-slate-700">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Work Order" size="md">
        <form onSubmit={handleCreateSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-slate-700">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              required
              className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority</label>
            <select
              id="priority"
              name="priority"
              required
              className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="hotel_id" className="block text-sm font-medium text-slate-700">Hotel ID</label>
            <input
              type="text"
              id="hotel_id"
              name="hotel_id"
              defaultValue="tb-default-hotel-000000000001"
              readOnly
              className="mt-1 block w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Create
          </Button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
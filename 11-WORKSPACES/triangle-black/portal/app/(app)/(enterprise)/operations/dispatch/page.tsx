// @ts-nocheck
"use client";

import { useQuery } from "react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const DispatchPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: workOrders, isLoading, isError } = useQuery(
    ["work-orders"],
    () => authFetch("/api/v1/work-orders/?limit=100").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const filteredWorkOrders = toArr(workOrders).filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter === "" || w.status === statusFilter)
  );

  const handleCreate = async () => {
    try {
      await authFetch("/api/v1/work-orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Work Order",
          description: "",
          type: "Maintenance",
          priority: 1,
          hotel_id: "tb-default-hotel-000000000001"
        })
      });
      setShowCreate(false);
    } catch (error) {
      alert("Error creating work order");
    }
  };

  return (
    <PageWrapper>
      <PageHeader title="Dispatch Work Orders" actions={
        <Button variant='primary' size='sm' onClick={() => setShowCreate(true)}>+ New</Button>
      }>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </PageHeader>

      {isLoading && <LoadingState />}
      {isError && <EmptyState title="No records" />}

      {!isLoading && !isError && filteredWorkOrders.length === 0 && (
        <EmptyState title="No records" />
      )}

      {!isLoading && !isError && filteredWorkOrders.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <SectionCard>
              <div className="text-2xl font-bold text-blue-700">{filteredWorkOrders.filter(w => w.priority === 1).length}</div>
              <div className="text-xs text-slate-500">High Priority</div>
            </SectionCard>
            <SectionCard>
              <div className="text-2xl font-bold text-blue-700">{filteredWorkOrders.filter(w => w.priority === 2).length}</div>
              <div className="text-xs text-slate-500">Medium Priority</div>
            </SectionCard>
            <SectionCard>
              <div className="text-2xl font-bold text-blue-700">{filteredWorkOrders.filter(w => w.priority === 3).length}</div>
              <div className="text-xs text-slate-500">Low Priority</div>
            </SectionCard>
            <SectionCard>
              <div className="text-2xl font-bold text-blue-700">{filteredWorkOrders.length}</div>
              <div className="text-xs text-slate-500">Total WOs</div>
            </SectionCard>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-3 text-sm font-bold bg-slate-100">ID</th>
                <th className="py-3 px-3 text-sm font-bold bg-slate-100">Title</th>
                <th className="py-3 px-3 text-sm font-bold bg-slate-100">Description</th>
                <th className="py-3 px-3 text-sm font-bold bg-slate-100">Priority</th>
                <th className="py-3 px-3 text-sm font-bold bg-slate-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.map(w => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-sm">{w.id}</td>
                  <td className="py-3 px-3 text-sm">{w.title}</td>
                  <td className="py-3 px-3 text-sm">{w.description}</td>
                  <td className="py-3 px-3 text-sm">
                    {w.priority === 1 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">High</span>}
                    {w.priority === 2 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Medium</span>}
                    {w.priority === 3 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Low</span>}
                  </td>
                  <td className="py-3 px-3 text-sm">{w.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {showCreate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <h2>Create Work Order</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}>
                  <div className="mb-3">
                    <label>Title:</label>
                    <input type="text" name="title" required className="border border-slate-300 rounded px-2 py-1" />
                  </div>
                  <div className="mb-3">
                    <label>Description:</label>
                    <textarea name="description" className="border border-slate-300 rounded px-2 py-1"></textarea>
                  </div>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default DispatchPage;
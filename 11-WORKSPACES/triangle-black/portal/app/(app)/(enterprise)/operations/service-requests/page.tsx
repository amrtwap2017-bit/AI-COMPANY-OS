// @ts-nocheck
"use client";

import { useQuery } from "react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const ServiceRequestsPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: serviceRequests, isLoading, isError } = useQuery(
    ["service-requests"],
    () =>
      authFetch("/api/v1/service-requests/?limit=100").then((r) => r.json()),
    {
      refetchInterval: 60000,
    }
  );

  const filteredData = toArr(serviceRequests).filter((sr) => 
    sr.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "" || sr.status === statusFilter)
  );

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load service requests" />;

  const kpiData = {
    total: filteredData.length,
    highUrgency: filteredData.filter((sr) => sr.urgency === "high").length,
    mediumUrgency: filteredData.filter((sr) => sr.urgency === "medium").length,
    lowUrgency: filteredData.filter((sr) => sr.urgency === "low").length,
  };

  return (
    <PageWrapper>
      <PageHeader title="Service Requests" actions={<Button variant='primary' size='sm' onClick={() => setShowCreate(true)}>+ New</Button>}>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(kpiData).map(([key, value]) => (
          <SectionCard key={key} title={key.charAt(0).toUpperCase() + key.slice(1)} value={value} />
        ))}
      </div>

      {filteredData.length === 0 && <EmptyState title="No records" />}

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Urgency</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((sr) => (
            <tr key={sr.id} className="hover:bg-slate-50">
              <td className="py-3 px-3 text-sm">{sr.title}</td>
              <td className="py-3 px-3 text-sm">{sr.category}</td>
              <td className="py-3 px-3 text-sm">
                {sr.urgency === "high" && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">High</span>}
                {sr.urgency === "medium" && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Medium</span>}
                {sr.urgency === "low" && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Low</span>}
              </td>
              <td className="py-3 px-3 text-sm">{sr.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <h2>Create Service Request</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              authFetch("/api/v1/service-requests/?limit=100", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: formData.get("title"),
                  description: formData.get("description"),
                  category: formData.get("category"),
                  urgency: formData.get("urgency"),
                  submitted_by: formData.get("submitted_by"),
                  contact_phone: formData.get("contact_phone"),
                  hotel_id: "tb-default-hotel-000000000001",
                }),
              }).then((r) => {
                if (r.ok) {
                  setShowCreate(false);
                  // Refetch data
                } else {
                  alert("Failed to create service request");
                }
              });
            }}>
              <div className="mb-4">
                <label>Title</label>
                <input type="text" name="title" required className="border border-slate-300 rounded px-2 py-1 w-full" />
              </div>
              <div className="mb-4">
                <label>Description</label>
                <textarea name="description" required className="border border-slate-300 rounded px-2 py-1 w-full"></textarea>
              </div>
              <div className="mb-4">
                <label>Category</label>
                <input type="text" name="category" required className="border border-slate-300 rounded px-2 py-1 w-full" />
              </div>
              <div className="mb-4">
                <label>Urgency</label>
                <select name="urgency" required className="border border-slate-300 rounded px-2 py-1 w-full">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="mb-4">
                <label>Submitted By</label>
                <input type="text" name="submitted_by" required className="border border-slate-300 rounded px-2 py-1 w-full" />
              </div>
              <div className="mb-4">
                <label>Contact Phone</label>
                <input type="tel" name="contact_phone" required className="border border-slate-300 rounded px-2 py-1 w-full" />
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ServiceRequestsPage;
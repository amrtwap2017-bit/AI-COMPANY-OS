// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const OperationsDispatchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: workOrders, isLoading, isError } = useQuery(
    ["work-orders"],
    () => authFetch("/api/v1/work-orders/?limit=100").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const filteredWorkOrders = toArr(workOrders).filter(order =>
    order.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search work orders..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ display: "flex", gap: "20px" }}>
        {/* KPI Grid */}
        <div>OPEN</div>
        <div>DONE</div>
        <div>HIGH</div>
        <div>!</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {filteredWorkOrders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.description}</td>
              <td>{order.status}</td>
              <td>{order.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OperationsDispatchPage;
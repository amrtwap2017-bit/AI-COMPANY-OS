"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const CommercialContractsRenewalPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: serviceRequestsData, isLoading } = useQuery(
    ["service-requests"],
    () => authFetch("/api/v1/service-requests/?limit=100").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const filteredServiceRequests = toArr(serviceRequestsData).filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
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
            <th>Name</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredServiceRequests.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommercialContractsRenewalPage;
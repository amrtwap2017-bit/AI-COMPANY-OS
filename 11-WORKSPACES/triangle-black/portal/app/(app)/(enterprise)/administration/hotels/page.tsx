"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const AdministrationHotelsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: hotelsData, isLoading, isError } = useQuery(
    ["hotels"],
    () => authFetch("/api/v1/assets/?limit=100").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const filteredHotels = toArr(hotelsData).filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search hotels..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {/* KPI Grid */}
        {filteredHotels.slice(0, 4).map((hotel) => (
          <div key={hotel.id}>
            <h3>{hotel.name}</h3>
            <p>{hotel.address}</p>
          </div>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {filteredHotels.map((hotel) => (
            <tr key={hotel.id}>
              <td>{hotel.name}</td>
              <td>{hotel.address}</td>
              <td>{hotel.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdministrationHotelsPage;
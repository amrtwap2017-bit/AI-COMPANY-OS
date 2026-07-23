"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { useState } from "react";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchUsers = async () => {
  const response = await fetch("/api/v1/auth/users", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const fetchTechnicians = async () => {
  const response = await fetch("/api/v1/technicians", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch technicians");
  return response.json();
};

const UsersPage = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "admin" | "manager" | "technician" | "viewer">("all");
  const [searchText, setSearchText] = useState("");

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchInterval: 0,
  });

  const { data: techniciansData, isLoading: techniciansLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: fetchTechnicians,
    refetchInterval: 0,
  });

  if (usersLoading || techniciansLoading) return <LoadingState />;

  if (!usersData || !techniciansData) return <EmptyState message="Failed to load data" />;

  const filteredUsers = usersData.filter(user =>
    activeFilter === "all" ||
    (activeFilter === "admin" && user.role === "admin") ||
    (activeFilter === "manager" && user.role === "manager") ||
    (activeFilter === "technician" && user.role === "technician") ||
    (activeFilter === "viewer" && user.role === "viewer")
  ).filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) || user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const adminCount = filteredUsers.filter(user => user.role === "admin").length;

  return (
    <PageWrapper>
      <PageHeader title="User Management" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Users", value: usersData.length },
            { label: "Active Users", value: filteredUsers.filter(user => user.is_active).length },
            { label: "Technicians", value: 25 },
            { label: "Admins", value: adminCount },
          ]}
        />
      </SectionCard>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded mr-4 w-full"
        />
        <button onClick={() => refetchUsers()} className="bg-blue-500 text-white px-4 py-2 rounded">Refresh</button>
      </div>
      {filteredUsers.length === 0 && <EmptyState message="No users found" />}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><StatusBadge status={user.role} /></td>
              <td><StatusBadge status={user.is_active ? "active" : "inactive"} color={user.is_active ? "green" : "red"} /></td>
              <td>{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default UsersPage;
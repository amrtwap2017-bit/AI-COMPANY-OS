"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchAgreements = async () => {
  try {
    const response = await fetch("/api/v1/supply-chain/agreements", { credentials: "include" });
    if (response.ok) return response.json();
    throw new Error("Failed to fetch agreements");
  } catch (_) {
    return fetch("/api/v1/contracts", { credentials: "include" }).then((res) => res.json());
  }
};

const AgreementCard = ({ id, client_name, status, start_date, end_date, contract_value }: any) => (
  <SectionCard key={id}>
    <h3 className="font-bold">{client_name}</h3>
    <StatusBadge status={status} />
    <p>{contract_value.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}</p>
    <p>{`${start_date} - ${end_date}`}</p>
    <div className="text-right">
      {(() => {
        const daysUntilExpiry = Math.ceil((new Date(end_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30) return <span className="text-red-500">{daysUntilExpiry} days</span>;
        if (daysUntilExpiry <= 60) return <span className="text-yellow-500">{daysUntilExpiry} days</span>;
        return <span>{daysUntilExpiry} days</span>;
      })()}
    </div>
  </SectionCard>
);

const AgreementsPage = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const { data: agreements, isLoading, isError } = useQuery(["agreements"], fetchAgreements, {
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load agreements" />;

  const filteredAgreements = agreements.filter((a: any) => {
    if (statusFilter === "Active") return a.status === "Active";
    if (statusFilter === "Expiring") return new Date(a.end_date) - new Date() <= 60 * 24 * 60 * 1000;
    if (statusFilter === "Expired") return new Date(a.end_date) < new Date();
    return true;
  });

  const totalValue = agreements.reduce((acc: number, a: any) => acc + a.contract_value, 0);

  return (
    <PageWrapper>
      <PageHeader title="Supplier Agreements and Contracts" />
      <div className="flex justify-between mb-4">
        <MetricStrip
          title="Total Agreements"
          value={agreements.length}
          icon="document"
        />
        <MetricStrip
          title="Active"
          value={agreements.filter((a: any) => a.status === "Active").length}
          icon="check-circle"
        />
        <MetricStrip
          title="Expiring Soon"
          value={agreements.filter((a: any) => new Date(a.end_date) - new Date() <= 60 * 24 * 60 * 1000).length}
          icon="clock"
        />
        <MetricStrip
          title="Total Value EGP"
          value={totalValue.toLocaleString("en-EG", { style: "currency", currency: "EGP" })}
          icon="dollar-sign"
        />
      </div>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-2 py-1 rounded ${statusFilter === "All" ? "bg-blue-500 text-white" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("Active")}
          className={`px-2 py-1 rounded ${statusFilter === "Active" ? "bg-green-500 text-white" : ""}`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("Expiring")}
          className={`px-2 py-1 rounded ${statusFilter === "Expiring" ? "bg-yellow-500 text-white" : ""}`}
        >
          Expiring
        </button>
        <button
          onClick={() => setStatusFilter("Expired")}
          className={`px-2 py-1 rounded ${statusFilter === "Expired" ? "bg-red-500 text-white" : ""}`}
        >
          Expired
        </button>
      </div>
      {filteredAgreements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgreements.map((a: any) => (
            <AgreementCard key={a.id} {...a} />
          ))}
        </div>
      ) : (
        <EmptyState message="No agreements found" />
      )}
    </PageWrapper>
  );
};

export default AgreementsPage;
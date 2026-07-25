// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchContracts = async () => {
  const res = await authFetch(`/api/v1/contracts`);
  if (!res.ok) {
    return [];
  }
  return response.json();
};

const ContractRenewalPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading, isError } = useQuery(["contracts"], fetchContracts, {
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load contracts" />;

  const contracts = data.contracts;
  const totalContracts = (contracts || []).length;
  const activeContracts = toArr(contracts).filter(c => c.status === "active").length;
  const expiringSoon = toArr(contracts).filter(c => new Date(c.end_date) - new Date() <= 86400000 * 90).length;
  const expiringUrgently = toArr(contracts).filter(c => new Date(c.end_date) - new Date() <= 86400000 * 30).length;
  const totalValueEGP = toArr(contracts).reduce((acc: any, c: any) => acc + c.contract_value, 0);

  return (
    <PageWrapper>
      <PageHeader title="Contract Renewal Pipeline" />
      <MetricStrip
        metrics={[
          { label: "Total Contracts", value: totalContracts },
          { label: "Active", value: activeContracts },
          { label: "Expiring in 30 days", value: expiringUrgently, color: "red" },
          { label: "Expiring in 90 days", value: expiringSoon - expiringUrgently, color: "amber" },
          { label: "Total Value EGP", value: totalValueEGP.toLocaleString("en-GB") },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts
          .filter(c => new Date(c.end_date) - new Date() <= 86400000 * 90)
          .map((c, index) => (
            <SectionCard key={index} className="bg-white shadow-md p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{c.client_name}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-gray-600">
                {new Date(c.end_date).toLocaleDateString()}{" "}
                {Math.ceil((new Date(c.end_date) - new Date()) / 86400000)} days left
              </p>
              <p className="font-bold">{c.contract_value.toLocaleString("en-GB")} EGP</p>
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Initiate Renewal</button>
            </SectionCard>
          ))}
      </div>
      {contracts
        .filter(c => new Date(c.end_date) < new Date())
        .map((c, index) => (
          <SectionCard key={index} className="bg-white shadow-md p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{c.client_name}</h3>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-gray-600">
              {new Date(c.end_date).toLocaleDateString()} Expired
            </p>
            <p className="font-bold">{c.contract_value.toLocaleString("en-GB")} EGP</p>
          </SectionCard>
        ))}
    </PageWrapper>
  );
};

export default ContractRenewalPage;
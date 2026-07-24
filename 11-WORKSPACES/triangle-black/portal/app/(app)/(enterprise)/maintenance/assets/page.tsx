"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
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

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchAssets = async () => {
  const response = await fetch(`${BACK}/api/v1/assets`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch assets");
  }
  return response.json();
};

const AssetPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: assets, isLoading, isError } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load assets" />;

  const filteredAssets = (assets || []).filter((asset: any) =>
    categoryFilter ? asset.category.toLowerCase().includes(categoryFilter.toLowerCase()) : true
  );

  const totalAssets = filteredAssets.length;
  const criticalAssets = filteredAssets.filter((asset: any) => asset.criticality === "critical").length;
  const operationalAssets = filteredAssets.filter((asset: any) => asset.status === "operational").length;
  const inFaultAssets = filteredAssets.filter(
    (asset: any) => asset.status === "fault" || asset.status === "breakdown"
  ).length;

  return (
    <PageWrapper>
      <PageHeader title="Asset Registry">
        <MetricStrip
          metrics={[
            { label: "Total Assets", value: totalAssets },
            { label: "Critical", value: criticalAssets, color: "red" },
            { label: "Operational", value: operationalAssets, color: "green" },
            { label: "In Fault", value: inFaultAssets, color: "yellow" },
          ]}
        />
      </PageHeader>
      <div className="flex gap-4">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-3 py-2 rounded bg-gray-100 ${
            categoryFilter === null ? "font-bold" : ""
          }`}
        >
          All
        </button>
        {["HVAC", "Electrical", "Plumbing", "Mechanical", "Elevator"].map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-3 py-2 rounded bg-gray-100 ${
              categoryFilter === category ? "font-bold" : ""
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <SectionCard title="Assets">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset: any) => (
            <a
              key={asset.id}
              href={`/maintenance/assets/${asset.id}`}
              className="block p-4 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <strong>{asset.name}</strong>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{asset.category}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{asset.criticality}</span>
              </div>
              <StatusBadge status={asset.status} />
              {asset.manufacturer && asset.model ? (
                <p>{`${asset.manufacturer} ${asset.model}`}</p>
              ) : null}
              <p className="truncate">{asset.location_description}</p>
            </a>
          ))
        ) : (
          <EmptyState message="No assets found" />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default AssetPage;
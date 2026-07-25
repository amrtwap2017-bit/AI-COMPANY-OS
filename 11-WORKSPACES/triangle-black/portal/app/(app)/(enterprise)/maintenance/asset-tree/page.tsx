// @ts-nocheck
"use client";

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
  if (!response.ok) return [];
  return response.json();
};

const fetchPMPlans = async (assetId: number) => {
  const response = await fetch(`${BACK}/api/v1/maintenance/pm-plans/${assetId}`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
};

const AssetTreePage = () => {
  const { data: assets, isLoading, isError } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
    refetchInterval: 120000,
  });

  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load assets" />;

  const categories = {
    HVAC: { count: 0, faultCount: 0, list: [] },
    Electrical: { count: 0, faultCount: 0, list: [] },
    Plumbing: { count: 0, faultCount: 0, list: [] },
    Mechanical: { count: 0, faultCount: 0, list: [] },
    Other: { count: 0, faultCount: 0, list: [] },
  };

  (assets || []).forEach(asset => {
    categories[asset.category].count++;
    if (asset.status === "In Fault") categories[asset.category].faultCount++;
    categories[asset.category].list.push(asset.name);
  });

  const totalAssets = Object.values(categories).reduce((acc: any, category: any) => acc + category.count, 0);
  const criticalAssets = (assets || []).filter(asset => asset.criticality === "Critical").length;
  const inFaultAssets = (assets || []).filter(asset => asset.status === "In Fault").length;

  return (
    <PageWrapper>
      <PageHeader title="Asset Hierarchy Tree" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Assets", value: totalAssets },
            { label: "Critical", value: criticalAssets },
            { label: "In Fault", value: inFaultAssets },
            { label: "With PM Plans", value: 0 }, // Placeholder for actual count
          ]}
        />
      </SectionCard>
      <div className="grid grid-cols-1 gap-4">
        {Object.keys(categories).map(category => (
          <div key={category} className="bg-white rounded-lg shadow-md p-4">
            <button
              onClick={() =>
                setExpandedCategories(prev =>
                  prev[category] ? { ...prev, [category]: false } : { ...prev, [category]: true }
                )
              }
              className="flex items-center justify-between w-full"
            >
              <span>{category}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-6 h-6 ${expandedCategories[category] ? "rotate-90" : ""}`}
              >
                <path d="M19.5 8.25a7.5 7.5 0 00-15 0 7.5 7.5 0 0015 0zM4.5 15.75a7.5 7.5 0 0115 0 7.5 7.5 0 01-15 0z" />
              </svg>
            </button>
            {expandedCategories[category] && (
              <ul className="mt-2">
                {(categories[category] || []).map(assetName => (
                  <li key={assetName} className="flex items-center justify-between py-1 border-b last:border-b-0">
                    <span>{assetName}</span>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={(assets || []).find(asset => asset.name === assetName)?.status || "Unknown"} />
                      <StatusBadge criticality={(assets || []).find(asset => asset.name === assetName)?.criticality || "Unknown"} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default AssetTreePage;
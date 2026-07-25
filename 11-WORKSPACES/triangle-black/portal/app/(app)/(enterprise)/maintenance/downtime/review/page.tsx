// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchWOs() {
  try {  
    const r = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? d.data ?? [];
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
}

async function fetchAssets() {
  try {  
    const r = await fetch(`${BACK}/api/v1/assets`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? d.data ?? [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

export default function DowntimeReviewPage() {
  const { data: wos = [], isLoading: woLoading } = useQuery({
    queryKey: ["downtime-wos"],
    queryFn: fetchWOs,
    refetchInterval: 300000,
  });
  const { data: assets = [], isLoading: assetLoading } = useQuery({
    queryKey: ["downtime-assets"],
    queryFn: fetchAssets,
    refetchInterval: 300000,
  });

  const isLoading = woLoading || assetLoading;

  return (
    <PageWrapper>
      {/* Your page content here */}
    </PageWrapper>
  );
}
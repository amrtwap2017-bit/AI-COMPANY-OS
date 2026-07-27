"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState, Progress
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchSummary() {
  try {  
    const r = await authFetch(`/api/v1/ai/analytics/costs/summary`).then(r => r.json());
    if (!r.ok) return {};
    return r.json();
  } catch (error) {
    console.error("Error fetching summary:", error);
    return {};
  }
}

async function fetchFull() {
  try {  
    const r = await authFetch(`/api/v1/ai/analytics/costs`).then(r => r.json());
    if (!r.ok) return { work_orders: [], contracts: [] };
    return r.json();
  } catch (error) {
    console.error("Error fetching full data:", error);
    return { work_orders: [], contracts: [] };
  }
}

async function fetchBOQ(type) {
  try {  
    const r = await authFetch(`/api/v1/ai/documents/boq/template?wo_type=${type}`).then(r => r.json());
    if (!r.ok) return null;
    return r.json();
  } catch (error) {
    console.error("Error fetching BOQ data:", error);
    return null;
  }
}

const BOQ_TYPES = ["hvac", "electrical", "plumbing", "general"];

export default function CostsPage() {
  const [boqType, setBoqType] = useState(null);
  const [boqData, setBOQData] = useState(null);
  const [loadingBOQ, setLoadingBOQ] = useState(false);

  const { data: summary = {}, isLoading: s1 } = useQuery({
    queryKey: ["costs-summary"], queryFn: fetchSummary, refetchInterval: 300000,
  });

  // Additional logic for CostsPage
}
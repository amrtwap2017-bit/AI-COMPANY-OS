"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";
import Link from "next/link";

const workOrders: any[] = [];
const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchContracts() {
  try {  
    const r = await authFetch(`/api/v1/contracts`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }
}

async function fetchInvoices() {
  try {  
    const r = await authFetch(`/api/v1/invoices`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

async function fetchWOs() {
  try {  
    const r = await authFetch(`/api/v1/work-orders`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
}

export default function CustomerDetailPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const name         = searchParams.get("name") || decodeURIComponent(String(params?.id || ""));

  const { data: contracts = [], isLoading: c1 } = useQuery({
    queryKey: ["contracts"],
    queryFn: fetchContracts,
  });

  const { data: invoices = [], isLoading: i1 } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });

  const { data: workOrders = [], isLoading: w1 } = useQuery({
    queryKey: ["work-orders"],
    queryFn: fetchWOs,
  });

  return (
    <PageWrapper>
      {/* Render your page content here */}
    </PageWrapper>
  );
}
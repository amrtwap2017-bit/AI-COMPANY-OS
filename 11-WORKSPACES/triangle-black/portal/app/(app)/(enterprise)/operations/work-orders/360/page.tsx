"use client"; // @ts-nocheck

import { useState } from "react";
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
    return Array.isArray(d) ? d : d.items ?? d.work_orders ?? [];
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
}

async function fetchTechs() {
  try {  
    const r = await fetch(`${BACK}/api/v1/technicians`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return [];
  }
}

async function fetchAssets() {
  try {  
    const r = await fetch(`${BACK}/api/v1/assets`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

export default function WO360Page() {
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [expanded, setExpanded] = useState(null);

  const { data: wos    = [], isLoading: w1 } = useQuery({ queryKey: ["wo360-wos"],    queryFn: fetchWOs,    refetchInterval: 60000 });
  const { data: techs  = [], isLoading: w2 } = useQuery({ queryKey: ["wo360-techs"],  queryFn: fetchTechs,  refetchInterval: 300000 });

  return (
    <PageWrapper>
      {/* Your component content here */}
    </PageWrapper>
  );
}
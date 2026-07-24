"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchSignals() {
  try {  
    const r = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
    if (!r.ok) return { signals: [] };
    return r.json();
  } catch (error) {
    console.error("Error fetching signals:", error);
    return { signals: [] };
  }
}

async function fetchPRs() {
  try {  
    const r = await fetch(`${BACK}/api/v1/purchase-requests/`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return [];
  }
}

async function fetchWOs() {
  try {  
    const r = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching WOs:", error);
    return [];
  }
}

const CATEGORY_LINKS = {
  operations: "/operations/workbench",
  maintenance: "/maintenance/intelligence",
  inventory: "/supply-chain/workbench",
  commercial: "/commercial/pipeline",
  resources: "/operations/dispatch",
};

// Rest of the file content...
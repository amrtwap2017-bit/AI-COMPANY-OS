// ARCHIVED: 2026-07-20
// This file had zero page imports and has been archived.
// Original content preserved below.

// @ts-nocheck
import { safeFetch, toList } from "./safe-api";

export const analyticsApi = {
  operationalKpis: async () => {
    const r = await safeFetch("/api/v1/analytics");
    const data = toList(r?.data || r);
    return { kpis: data.length ? data : [
      { label: "Work Orders",  value: "—", status: "neutral" },
      { label: "Technicians",  value: "—", status: "neutral" },
      { label: "Assets",       value: "—", status: "neutral" },
      { label: "SLA %",        value: "—", status: "neutral" },
    ]};
  },
  leads:    () => safeFetch("/api/v1/leads"),
  revenue:  () => safeFetch("/api/v1/analytics/revenue"),
};

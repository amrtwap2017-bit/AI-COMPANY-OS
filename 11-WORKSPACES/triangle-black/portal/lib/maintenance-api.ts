// @ts-nocheck
// Triangle Black - Maintenance API
// Wired to real TB Admin /api/v1/maintenance/* endpoints
import { tbFetch, toList } from "./api/tb-client";

export const maintenanceApi = {
  dashboard:    () => tbFetch("/api/v1/maintenance/dashboard"),
  pmPlans:      (p?: any) => tbFetch("/api/v1/maintenance/pm-plans", { params: p }),
  workItems:    (p?: any) => tbFetch("/api/v1/maintenance/work-items", { params: p }),
  schedule:     () => tbFetch("/api/v1/maintenance/schedule"),
  assetTree:    () => tbFetch("/api/v1/maintenance/asset-tree"),
  intelligence: () => tbFetch("/api/v1/maintenance/intelligence"),
  actions:      () => tbFetch("/api/v1/maintenance/actions"),
  costs:        () => tbFetch("/api/v1/maintenance/costs"),
  downtime:     () => tbFetch("/api/v1/maintenance/downtime"),
  // Legacy alias
  sections:     () => tbFetch("/api/v1/maintenance/pm-plans"),
};

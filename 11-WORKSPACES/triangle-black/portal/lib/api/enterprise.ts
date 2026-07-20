"use client";
// Triangle Black - Enterprise Domain APIs
// All wired to real PostgreSQL via TB Admin
import { tbFetch, toList } from "./tb-client";

// ── Maintenance ───────────────────────────────────────────────
export const maintenanceApi = {
  dashboard:    () => tbFetch("/api/v1/maintenance/dashboard"),
  pmPlans:      (params?: any) => tbFetch("/api/v1/maintenance/pm-plans", { params }),
  workItems:    (params?: any) => tbFetch("/api/v1/maintenance/work-items", { params }),
  schedule:     () => tbFetch("/api/v1/maintenance/schedule"),
  assetTree:    (hotelId?: string) => tbFetch("/api/v1/maintenance/asset-tree", { params: hotelId ? { hotel_id: hotelId } : {} }),
  intelligence: () => tbFetch("/api/v1/maintenance/intelligence"),
  actions:      () => tbFetch("/api/v1/maintenance/actions"),
  costs:        () => tbFetch("/api/v1/maintenance/costs"),
  downtime:     () => tbFetch("/api/v1/maintenance/downtime"),
};

// ── Executive Intelligence ────────────────────────────────────
export const executiveApi = {
  dashboard:    () => tbFetch("/api/v1/actions/executive/dashboard"),
  intelligence: () => tbFetch("/api/v1/actions/executive/intelligence"),
  portfolio:    () => tbFetch("/api/v1/actions/executive/portfolio"),
  risks:        () => tbFetch("/api/v1/actions/executive/risks"),
  exceptions:   () => tbFetch("/api/v1/actions/executive/exceptions"),
  dailyReview:  () => tbFetch("/api/v1/actions/executive/daily-review"),
  alerts:       () => tbFetch("/api/v1/actions/executive/alerts/predictive"),
  // Legacy alias used by workspace page
  ceoDashboard: () => tbFetch("/api/v1/actions/executive/dashboard"),
  predictiveAlerts: () => tbFetch("/api/v1/actions/executive/alerts/predictive"),
};

// ── Analytics Platform ────────────────────────────────────────
export const analyticsApi = {
  kpis:       () => tbFetch("/api/v1/analytics/kpis"),
  scorecards: () => tbFetch("/api/v1/analytics/scorecards"),
  sla:        () => tbFetch("/api/v1/analytics/sla"),
  trends:     () => tbFetch("/api/v1/analytics/trends"),
};

// ── Approvals ─────────────────────────────────────────────────
export const approvalsApi = {
  queue:   () => tbFetch("/api/v1/approvals/"),
  count:   () => tbFetch("/api/v1/approvals/count"),
  approve: (id: string, type: string) =>
    tbFetch(`/api/v1/approvals/${id}/approve?approval_type=${type}`, { method: "POST" }),
  reject:  (id: string, type: string) =>
    tbFetch(`/api/v1/approvals/${id}/reject?approval_type=${type}`, { method: "POST" }),
};

// ── Customer Success ──────────────────────────────────────────
export const customerSuccessApi = {
  list:    (params?: any) => tbFetch("/api/v1/customers/", { params }),
  view360: () => tbFetch("/api/v1/customers/360"),
  review:  () => tbFetch("/api/v1/customers/review"),
};

// ── Projects Center ───────────────────────────────────────────
export const projectsApi = {
  list:         (params?: any) => tbFetch("/api/v1/projects/", { params }),
  dashboard:    () => tbFetch("/api/v1/projects/dashboard"),
  get:          (id: string) => tbFetch(`/api/v1/projects/${id}`),
  phases:       (id: string) => tbFetch(`/api/v1/projects/${id}/phases`),
  risks:        (id: string) => tbFetch(`/api/v1/projects/${id}/risks`),
  milestones:   (id: string) => tbFetch(`/api/v1/projects/${id}/milestones`),
  intelligence: () => tbFetch("/api/v1/projects/intelligence/summary"),
  create:       (data: any) => tbFetch("/api/v1/projects/", { method: "POST", body: data }),
};

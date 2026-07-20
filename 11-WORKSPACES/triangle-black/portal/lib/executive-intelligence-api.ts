// @ts-nocheck
// Triangle Black - Executive Intelligence API
// All wired to real TB Admin endpoints
import { tbFetch } from "./api/tb-client";

export const executiveIntelligenceApi = {
  ceoDashboard:     () => tbFetch("/api/v1/actions/executive/dashboard"),
  intelligence:     () => tbFetch("/api/v1/actions/executive/intelligence"),
  portfolio:        () => tbFetch("/api/v1/actions/executive/portfolio"),
  risks:            () => tbFetch("/api/v1/actions/executive/risks"),
  exceptions:       () => tbFetch("/api/v1/actions/executive/exceptions"),
  dailyReview:      () => tbFetch("/api/v1/actions/executive/daily-review"),
  predictiveAlerts: () => tbFetch("/api/v1/actions/executive/alerts/predictive"),
  // Analytics
  kpis:         () => tbFetch("/api/v1/analytics/kpis"),
  scorecards:   () => tbFetch("/api/v1/analytics/scorecards"),
  sla:          () => tbFetch("/api/v1/analytics/sla"),
  trends:       () => tbFetch("/api/v1/analytics/trends"),
};

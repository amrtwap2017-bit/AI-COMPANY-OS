import { api } from "./api/client";

export const executiveIntelligenceApi = {
  ceoDashboard: () => api.get("/executive-intelligence/ceo/dashboard"),
  cooDashboard: () => api.get("/executive-intelligence/coo/dashboard"),
  renewalIntelligence: () => api.get("/executive-intelligence/renewals/intelligence"),
  predictiveAlerts: () => api.get("/executive-intelligence/alerts/predictive"),
  dailyBriefing: () => api.get("/executive-intelligence/ai/daily-briefing"),
  portfolioOverview: () => api.get("/executive-intelligence/portfolio/overview"),
  kpis: () => api.get("/executive-intelligence/kpis"),
  watchlists: () => api.get("/executive-intelligence/watchlists"),
};

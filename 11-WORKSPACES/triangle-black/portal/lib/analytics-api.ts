// @ts-nocheck
import { api } from "./api/client";

export const analyticsApi = {
  executiveSummary: () => api.get("/analytics/executive/summary"),
  allKpis: () => api.get("/analytics/kpis/all"),
  financialKpis: () => api.get("/analytics/kpis/financial"),
  commercialKpis: () => api.get("/analytics/kpis/commercial"),
  engineeringKpis: () => api.get("/analytics/kpis/engineering"),
  maintenanceKpis: () => api.get("/analytics/kpis/maintenance"),
  procurementKpis: () => api.get("/analytics/kpis/procurement"),
  customerKpis: () => api.get("/analytics/kpis/customers"),
  operationalKpis: () => api.get("/analytics/kpis/operational"),
  revenueTrend: (months = 6) =>
    api.get("/analytics/trends/revenue", { params: { months } }),
  procurementTrend: (months = 6) =>
    api.get("/analytics/trends/procurement", { params: { months } }),
};

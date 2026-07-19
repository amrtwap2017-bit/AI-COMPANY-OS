import { api } from "./api/client";

export const procurementIntelligenceApi = {
  spendSummary: () => api.get("/procurement-intelligence/spend/summary"),
  spendByCategory: () => api.get("/procurement-intelligence/spend/by-category"),
  spendBySupplier: (limit = 10) =>
    api.get("/procurement-intelligence/spend/by-supplier", { params: { limit } }),
  spendTrend: (months = 6) =>
    api.get("/procurement-intelligence/spend/trend", { params: { months } }),
  supplierIntelligence: () => api.get("/procurement-intelligence/suppliers/intelligence"),
  supplierScore: (supplierId: string) =>
    api.get(`/procurement-intelligence/suppliers/${supplierId}/score`),
  rfqRecommendations: (category = "all") =>
    api.get("/procurement-intelligence/rfq/recommendations", { params: { category } }),
  priceBenchmark: (category = "MEP") =>
    api.get("/procurement-intelligence/rfq/price-benchmark", { params: { category } }),
  kpis: () => api.get("/procurement-intelligence/kpis"),
};

// @ts-nocheck
import { safeFetch } from "./safe-api";

export const executiveIntelligenceApi = {
  watchlists:  () => safeFetch("/api/v1/watchlists"),
  kpis:        () => safeFetch("/api/v1/analytics"),
  risks:       () => safeFetch("/api/v1/risks"),
  portfolio:   () => safeFetch("/api/v1/projects"),
  intelligence:() => safeFetch("/api/v1/analytics/intelligence"),
};

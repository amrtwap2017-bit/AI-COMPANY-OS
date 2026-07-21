import { tbFetch } from "./tb-client";

export const reportsApi = {
  async dashboard() {
    return tbFetch("/api/v1/actions/reports/dashboard");
  },

  async agentLeaderboard() {
    return tbFetch("/api/v1/actions/reports/agent-leaderboard");
  },

  async serviceOps() {
    return tbFetch("/api/v1/actions/dashboard/service-ops");
  },

  async stats() {
    return tbFetch("/api/v1/actions/dashboard/stats");
  },
};

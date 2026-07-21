import { tbFetch, toList } from "./tb-client";

export const dashboardApi = {
  async getStats() {
    const [stats, pipeline, serviceOps] = await Promise.all([
      tbFetch("/api/v1/actions/dashboard/stats"),
      tbFetch("/api/v1/actions/pipeline/summary"),
      tbFetch("/api/v1/actions/dashboard/service-ops"),
    ]);
    const s = stats.data || {};
    const p = pipeline.data || {};
    const o = serviceOps.data || {};
    return {
      leads: {
        total:       p.total_leads        || s.total_leads        || 0,
        new:         p.new_leads          || s.new_leads          || 0,
        qualified:   p.qualified_leads    || s.qualified_leads    || 0,
        negotiation: p.negotiation_leads  || s.negotiation_leads  || 0,
        won:         p.won_leads          || s.won_leads          || 0,
      },
      workOrders: {
        total:      o.total_work_orders   || s.total_work_orders  || 0,
        open:       o.open_work_orders    || s.open_work_orders   || 0,
        inProgress: o.in_progress_wos    || s.in_progress_wos    || 0,
        completed:  o.completed_wos      || s.completed_wos      || 0,
        critical:   o.critical_wos       || s.critical_wos       || 0,
      },
      technicians: {
        total:  s.total_technicians  || 0,
        active: s.active_technicians || 0,
      },
      inventory: {
        lowStock:  s.low_stock_items  || 0,
        total:     s.total_items      || 0,
      },
    };
  },

  async getAgentLeaderboard() {
    return tbFetch("/api/v1/actions/reports/agent-leaderboard");
  },

  async getReportDashboard() {
    return tbFetch("/api/v1/actions/reports/dashboard");
  },
};

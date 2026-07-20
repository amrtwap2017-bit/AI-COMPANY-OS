"use client";
// @ts-nocheck

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tb_access_token") || "";
}

async function tbFetch(path: string) {
  const token = getToken();
  const h: any = {};
  if (token) h["Authorization"] = `Bearer ${token}`;
  try {
    const r = await fetch(API_URL + path, { headers: h, cache: "no-store" });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

function toList(d: any): any[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.results)) return d.results;
  return [];
}

export const dashboardApi = {
  async getStats() {
    const [stats, pipeline] = await Promise.all([
      tbFetch("/api/v1/actions/dashboard/stats"),
      tbFetch("/api/v1/actions/pipeline/summary"),
    ]);

    const leads = pipeline || stats || {};
    return {
      leads: {
        total:       leads.total_leads        || leads.total        || 0,
        new:         leads.new_leads          || leads.new          || 0,
        qualified:   leads.qualified_leads    || leads.qualified    || 0,
        negotiation: leads.negotiation_leads  || leads.negotiation  || 0,
        won:         leads.won_leads          || leads.won          || 0,
      },
      workOrders: {
        total:       stats?.total_work_orders || 0,
        open:        stats?.open_work_orders  || 0,
        inProgress:  stats?.in_progress_wos  || 0,
        completed:   stats?.completed_wos    || 0,
        critical:    stats?.critical_wos     || 0,
      },
      technicians: {
        total:  stats?.total_technicians  || 0,
        active: stats?.active_technicians || 0,
      },
      assets: {
        total: stats?.total_assets || 0,
      },
    };
  },

  async getKPIs() {
    const stats = await this.getStats();
    return [
      { label: "Total Leads",       value: String(stats.leads.total),       sub: stats.leads.qualified + " qualified",   color: "blue"    as const },
      { label: "Open Work Orders",  value: String(stats.workOrders.open),   sub: stats.workOrders.critical + " critical",color: stats.workOrders.critical>0?"red":"amber" as const },
      { label: "Active Technicians",value: String(stats.technicians.active),sub: "of " + stats.technicians.total,        color: "emerald" as const },
      { label: "Assets Tracked",    value: String(stats.assets.total),      sub: "in system",                            color: "slate"   as const },
    ];
  },

  async getRecentLeads(limit = 5) {
    const d = await tbFetch("/api/v1/actions/leads/search");
    return toList(d).slice(0, limit);
  },

  async getRecentWorkOrders(limit = 5) {
    const d = await tbFetch("/api/v1/actions/dashboard/service-ops");
    return toList(d?.work_orders || d).slice(0, limit);
  },
};

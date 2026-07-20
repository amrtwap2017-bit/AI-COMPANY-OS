// @ts-nocheck
// Analytics API — real data from TB Admin

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchApi(path: string) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("tb_access_token")  
    : null;
  try {
    const res = await fetch(API_URL + path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const dashboardApi = {
  async getStats() {
    const [leads, wos, techs, assets] = await Promise.all([
      fetchApi("/api/v1/leads"),
      fetchApi("/api/v1/work-orders"),
      fetchApi("/api/v1/technicians"),
      fetchApi("/api/v1/assets"),
    ]);

    const leadsData   = Array.isArray(leads)   ? leads   : leads?.items   || leads?.data   || [];
    const wosData     = Array.isArray(wos)     ? wos     : wos?.items     || wos?.data     || [];
    const techsData   = Array.isArray(techs)   ? techs   : techs?.items   || techs?.data   || [];
    const assetsData  = Array.isArray(assets)  ? assets  : assets?.items  || assets?.data  || [];

    return {
      leads: {
        total:       leadsData.length,
        new:         leadsData.filter((l: any) => l.status === "new").length,
        qualified:   leadsData.filter((l: any) => l.status === "qualified").length,
        negotiation: leadsData.filter((l: any) => l.status === "negotiation").length,
        won:         leadsData.filter((l: any) => l.status === "won").length,
      },
      workOrders: {
        total:       wosData.length,
        open:        wosData.filter((w: any) => w.status === "open").length,
        inProgress:  wosData.filter((w: any) => w.status === "in_progress").length,
        completed:   wosData.filter((w: any) => w.status === "completed").length,
        critical:    wosData.filter((w: any) => w.priority === "critical" || w.priority === "emergency").length,
      },
      technicians: {
        total:  techsData.length,
        active: techsData.filter((t: any) => t.is_active).length,
      },
      assets: {
        total: assetsData.length,
      },
    };
  },

  async getRecentLeads(limit = 5) {
    const data = await fetchApi("/api/v1/leads?limit=" + limit);
    const items = Array.isArray(data) ? data : data?.items || data?.data || [];
    return items.slice(0, limit);
  },

  async getRecentWorkOrders(limit = 5) {
    const data = await fetchApi("/api/v1/work-orders?limit=" + limit);
    const items = Array.isArray(data) ? data : data?.items || data?.data || [];
    return items.slice(0, limit);
  },

  async getKPIs() {
    const stats = await this.getStats();
    return [
      {
        label: "Total Leads",
        value: stats.leads.total.toString(),
        sub:   stats.leads.qualified + " qualified",
        color: "blue" as const,
      },
      {
        label: "Open Work Orders",
        value: stats.workOrders.open.toString(),
        sub:   stats.workOrders.critical + " critical",
        color: stats.workOrders.critical > 0 ? "red" as const : "amber" as const,
      },
      {
        label: "Active Technicians",
        value: stats.technicians.active.toString(),
        sub:   "of " + stats.technicians.total + " total",
        color: "emerald" as const,
      },
      {
        label: "Assets Tracked",
        value: stats.assets.total.toString(),
        sub:   "in system",
        color: "slate" as const,
      },
    ];
  },
};

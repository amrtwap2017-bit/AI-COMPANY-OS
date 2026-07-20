# E3 — Dashboard Live Data: Replace Mock with Real API
import os, json, datetime, glob

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/e3.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'fixed':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('E3 START — Dashboard Live Data')

# Create analytics API module
analytics_api = '''// @ts-nocheck
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
'''
write(PORTAL+'/lib/dashboard-api.ts', analytics_api, 'lib/dashboard-api.ts')

# Create improved dashboard page
dashboard_page = '''// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardApi } from "@/lib/dashboard-api";
import { PageHeader, MetricStrip, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import {
  Users, Wrench, UserCheck, Package,
  ArrowRight, TrendingUp, AlertTriangle, RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [kpis, setKpis]   = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [wos, setWos]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, leadsData, wosData] = await Promise.all([
        dashboardApi.getKPIs(),
        dashboardApi.getRecentLeads(5),
        dashboardApi.getRecentWorkOrders(5),
      ]);
      setKpis(kpiData);
      setLeads(leadsData);
      setWos(wosData);
      setLastUpdate(new Date());
    } catch (e) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const statusColor = (s: string) => ({
    new:         "bg-purple-100 text-purple-700",
    qualified:   "bg-blue-100 text-blue-700",
    negotiation: "bg-amber-100 text-amber-700",
    won:         "bg-emerald-100 text-emerald-700",
    open:        "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed:   "bg-emerald-100 text-emerald-700",
    high:        "bg-red-100 text-red-700",
    critical:    "bg-red-100 text-red-700",
  }[s] || "bg-slate-100 text-slate-700");

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Dashboard"
        subtitle={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
        badge="LIVE"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {error && <AlertBanner type="error" title={error} />}

      {loading && !kpis.length ? (
        <LoadingState type="cards" rows={4} cols={4} />
      ) : (
        <MetricStrip metrics={kpis} cols={4} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Leads</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest from pipeline</p>
            </div>
            <Link href="/leads" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {leads.length === 0 ? (
            <EmptyState icon="📋" title="No leads yet" description="Add leads to see them here" />
          ) : (
            <div className="space-y-2">
              {leads.map((lead: any, i: number) => (
                <Link key={lead.id || i} href={`/leads/${lead.id}`} className="block group">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-slate-900 group-hover:text-amber-700">{lead.company_name || lead.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{lead.contact_name} · {lead.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Work Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Active Work Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Current engineering tasks</p>
            </div>
            <Link href="/work-orders" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {wos.length === 0 ? (
            <EmptyState icon="🔧" title="No work orders" description="Create work orders to see them here" />
          ) : (
            <div className="space-y-2">
              {wos.map((wo: any, i: number) => (
                <Link key={wo.id || i} href={`/work-orders/${wo.id}`} className="block group">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 group-hover:text-amber-700 truncate">{wo.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{wo.category || wo.type} · {wo.location || wo.site || "—"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(wo.priority)}`}>
                        {wo.priority}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(wo.status)}`}>
                        {wo.status?.replace("_"," ")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New Work Order", href: "/operations/work-orders/new", icon: Wrench, color: "amber" },
          { label: "Add Lead", href: "/leads/new", icon: TrendingUp, color: "blue" },
          { label: "Technicians", href: "/technicians", icon: UserCheck, color: "emerald" },
          { label: "Assets", href: "/assets", icon: Package, color: "slate" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group"
            >
              <Icon className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
'''
write(PORTAL+'/app/(app)/dashboard/page.tsx', dashboard_page, 'dashboard/page.tsx (live data)')

log('='*40)
log('E3 COMPLETE — Created: '+str(len(results['created'])))
for c in results['created']: log('  OK '+c)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/e3_result.json','w') as f:
    json.dump(results,f,indent=2)
"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, usersApi, agentsApi, contractsApi } from "@/lib/api";
import { formatEGP } from "@/lib/utils";
import {
  Users, UserCheck, FileCheck, TrendingUp,
  Activity, Shield,
} from "lucide-react";

function Stat({ label, value, sub, icon: Icon, color = "text-[#1e1b4b]" }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#7C3AED]" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: dash } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => dashboardApi.summary().then((r) => r.data),
    refetchInterval: 30000,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => usersApi.list().then((r) => r.data),
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => agentsApi.list().then((r) => r.data),
  });
  const { data: contracts = [] } = useQuery({
    queryKey: ["admin-contracts"],
    queryFn: () => contractsApi.list().then((r) => r.data),
  });

  const activeContracts = (contracts as { status: string; total_value: number }[])
    .filter((c) => ["active","renewed"].includes(c.status));
  const contractValue = activeContracts.reduce((s, c) => s + c.total_value, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-[#7C3AED]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-500 text-sm">{dash?.period || "Loading..."}</p>
        </div>
      </div>

      {/* KPIs */}
      <section aria-label="System KPIs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Platform Users" value={(users as unknown[]).length}
            sub="All roles" icon={Users} />
          <Stat label="Active Agents" value={(agents as { is_active: boolean }[]).filter(a => a.is_active).length}
            sub={`${(agents as unknown[]).length} total`} icon={UserCheck} color="text-green-600" />
          <Stat label="Active Contracts" value={activeContracts.length}
            sub={formatEGP(contractValue)} icon={FileCheck} color="text-blue-600" />
          <Stat label="Revenue Pipeline"
            value={dash ? formatEGP(dash.revenue_pipeline) : "—"}
            sub={`${dash?.leads?.total || 0} leads`} icon={TrendingUp} color="text-[#7C3AED]" />
        </div>
      </section>

      {/* Lead breakdown */}
      {dash && (
        <section aria-label="Lead breakdown">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#7C3AED]" /> Lead Status
              </h2>
              <div className="space-y-3">
                {Object.entries(dash.leads.by_status as Record<string, number>).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-100 rounded-full h-2"
                        role="progressbar"
                        aria-valuenow={count}
                        aria-valuemax={dash.leads.total}>
                        <div className="h-2 rounded-full bg-[#7C3AED]"
                          style={{ width: `${dash.leads.total ? (count / dash.leads.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Agent Capacity</h2>
              <div className="space-y-3">
                {Object.entries(dash.agents.capacity as Record<string, { current: number; max: number }>)
                  .map(([name, cap]) => {
                    const pct = cap.max ? Math.round((cap.current / cap.max) * 100) : 0;
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{name.split(" ")[0]}</span>
                          <span className="text-gray-500">{cap.current}/{cap.max}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2"
                          role="progressbar" aria-valuenow={cap.current} aria-valuemax={cap.max}>
                          <div className={`h-2 rounded-full ${pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick stats table */}
      <section>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Platform Summary</h2>
          </div>
          <table className="w-full text-sm" aria-label="Platform summary">
            <tbody className="divide-y divide-gray-50">
              {[
                ["Total Leads", dash?.leads?.total ?? "—", "All captured leads"],
                ["This Month", dash?.leads?.this_month ?? "—", "Leads captured this month"],
                ["Quotes Total", dash?.quotes?.total ?? "—", `EGP ${dash?.quotes?.total_value?.toLocaleString() ?? 0}`],
                ["Conversion Rate", dash ? `${(dash.conversion_rate * 100).toFixed(1)}%` : "—", "Leads converted to contracts"],
                ["Active Agents", dash?.agents?.active ?? "—", `of ${dash?.agents?.total ?? 0} total`],
              ].map(([label, value, detail]) => (
                <tr key={String(label)} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-700">{label}</td>
                  <td className="px-6 py-3 font-bold text-[#1e1b4b]">{value}</td>
                  <td className="px-6 py-3 text-gray-400">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

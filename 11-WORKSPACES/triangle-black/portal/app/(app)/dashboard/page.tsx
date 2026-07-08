"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Card, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { formatEGP } from "@/lib/utils";
import { LEAD_STATUS_CONFIG, QUOTE_STATUS_CONFIG } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, FileText, TrendingUp, UserCheck, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Dashboard } from "@/lib/types";

const PIE_COLORS = ["#6B7280","#3B82F6","#F59E0B","#10B981","#EF4444"];

function KPICard({ title, value, subtitle, icon: Icon, color = "text-[#1B2B4B]" }: {
  title: string; value: string; subtitle?: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.summary().then((r) => r.data as Dashboard),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load dashboard. Please refresh.
      </div>
    );
  }

  const leadStatusData = Object.entries(data.leads.by_status).map(([k, v]) => ({
    name: LEAD_STATUS_CONFIG[k as keyof typeof LEAD_STATUS_CONFIG]?.label || k,
    value: v,
  }));

  const quoteStatusData = Object.entries(data.quotes.by_status).map(([k, v]) => ({
    name: QUOTE_STATUS_CONFIG[k as keyof typeof QUOTE_STATUS_CONFIG]?.label || k,
    value: v,
  }));

  const agentData = Object.entries(data.agents.capacity).map(([name, cap]) => ({
    name: name.split(" ")[0],
    current: cap.current,
    available: cap.available,
    max: cap.max,
  }));

  return (
    <div className="space-y-8" aria-label="Dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">{data.period} — Operations Overview</p>
      </div>

      {/* KPI Cards */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Leads"
            value={String(data.leads.total)}
            subtitle={`${data.leads.this_month} this month`}
            icon={Users}
          />
          <KPICard
            title="Revenue Pipeline"
            value={formatEGP(data.revenue_pipeline)}
            subtitle="All active quotes"
            icon={TrendingUp}
            color="text-green-600"
          />
          <KPICard
            title="Approved Contracts"
            value={formatEGP(data.quotes.approved_value)}
            subtitle={`${data.quotes.by_status.approved || 0} contracts`}
            icon={FileText}
            color="text-[#1B2B4B]"
          />
          <KPICard
            title="Conversion Rate"
            value={`${(data.conversion_rate * 100).toFixed(1)}%`}
            subtitle={`${data.agents.active} active agents`}
            icon={UserCheck}
            color="text-amber-600"
          />
        </div>
      </section>

      {/* Charts Row */}
      <section aria-label="Charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader title="Lead Pipeline" subtitle="Leads by status" />
          <div role="img" aria-label="Bar chart showing leads by status">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadStatusData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v} leads`, "Count"]} />
                <Bar dataKey="value" fill="#1B2B4B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quote Status */}
        <Card>
          <CardHeader title="Quote Status" subtitle="By stage" />
          <div role="img" aria-label="Pie chart showing quotes by status">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={quoteStatusData}
                  cx="50%" cy="45%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {quoteStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Agent Capacity */}
      <section aria-label="Agent workload">
        <Card>
          <CardHeader title="Agent Capacity" subtitle="Current lead assignments" />
          <div className="space-y-3">
            {agentData.map((agent) => {
              const pct = Math.round((agent.current / agent.max) * 100);
              const color = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500";
              return (
                <div key={agent.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{agent.name}</span>
                    <span className="text-gray-500">{agent.current}/{agent.max} leads</span>
                  </div>
                  <div
                    className="w-full bg-gray-100 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={agent.current}
                    aria-valuemin={0}
                    aria-valuemax={agent.max}
                    aria-label={`${agent.name}: ${agent.current} of ${agent.max} leads`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all ${color}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Lead Status Summary */}
      <section aria-label="Lead status summary">
        <Card>
          <CardHeader title="Lead Status Breakdown" />
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.leads.by_status).map(([status, count]) => {
              const cfg = LEAD_STATUS_CONFIG[status as keyof typeof LEAD_STATUS_CONFIG];
              return (
                <div key={status} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <Badge color={cfg?.color} bg={cfg?.bg}>{cfg?.label || status}</Badge>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}

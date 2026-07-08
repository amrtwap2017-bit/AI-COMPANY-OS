"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Card, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { formatEGP } from "@/lib/utils";
import { LEAD_STATUS_CONFIG, QUOTE_STATUS_CONFIG } from "@/lib/utils";
import { Dashboard } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.summary().then((r) => r.data as Dashboard),
    refetchInterval: 60000,
  });

  if (isLoading) return (
    <div role="status" className="text-center py-12 text-gray-400">
      Loading reports...
    </div>
  );
  if (!data) return null;

  const leadData = Object.entries(data.leads.by_status).map(([k, v]) => ({
    name: LEAD_STATUS_CONFIG[k as keyof typeof LEAD_STATUS_CONFIG]?.label || k,
    count: v,
  }));

  const sourceData = Object.entries(data.leads.by_source).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    count: v,
  }));

  const quoteValueData = Object.entries(data.quotes.by_status).map(([k, v]) => ({
    name: QUOTE_STATUS_CONFIG[k as keyof typeof QUOTE_STATUS_CONFIG]?.label || k,
    count: v,
  }));

  const convPct = (data.conversion_rate * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Reports</h1>
        <p className="text-gray-500 mt-1">{data.period}</p>
      </div>

      {/* Revenue Summary */}
      <section aria-label="Revenue summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Pipeline", value: formatEGP(data.revenue_pipeline), icon: TrendingUp, color: "text-green-600" },
            { label: "Approved Revenue", value: formatEGP(data.quotes.approved_value), icon: TrendingUp, color: "text-[#1B2B4B]" },
            { label: "Pending (Sent)", value: formatEGP(data.quotes.total_value - data.quotes.approved_value), icon: Minus, color: "text-amber-600" },
          ].map((item) => (
            <Card key={item.label}>
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <div className="flex items-end gap-2">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <item.icon className={`w-5 h-5 mb-0.5 ${item.color}`} aria-hidden="true" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Lead analysis charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Leads by Status" subtitle="Current pipeline breakdown" />
          <div role="img" aria-label="Bar chart: leads by status">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B2B4B" radius={[4,4,0,0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Lead Sources" subtitle="Where leads come from" />
          <div role="img" aria-label="Bar chart: leads by source">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[4,4,0,0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Key Metrics Table */}
      <section aria-label="Key metrics">
        <Card>
          <CardHeader title="Key Performance Indicators" subtitle={data.period} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="KPI table">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Metric","Value","Details"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="px-4 py-3 font-medium">Total Leads</td>
                  <td className="px-4 py-3 font-bold text-[#1B2B4B]">{data.leads.total}</td>
                  <td className="px-4 py-3 text-gray-500">{data.leads.this_month} this month</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Conversion Rate</td>
                  <td className="px-4 py-3 font-bold text-green-600">{convPct}%</td>
                  <td className="px-4 py-3 text-gray-500">{data.leads.by_status.converted || 0} converted leads</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Revenue Pipeline</td>
                  <td className="px-4 py-3 font-bold text-[#1B2B4B]">{formatEGP(data.revenue_pipeline)}</td>
                  <td className="px-4 py-3 text-gray-500">{data.quotes.total} total quotes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Approved Contracts</td>
                  <td className="px-4 py-3 font-bold text-green-600">{formatEGP(data.quotes.approved_value)}</td>
                  <td className="px-4 py-3 text-gray-500">{data.quotes.by_status.approved || 0} contracts</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Active Agents</td>
                  <td className="px-4 py-3 font-bold text-[#1B2B4B]">{data.agents.active}</td>
                  <td className="px-4 py-3 text-gray-500">{data.agents.total} total agents</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Agent Performance */}
      <section aria-label="Agent capacity">
        <Card>
          <CardHeader title="Agent Workload" />
          <div className="space-y-4">
            {Object.entries(data.agents.capacity).map(([name, cap]) => {
              const pct = Math.round((cap.current / cap.max) * 100);
              const color = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500";
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-800">{name}</span>
                    <span className="text-gray-500">{cap.current}/{cap.max} leads · {cap.available} available</span>
                  </div>
                  <div
                    className="w-full bg-gray-100 rounded-full h-2.5"
                    role="progressbar"
                    aria-valuenow={cap.current}
                    aria-valuemin={0}
                    aria-valuemax={cap.max}
                    aria-label={`${name}: ${pct}% capacity`}
                  >
                    <div className={`h-2.5 rounded-full ${color} transition-all`}
                      style={{ width: `${Math.min(pct,100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}

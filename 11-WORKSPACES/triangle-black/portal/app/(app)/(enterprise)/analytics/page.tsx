// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader, Button, SectionCard } from "@/components/ui";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  Wrench, ShoppingCart, Users, FileText, 
  RefreshCw, Calendar, Download, ArrowUpRight, ArrowRight,
  BarChart3, PieChart, Zap, Target, Clock, AlertTriangle, CheckCircle2
, CheckCircle } from "lucide-react";

function Sparkline({ data, color = "amber", height = 40 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(" ");
  const colorMap: Record<string, string> = { amber: "#f59e0b", emerald: "#10b981", blue: "#3b82f6", red: "#ef4444", purple: "#8b5cf6" };
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={colorMap[color]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4)} r="3" fill={colorMap[color]} />
    </svg>
  );
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");

  // Comprehensive, Interconnected Data Architecture
  const tabData: Record<string, any> = {
    overview: {
      title: "Business Overview",
      kpis: [
        { label: "Total Revenue", value: 2450000, trend: 12.5, category: "financial", sparkline: [180, 195, 210, 205, 220, 235, 245], link: "/commercial/invoices" },
        { label: "Active Projects", value: 12, trend: 8.3, category: "operations", sparkline: [8, 9, 10, 11, 11, 12, 12], link: "/projects-center" },
        { label: "SLA Compliance", value: 96.8, trend: 2.1, category: "operations", sparkline: [94, 95, 95, 96, 96, 97, 96.8], link: "/operations/workbench" },
        { label: "Avg. Approval Time", value: 4.2, trend: -15, category: "operations", sparkline: [5.5, 5.2, 4.8, 4.5, 4.3, 4.2, 4.2], link: "/analytics/workflow", suffix: "h" }
      ],
      deepDive: [
        { title: "Operations Health", icon: Wrench, color: "blue", link: "/operations", metrics: [{ l: "Open Work Orders", v: "45", link: "/operations/work-orders" }, { l: "Avg. Response Time", v: "14m", link: "/operations/workbench" }, { l: "PM Completion", v: "92%", link: "/maintenance/schedule" }] },
        { title: "Workflow & Approvals", icon: CheckCircle, color: "emerald", link: "/analytics/workflow", metrics: [{ l: "Avg. Turnaround", v: "4.2h", link: "/analytics/workflow" }, { l: "Pending Actions", v: "5", link: "/analytics/workflow" }, { l: "SLA Breach Risk", v: "0", link: "/analytics/workflow" }] },
        { title: "Field Technicians", icon: Users, color: "purple", link: "/operations/technicians", metrics: [{ l: "Techs On Duty", v: "18", link: "/operations/technicians" }, { l: "Jobs Completed Today", v: "42", link: "/operations/technicians" }, { l: "Avg. Rating", v: "4.8★", link: "/operations/technicians" }] },
        { title: "Commercial Pipeline", icon: DollarSign, color: "emerald", link: "/commercial", metrics: [{ l: "Win Rate", v: "25.7%", link: "/commercial/pipeline" }, { l: "Avg. Deal Size", v: fmtCurrency(179000), link: "/commercial/proposals" }, { l: "Active Proposals", v: "24", link: "/commercial/proposals" }] },
        { title: "Supply Chain Status", icon: ShoppingCart, color: "amber", link: "/supply-chain", metrics: [{ l: "Pending POs", v: "12", link: "/supply-chain/purchase-orders" }, { l: "Low Stock Alerts", v: "4", link: "/supply-chain/inventory" }, { l: "Unmatched Invoices", v: "2", link: "/supply-chain/supplier-invoices" }] }
      ]
    },
    operations: {
      title: "Operations & Maintenance Deep Dive",
      kpis: [
        { label: "Open Work Orders", value: 45, trend: -5.2, category: "operations", sparkline: [52, 50, 48, 47, 46, 45, 45], link: "/operations/work-orders" },
        { label: "Avg. Approval Time", value: 4.2, trend: -15, category: "operations", sparkline: [5.5, 5.2, 4.8, 4.5, 4.3, 4.2, 4.2], link: "/analytics/workflow", suffix: "h" },
        { label: "PM Completion Rate", value: 92, trend: 4.5, category: "operations", sparkline: [85, 87, 88, 90, 91, 92, 92], link: "/maintenance/schedule" },
        { label: "Workflow Efficiency", value: 98, trend: 3.1, category: "operations", sparkline: [94, 95, 96, 96, 97, 98, 98], link: "/analytics/workflow", suffix: "%" }
      ],
      deepDive: [
        { title: "Asset Registry", icon: Target, color: "purple", link: "/maintenance/assets", metrics: [{ l: "Total Tracked", v: "1,240", link: "/maintenance/assets" }, { l: "Critical Health", v: "98%", link: "/maintenance/assets" }, { l: "Warranty Expiring", v: "15", link: "/maintenance/assets" }] },
        { title: "Field Technicians", icon: Users, color: "blue", link: "/operations/technicians", metrics: [{ l: "Active Techs", v: "24", link: "/operations/technicians" }, { l: "Avg. Jobs/Day", v: "3.2", link: "/operations/technicians" }, { l: "Customer Rating", v: "4.8★", link: "/operations/technicians" }] },
        { title: "Recent Critical Alerts", icon: AlertTriangle, color: "red", link: "/operations/work-orders", metrics: [{ l: "HVAC Chiller Down", v: "Sharm Resort", link: "/operations/work-orders" }, { l: "Elevator PM Overdue", v: "Grand Cairo", link: "/operations/work-orders" }, { l: "Pool Pump Leak", v: "Alexandria Inn", link: "/operations/work-orders" }] }
      ]
    },
    commercial: {
      title: "Commercial & Sales Deep Dive",
      kpis: [
        { label: "Pipeline Value", value: 2150000, trend: 15.7, category: "commercial", sparkline: [1500, 1600, 1750, 1850, 1950, 2050, 2150], link: "/commercial/pipeline" },
        { label: "Conversion Rate", value: 25.7, trend: 3.2, category: "commercial", sparkline: [20, 21, 22, 23, 24, 25, 25.7], link: "/commercial/leads" },
        { label: "Monthly Revenue", value: 450000, trend: 8.4, category: "commercial", sparkline: [380, 390, 410, 420, 435, 445, 450], link: "/commercial/invoices" },
        { label: "Active Contracts", value: 12, trend: 0, category: "commercial", sparkline: [10, 10, 11, 11, 11, 12, 12], link: "/commercial/contracts" }
      ],
      deepDive: [
        { title: "Top Clients by Revenue", icon: Users, color: "amber", link: "/commercial/customers", metrics: [{ l: "Sharm Resort", v: fmtCurrency(2450000), link: "/commercial/customers" }, { l: "Grand Cairo", v: fmtCurrency(1850000), link: "/commercial/customers" }, { l: "Alexandria Inn", v: fmtCurrency(980000), link: "/commercial/customers" }] },
        { title: "Proposal Funnel", icon: FileText, color: "blue", link: "/commercial/proposals", metrics: [{ l: "Draft", v: "5", link: "/commercial/proposals" }, { l: "Sent / Pending", v: "12", link: "/commercial/proposals" }, { l: "Won / Accepted", v: "7", link: "/commercial/proposals" }] },
        { title: "Upcoming Renewals", icon: Calendar, color: "emerald", link: "/commercial/contracts", metrics: [{ l: "Sharm Resort SLA", v: "Aug 15", link: "/commercial/contracts" }, { l: "Grand Cairo Maint.", v: "Dec 31", link: "/commercial/contracts" }, { l: "Alexandria Inn", v: "Oct 01", link: "/commercial/contracts" }] }
      ]
    },
    supply: {
      title: "Supply Chain & Procurement Deep Dive",
      kpis: [
        { label: "Inventory Value", value: 450000, trend: -2.8, category: "supply", sparkline: [480, 475, 470, 465, 460, 455, 450], link: "/supply-chain/inventory" },
        { label: "Vendor Score", value: 91, trend: 1.5, category: "supply", sparkline: [88, 89, 89, 90, 90, 91, 91], link: "/supply-chain/suppliers" },
        { label: "Active POs", value: 12, trend: 5.0, category: "supply", sparkline: [8, 9, 10, 11, 11, 12, 12], link: "/supply-chain/purchase-orders" },
        { label: "Low Stock Alerts", value: 4, trend: -20, category: "supply", sparkline: [6, 5, 5, 4, 4, 4, 4], link: "/supply-chain/inventory" }
      ],
      deepDive: [
        { title: "Procurement Pipeline", icon: ShoppingCart, color: "amber", link: "/supply-chain/purchase-orders", metrics: [{ l: "Pending Approval", v: "3", link: "/supply-chain/procurement" }, { l: "Awaiting GRN", v: "5", link: "/supply-chain/goods-receipts" }, { l: "Unmatched Invoices", v: "2", link: "/supply-chain/supplier-invoices" }] },
        { title: "Warehouse Health", icon: Target, color: "emerald", link: "/supply-chain/inventory", metrics: [{ l: "Main Warehouse", v: "98% Full", link: "/supply-chain/inventory" }, { l: "Site Stores Active", v: "5", link: "/supply-chain/inventory" }, { l: "Shrinkage Rate", v: "0.2%", link: "/supply-chain/inventory" }] },
        { title: "Top Performing Vendors", icon: CheckCircle2, color: "blue", link: "/supply-chain/suppliers", metrics: [{ l: "Carrier Egypt", v: "Score: 94", link: "/supply-chain/suppliers" }, { l: "Copper Cable Sup.", v: "Score: 91", link: "/supply-chain/suppliers" }, { l: "Marble Egypt Co.", v: "Score: 88", link: "/supply-chain/suppliers" }] }
      ]
    }
  };

  const currentData = tabData[activeTab];
  const tabs = [
    { key: "overview", label: "Executive Overview", icon: BarChart3 },
    { key: "operations", label: "Operations & Maintenance", icon: Wrench },
    { key: "commercial", label: "Commercial & Sales", icon: DollarSign },
    { key: "supply", label: "Supply Chain", icon: ShoppingCart }
  ];

  const dateRanges = [
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
    { key: "90d", label: "Last 90 Days" },
    { key: "ytd", label: "Year to Date" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* 1. Header with Global Date Range */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time business intelligence. Click any metric to drill down.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
            {dateRanges.map(dr => (
              <button
                key={dr.key}
                onClick={() => setDateRange(dr.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === dr.key ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dr.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Professional Action Bar (Working Navigation) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm sticky top-2 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto px-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 px-2 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0">
            <Link href="/executive/intelligence">
              <Button variant="ghost" size="sm" icon={<BarChart3 className="w-4 h-4" />}>Deep Intelligence</Button>
            </Link>
            <Link href="/analytics/reports">
              <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />}>Generate Report</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Dynamic KPI Grid (ALL CLICKABLE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentData.kpis.map((kpi: any, i: number) => {
          const isPositive = kpi.trend > 0;
          const colorMap: Record<string, string> = { financial: "amber", operations: "blue", commercial: "emerald", supply: "purple" };
          const color = colorMap[kpi.category] || "amber";

          return (
            <Link key={i} href={kpi.link} className="block group">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(kpi.trend)}%
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {typeof kpi.value === 'number' && kpi.value > 1000 ? fmtCurrency(kpi.value) : kpi.value}
                    {kpi.suffix ? kpi.suffix : (kpi.label.includes('Rate') || kpi.label.includes('Compliance') || kpi.label.includes('Score') ? '%' : '')}
                  </div>
                  <Sparkline data={kpi.sparkline} color={color} />
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  View Details <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4. Interconnected Deep Dive Sections (ALL METRICS CLICKABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {currentData.deepDive.map((section: any, idx: number) => {
          const Icon = section.icon;
          return (
            <div key={idx} className={`bg-gradient-to-br from-${section.color}-50 to-white rounded-2xl border border-${section.color}-200 p-6 hover:shadow-lg transition-all`}>
              <Link href={section.link} className="flex items-center justify-between mb-4 group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${section.color}-500 flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 text-lg">{section.title}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <div className="space-y-2">
                {section.metrics.map((m: any, i: number) => (
                  <Link key={i} href={m.link} className="block">
                    <div className="flex justify-between items-center p-3 bg-white/70 hover:bg-white rounded-xl border border-transparent hover:border-amber-200 transition-all group/metric">
                      <span className="text-sm text-slate-600 group-hover/metric:text-slate-900">{m.l}</span>
                      <span className="font-bold text-slate-900 group-hover/metric:text-amber-600 transition-colors">{m.v}</span>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Link href={section.link} className="block mt-4">
                <Button variant="ghost" size="xs" className="w-full justify-center text-slate-600 hover:text-amber-600 hover:bg-amber-50">
                  View Full {section.title} Dashboard →
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* 5. Recent Activity Feed (Connecting the dots) */}
      <SectionCard title="Recent System-Wide Activity" actions={<Link href="/executive" className="text-xs text-amber-600 font-semibold hover:underline">View Executive Log</Link>}>
        <div className="space-y-4">
          {[
            { time: "10 mins ago", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", text: "Work Order WO-2026-042 completed at Grand Cairo Hotel", link: "/operations/work-orders" },
            { time: "1 hour ago", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", text: "Purchase Order PO-2026-098 received and matched at Main Warehouse", link: "/supply-chain/goods-receipts" },
            { time: "3 hours ago", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", text: "Proposal PROP-2026-002 accepted by Sharm Resort & Spa (Value: 180k)", link: "/commercial/proposals" },
            { time: "5 hours ago", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", text: "Low stock alert triggered: Carrier Chiller Compressor (Main Warehouse)", link: "/supply-chain/inventory" }
          ].map((activity, i) => (
            <Link key={i} href={activity.link} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 group-hover:text-amber-700 transition-colors">{activity.text}</div>
                <div className="text-xs text-slate-500 mt-0.5">{activity.time}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* 6. System Status Footer */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="font-semibold text-lg">All Systems Operational</div>
            <div className="text-sm text-slate-400">Data last synced: {new Date().toLocaleTimeString()} · Range: {dateRange.toUpperCase()}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> 24 Active Users
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> Uptime: 99.9%
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> API Latency: 42ms
          </div>
        </div>
      </div>
    </div>
  );
}

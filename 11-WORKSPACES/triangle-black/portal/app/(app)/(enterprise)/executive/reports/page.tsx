"use client"; // @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { FileText, Download, TrendingUp, Users, Wrench, DollarSign, BarChart3 } from "lucide-react";

const REPORTS = [
  {
    category: "Operations",
    icon: Wrench,
    color: "text-blue-600",
    reports: [
      { name: "Monthly Operations Summary", url: "/api/v1/pdf-export/preview/monthly-report", desc: "Work orders, PM plans, technician utilization" },
      { name: "SLA Compliance Report",      url: "/api/v1/sla/overview",                     desc: "Completion rates, breach analysis, by priority", isJson: true },
      { name: "AI Signals Report",          url: "/api/v1/ai/signals/v2",                    desc: "Cross-domain operational alerts", isJson: true },
    ],
  },
  {
    category: "Finance",
    icon: DollarSign,
    color: "text-emerald-600",
    reports: [
      { name: "Cash Flow Report",           url: "/api/v1/analytics/cashflow",               desc: "Monthly revenue vs expenses EGP", isJson: true },
      { name: "Executive KPI Scorecard",    url: "/api/v1/executive-kpi/scorecard",           desc: "Balanced scorecard + EV analysis", isJson: true },
      { name: "Invoice Payment Summary",    url: "/api/v1/invoices/payment-summary",          desc: "Collection rate + outstanding", isJson: true },
    ],
  },
  {
    category: "Maintenance",
    icon: BarChart3,
    color: "text-amber-600",
    reports: [
      { name: "Predictive Health Scores",   url: "/api/v1/predictive-maintenance/health-scores", desc: "Asset health + failure predictions", isJson: true },
      { name: "PM Risk Summary",            url: "/api/v1/predictive-maintenance/risk-summary",  desc: "Risk by asset category", isJson: true },
      { name: "Warranty Overview",          url: "/api/v1/warranty/overview",                    desc: "Active + expiring warranties", isJson: true },
    ],
  },
  {
    category: "Customer",
    icon: Users,
    color: "text-purple-600",
    reports: [
      { name: "Customer Success Overview",  url: "/api/v1/customer-success/overview",         desc: "NPS + renewals + at-risk clients", isJson: true },
      { name: "Contract Renewals",          url: "/api/v1/customer-success/renewals",          desc: "Contracts expiring in 90 days", isJson: true },
      { name: "NPS Summary",               url: "/api/v1/customer-success/nps/summary",       desc: "Promoters, passives, detractors", isJson: true },
    ],
  },
  {
    category: "Procurement",
    icon: TrendingUp,
    color: "text-orange-600",
    reports: [
      { name: "Reorder Alerts",            url: "/api/v1/inventory-items/reorder-alerts",    desc: "Items below minimum stock", isJson: true },
      { name: "Tenant Audit",              url: "/api/v1/tenant-audit/isolation-check",      desc: "Multi-hotel data isolation", isJson: true },
      { name: "Knowledge Graph Stats",     url: "/api/v1/knowledge-graph/stats",             desc: "Entity counts + vector embeddings", isJson: true },
    ],
  },
];

function ReportRow({ report }: { report: any }) {
  const handleDownload = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
      const url = report.url.startsWith("http") ? report.url : `${baseUrl}${report.url}`;

      if (report.isJson) {
        const r = await authFetch(report.url);
        const data = await r.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.json`;
        a.click();
      } else {
        window.open(url, "_blank");
      }
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg
                    border border-slate-200 hover:border-slate-300 hover:bg-slate-100">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{report.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{report.desc}</div>
      </div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        <span className="text-xs text-slate-400">{report.isJson ? "JSON" : "HTML"}</span>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 text-white
                     rounded-lg hover:bg-slate-700"
        >
          <Download className="w-3 h-3" /> Download
        </button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: kpis = {} } = useQuery({
    queryKey: ["reports-kpis"],
    queryFn: () => authFetch("/api/v1/executive-kpi/summary").then(r => r.json()),
  });

  const totalReports = REPORTS.reduce((sum, cat) => sum + cat.reports.length, 0);

  return (
    <PageWrapper>
      <PageHeader
        title="Reports & Exports"
        subtitle={`${totalReports} reports available across all operational domains`}
        badge="Program H"
      />

      {/* Quick KPI strip */}
      {kpis.revenue_egp !== undefined && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Revenue (EGP)",    value: `${Number(kpis.revenue_egp||0).toLocaleString()}` },
            { label: "WO Completion",    value: `${kpis.wo_completion_pct ?? 0}%` },
            { label: "Active Contracts", value: kpis.active_contracts ?? 0 },
            { label: "Tech Utilization", value: `${kpis.technician_utilization_pct ?? 0}%` },
          ].map(k => (
            <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-slate-800">{k.value}</div>
              <div className="text-xs text-slate-400 mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Report categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {REPORTS.map(cat => (
          <SectionCard key={cat.category} title={cat.category}>
            <div className="space-y-2">
              {cat.reports.map(report => (
                <ReportRow key={report.name} report={report} />
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageWrapper>
  );
}

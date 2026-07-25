// @ts-nocheck
"use client";
import { useState } from "react";
import { PageWrapper, PageHeader, SectionCard } from "@/components/ui";
import { Download, FileText, Package, Users, TrendingUp, Wrench, CreditCard } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

const EXPORTS = [
  {
    label:       "Work Orders",
    icon:        Wrench,
    endpoint:    "/api/v1/export/work-orders",
    filename:    "work_orders.csv",
    description: "All work orders with status, priority, technician, asset",
    filters: [
      { key: "status",   label: "Status",   options: ["open","in_progress","completed","cancelled"] },
      { key: "priority", label: "Priority", options: ["critical","high","medium","low"] },
    ],
  },
  {
    label:       "Assets",
    icon:        Package,
    endpoint:    "/api/v1/export/assets",
    filename:    "assets.csv",
    description: "All assets with category, criticality, location",
    filters: [
      { key: "criticality", label: "Criticality", options: ["critical","high","medium","low"] },
    ],
  },
  {
    label:       "Invoices",
    icon:        CreditCard,
    endpoint:    "/api/v1/export/invoices",
    filename:    "invoices.csv",
    description: "All invoices with amount, status, due date",
    filters: [
      { key: "status", label: "Status", options: ["paid","unpaid","overdue","partially_paid"] },
    ],
  },
  {
    label:       "Leads",
    icon:        TrendingUp,
    endpoint:    "/api/v1/export/leads",
    filename:    "leads.csv",
    description: "All leads with status, value, contact",
    filters: [
      { key: "status", label: "Stage", options: ["new","qualified","proposal","negotiation","won","lost"] },
    ],
  },
  {
    label:       "Technicians",
    icon:        Users,
    endpoint:    "/api/v1/export/technicians",
    filename:    "technicians.csv",
    description: "All technicians with specializations, utilization",
    filters: [],
  },
];

function ExportCard({ exp }: { exp: any }) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
      );
      const url = `${API_BASE}${exp.endpoint}${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const now = new Date().toISOString().slice(0,10);
      a.download = `${now}_${exp.filename}`;
      a.click();
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <exp.icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800">{exp.label}</div>
          <div className="text-sm text-slate-500 mt-0.5">{exp.description}</div>

          {exp.filters.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {exp.filters.map((f: any) => (
                <select
                  key={f.key}
                  value={filters[f.key] ?? ""}
                  onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1"
                >
                  <option value="">All {f.label}</option>
                  {f.options.map((o: string) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white
                     text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 flex-shrink-0"
        >
          <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
          {downloading ? "..." : "CSV"}
        </button>
      </div>
    </div>
  );
}

export default function DataExportsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Data Exports"
        subtitle="Download platform data as CSV files for analysis"
        badge="Administration"
      />

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <strong>CSV Format:</strong> UTF-8 encoded, comma-separated.
        Maximum 5,000 rows per export. Apply filters to narrow the dataset.
      </div>

      <div className="space-y-4">
        {(EXPORTS || []).map(exp  => (
          <ExportCard key={exp.label} exp={exp} />
        ))}
      </div>
    </PageWrapper>
  );
}

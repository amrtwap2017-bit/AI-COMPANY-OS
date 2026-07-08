"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/lib/api";

interface PipelineSummary {
  total_leads?: number;
  new?: number;
  qualified?: number;
  assigned?: number;
  converted?: number;
  lost?: number;
  conversion_rate?: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<PipelineSummary>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<PipelineSummary>("/pipeline/summary")
      .then(setSummary)
      .catch(() => setSummary({}))
      .finally(() => setLoading(false));
  }, []);

  const stat = (label: string, value: number | string, color: string) => (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px",
      border: "1px solid #e2e8f0", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  return (
    <AuthGuard>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Dashboard</h1>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 32 }}>
          Triangle Black Hotel Engineering Platform
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8" }}>Loading pipeline data...</div>
        ) : (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
            {stat("Total Leads", summary.total_leads ?? 0, "#1e293b")}
            {stat("New", summary.new ?? 0, "#2563eb")}
            {stat("Qualified", summary.qualified ?? 0, "#059669")}
            {stat("Assigned", summary.assigned ?? 0, "#7c3aed")}
            {stat("Converted", summary.converted ?? 0, "#16a34a")}
            {stat("Conversion %",
              summary.conversion_rate ? `${summary.conversion_rate}%` : "—",
              "#f59e0b"
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <a href="/leads" style={{ background: "#fff", borderRadius: 12, padding: 24,
            border: "1px solid #e2e8f0", textDecoration: "none", color: "#1e293b",
            display: "block" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Manage Leads</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              View, filter and manage all hotel leads
            </div>
          </a>
          <a href="/pipeline" style={{ background: "#fff", borderRadius: 12, padding: 24,
            border: "1px solid #e2e8f0", textDecoration: "none", color: "#1e293b",
            display: "block" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Pipeline View</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              Track lead conversion funnel
            </div>
          </a>
          <a href="/quotes" style={{ background: "#fff", borderRadius: 12, padding: 24,
            border: "1px solid #e2e8f0", textDecoration: "none", color: "#1e293b",
            display: "block" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Quotes</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              Manage quotations and approvals
            </div>
          </a>
          <a href="/agents" style={{ background: "#fff", borderRadius: 12, padding: 24,
            border: "1px solid #e2e8f0", textDecoration: "none", color: "#1e293b",
            display: "block" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤝</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Sales Agents</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              Agent workload and assignments
            </div>
          </a>
        </div>
      </div>
    </AuthGuard>
  );
}

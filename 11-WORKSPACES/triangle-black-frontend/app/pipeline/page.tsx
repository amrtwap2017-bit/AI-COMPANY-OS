"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/lib/api";

interface Summary {
  total_leads?: number;
  new?: number; qualified?: number;
  assigned?: number; converted?: number; lost?: number;
}

interface RecentLead {
  id: string; name: string; status: string; created_at: string;
}

const STAGES = [
  { key: "new", label: "New", color: "#2563eb" },
  { key: "qualified", label: "Qualified", color: "#059669" },
  { key: "assigned", label: "Assigned", color: "#7c3aed" },
  { key: "converted", label: "Converted", color: "#16a34a" },
];

export default function PipelinePage() {
  const [summary, setSummary] = useState<Summary>({});
  const [recent, setRecent] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Summary>("/pipeline/summary").catch(() => ({})),
      apiFetch<RecentLead[]>("/pipeline/recent").catch(() => []),
    ]).then(([s, r]) => {
      setSummary(s);
      setRecent(Array.isArray(r) ? r : []);
    }).finally(() => setLoading(false));
  }, []);

  const total = summary.total_leads || 1;

  return (
    <AuthGuard>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Pipeline</h1>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 32 }}>
          Lead conversion funnel · {summary.total_leads || 0} total leads
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8" }}>Loading pipeline...</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 0, marginBottom: 32,
              background: "#fff", borderRadius: 12, overflow: "hidden",
              border: "1px solid #e2e8f0" }}>
              {STAGES.map((stage, i) => {
                const count = (summary as Record<string, number>)[stage.key] || 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stage.key} style={{ flex: 1, padding: "24px 20px",
                    borderRight: i < STAGES.length - 1 ? "1px solid #e2e8f0" : "none",
                    textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: 1,
                      marginBottom: 8 }}>{stage.label}</div>
                    <div style={{ fontSize: 40, fontWeight: 800,
                      color: stage.color }}>{count}</div>
                    <div style={{ marginTop: 8, background: "#f1f5f9",
                      borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%",
                        background: stage.color }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8",
                      marginTop: 4 }}>{pct}% of total</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24,
              border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Recent Activity</h3>
              {recent.length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 13 }}>No recent activity</div>
              ) : recent.slice(0, 10).map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 13, color: "#64748b",
                    textTransform: "capitalize" }}>{r.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

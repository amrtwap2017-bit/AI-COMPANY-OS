"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/lib/api";

interface Agent {
  id: string; name: string; email: string;
  max_leads: number; current_leads: number; is_active: boolean;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Agent[]>("/agents/?limit=100")
      .then(setAgents).catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Sales Agents</h1>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 32 }}>
          {agents.length} agents · {agents.filter(a => a.is_active).length} active
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8" }}>Loading agents...</div>
        ) : (
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {agents.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 14 }}>No agents found</div>
            ) : agents.map(a => {
              const pct = a.max_leads > 0
                ? Math.round((a.current_leads / a.max_leads) * 100) : 0;
              const barColor = pct >= 90 ? "#ef4444"
                : pct >= 70 ? "#f59e0b" : "#059669";
              return (
                <div key={a.id} style={{ background: "#fff", borderRadius: 12,
                  padding: 20, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b",
                        marginTop: 2 }}>{a.email}</div>
                    </div>
                    <span style={{
                      background: a.is_active ? "#dcfce7" : "#fee2e2",
                      color: a.is_active ? "#166534" : "#991b1b",
                      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>{a.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                      <span>Workload</span>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>
                        {a.current_leads}/{a.max_leads} leads
                      </span>
                    </div>
                    <div style={{ background: "#f1f5f9", borderRadius: 6,
                      height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%",
                        background: barColor, borderRadius: 6,
                        transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8",
                      marginTop: 4 }}>{pct}% capacity</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/lib/api";

interface Lead {
  id: string; name: string; email: string; company: string;
  status: string; priority: string; score: number;
  assigned_agent_id?: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "#2563eb", qualified: "#059669", assigned: "#7c3aed",
  converted: "#16a34a", lost: "#ef4444",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Lead[]>("/leads/?limit=100")
      .then(setLeads).catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? leads.filter(l => l.status === filter) : leads;

  return (
    <AuthGuard>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Leads</h1>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
              {filtered.length} leads {filter ? `(${filter})` : "total"}
            </div>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
              fontSize: 14, background: "#fff" }}>
            <option value="">All Status</option>
            {["new","qualified","assigned","converted","lost"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8", padding: 32, textAlign: "center" }}>
            Loading leads...
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Name", "Company", "Email", "Status", "Priority", "Score"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                      fontSize: 12, fontWeight: 600, color: "#374151",
                      borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center",
                    color: "#94a3b8" }}>No leads found</td></tr>
                ) : filtered.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                      {l.name}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
                      {l.company || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>
                      {l.email}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: STATUS_COLORS[l.status] || "#f1f5f9",
                        color: l.status ? "#fff" : "#374151",
                        padding: "3px 10px", borderRadius: 20, fontSize: 12,
                        fontWeight: 600, textTransform: "capitalize",
                      }}>{l.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13,
                      textTransform: "capitalize" }}>{l.priority}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4,
                          height: 6, overflow: "hidden" }}>
                          <div style={{ width: `${l.score}%`, height: "100%",
                            background: l.score >= 70 ? "#059669" : l.score >= 40
                              ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700,
                          minWidth: 28 }}>{l.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

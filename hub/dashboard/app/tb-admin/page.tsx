export const dynamic = "force-dynamic";

const TB = "http://127.0.0.1:8030/api/v1";

async function getLeads() {
  try {
    const r = await fetch(`${TB}/leads/?limit=50`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

async function getAgents() {
  try {
    const r = await fetch(`${TB}/agents/?limit=50`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

async function getHealth() {
  try {
    const r = await fetch("http://127.0.0.1:8030/health", { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

export default async function TBAdminPage() {
  const [leads, agents, health] = await Promise.all([
    getLeads(), getAgents(), getHealth()
  ]);

  const statusColor: Record<string, string> = {
    new: "#2563eb", qualified: "#059669", assigned: "#7c3aed",
    converted: "#16a34a", lost: "#ef4444",
  };

  const leadsByStatus: Record<string, number> = {};
  if (Array.isArray(leads)) {
    for (const l of leads) {
      const s = String(l.status || "unknown");
      leadsByStatus[s] = (leadsByStatus[s] || 0) + 1;
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
            🏨 Triangle Black Admin
          </h1>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Hotel Engineering Platform · Live Data from port 8030
          </div>
        </div>
        <span style={{
          background: health?.ok ? "#dcfce7" : "#fee2e2",
          color: health?.ok ? "#166534" : "#991b1b",
          padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700
        }}>
          {health?.ok ? `● LIVE · DB ${health.database}` : "● OFFLINE"}
        </span>
      </div>

      {/* Pipeline funnel */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24,
        border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Lead Pipeline</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(leadsByStatus).map(([status, count]) => (
            <div key={status} style={{ textAlign: "center", minWidth: 100,
              background: "#f8fafc", borderRadius: 10, padding: "12px 20px",
              borderTop: `3px solid ${statusColor[status] || "#94a3b8"}` }}>
              <div style={{ fontSize: 28, fontWeight: 800,
                color: statusColor[status] || "#1e293b" }}>{count}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2,
                textTransform: "capitalize" }}>{status}</div>
            </div>
          ))}
          {Object.keys(leadsByStatus).length === 0 && (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              No leads yet — API may require authentication
            </div>
          )}
        </div>
      </div>

      {/* Leads table */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20,
        border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>
          Recent Leads ({Array.isArray(leads) ? leads.length : 0})
        </h3>
        {Array.isArray(leads) && leads.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Name", "Company", "Email", "Status", "Priority", "Score"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                    fontSize: 12, fontWeight: 600, color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 20).map((l: Record<string, unknown>, i: number) => (
                <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600 }}>
                    {String(l.name || "—")}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13, color: "#64748b" }}>
                    {String(l.company || "—")}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 12, color: "#64748b" }}>
                    {String(l.email || "—")}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      background: statusColor[String(l.status || "")] || "#f1f5f9",
                      color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11
                    }}>{String(l.status || "—")}</span>
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>
                    {String(l.priority || "—")}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700 }}>
                    {String(l.score ?? "—")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: 13 }}>
            No leads available (authentication required or DB empty)
          </div>
        )}
      </div>

      {/* Agents */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20,
        border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>
          Sales Agents ({Array.isArray(agents) ? agents.length : 0})
        </h3>
        {Array.isArray(agents) && agents.length > 0 ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {agents.map((a: Record<string, unknown>, i: number) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10,
                padding: "12px 16px", minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{String(a.name || "Agent")}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{String(a.email || "")}</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <span style={{ color: "#059669", fontWeight: 700 }}>
                    {String(a.current_leads ?? 0)}
                  </span>
                  <span style={{ color: "#94a3b8" }}>/{String(a.max_leads ?? "∞")} leads</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: 13 }}>
            No agents available
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <a href="http://127.0.0.1:8030/docs" target="_blank"
          style={{ padding: "8px 16px", background: "#1e293b", color: "#fff",
            borderRadius: 8, textDecoration: "none", fontSize: 13 }}>
          API Docs ↗
        </a>
        <a href="/triangle-black"
          style={{ padding: "8px 16px", background: "#f1f5f9", color: "#1e293b",
            borderRadius: 8, textDecoration: "none", fontSize: 13 }}>
          TB Overview
        </a>
        <a href="/orchestrator"
          style={{ padding: "8px 16px", background: "#f1f5f9", color: "#1e293b",
            borderRadius: 8, textDecoration: "none", fontSize: 13 }}>
          Orchestrator
        </a>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

const ORCH = "http://127.0.0.1:8020";
const TB   = "http://127.0.0.1:8030";

async function getTBHealth() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/tb/health`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function getTBTests() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/tb/tests`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function getTBStats() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/tb/stats`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

export default async function TriangleBlackPage() {
  const [health, tests, stats] = await Promise.all([
    getTBHealth(), getTBTests(), getTBStats()
  ]);

  const tbOnline = health?.ok === true;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
            🏨 Triangle Black
          </h1>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Hotel Engineering Platform · v1.9.0
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{
            background: tbOnline ? "#dcfce7" : "#fee2e2",
            color: tbOnline ? "#166534" : "#991b1b",
            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700
          }}>
            {tbOnline ? "● API ONLINE :8030" : "● API OFFLINE"}
          </span>
        </div>
      </div>

      {/* Test Status */}
      <div style={{ background: tests?.ok ? "#f0fdf4" : "#fef2f2",
        borderRadius: 12, padding: 20,
        border: `1px solid ${tests?.ok ? "#bbf7d0" : "#fecaca"}`,
        marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16,
              color: tests?.ok ? "#166534" : "#991b1b" }}>
              {tests?.ok ? "✅ All Tests Passing" : "❌ Tests Failing"}
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              {tests?.summary || "Running tests..."}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>{tests?.ok ? "✅" : "❌"}</div>
        </div>
      </div>

      {/* API Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16, marginBottom: 24 }}>
        {["leads", "agents", "quotes"].map(key => {
          const s = stats?.triangle_black?.[key];
          return (
            <div key={key} style={{ background: "#fff", borderRadius: 12,
              padding: 20, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase",
                letterSpacing: 1 }}>{key}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b",
                marginTop: 4 }}>
                {s?.ok ? (s.count ?? "✓") : "—"}
              </div>
              <div style={{ fontSize: 12, color: s?.ok ? "#059669" : "#ef4444",
                marginTop: 4 }}>
                {s?.ok ? "connected" : s?.error?.slice(0, 30) || "offline"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20,
        border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
          Quick Links
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "API Docs", url: `${TB}/docs`, color: "#2563eb" },
            { label: "API Health", url: `${TB}/health`, color: "#059669" },
            { label: "Leads API", url: `${TB}/api/v1/leads/`, color: "#7c3aed" },
            { label: "Quotes API", url: `${TB}/api/v1/quotes/`, color: "#f59e0b" },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank"
              style={{ padding: "8px 16px", background: link.color,
                color: "#fff", borderRadius: 8, textDecoration: "none",
                fontSize: 13, fontWeight: 600 }}>
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Domains */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20,
        border: "1px solid #e2e8f0" }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
          Built Domains (13 routers)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            "lead_management", "agent_management", "pipeline_dashboard",
            "activity_tracking", "search_filters", "webhook_notifications",
            "quotation", "auth", "reporting", "contracts",
            "notifications", "invoices", "actions"
          ].map(domain => (
            <div key={domain} style={{ background: "#f0fdf4", borderRadius: 8,
              padding: "8px 12px", fontSize: 12, color: "#166534",
              fontWeight: 500 }}>
              ✓ {domain.replace("_", " ")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

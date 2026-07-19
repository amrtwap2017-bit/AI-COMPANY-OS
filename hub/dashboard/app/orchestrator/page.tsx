export const dynamic = "force-dynamic";

const ENGINE = "http://127.0.0.1:8001/api/v1/ai";

async function safe(url: string, fallback: unknown = null) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    return r.ok ? r.json() : fallback;
  } catch { return fallback; }
}

export default async function OrchestratorPage() {
  const [status, runs, obs] = await Promise.all([
    safe(`${ENGINE}/orchestrator/status`, {}),
    safe(`${ENGINE}/orchestrator/runs`, { runs: [], total: 0 }),
    safe(`${ENGINE}/orchestrator/observability`, {}),
  ]);

  const online = status?.status === "online";

  const card = (title: string, value: string | number, color = "#f1f5f9") => (
    <div style={{
      background: "#0f172a", border: "1px solid #1e293b",
      borderRadius: 12, padding: "20px 24px", minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>
          🧠 Enterprise Orchestrator
        </h1>
        <span style={{
          background: online ? "#14532d" : "#450a0a",
          color: online ? "#86efac" : "#fca5a5",
          padding: "4px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
        }}>
          {online ? "● ONLINE" : "● OFFLINE"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {card("Pipeline Runs", runs?.total ?? 0)}
        {card("Snapshots", status?.snapshots ?? 0)}
        {card("Retrospectives", status?.retrospectives ?? 0)}
        {card("Active Agents", status?.active_agents ?? 0, "#60a5fa")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: "#f1f5f9" }}>
            Pipeline Status Breakdown
          </div>
          {obs?.status_breakdown ? (
            Object.entries(obs.status_breakdown).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between",
                fontSize: 13, color: "#94a3b8", padding: "4px 0" }}>
                <span>{k}</span><span style={{ fontWeight: 700 }}>{v as number}</span>
              </div>
            ))
          ) : (
            <div style={{ color: "#475569", fontSize: 13 }}>No pipeline runs yet</div>
          )}
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: "#f1f5f9" }}>
            Stage Performance (avg ms)
          </div>
          {obs?.stage_performance ? (
            Object.entries(obs.stage_performance).map(([stage, data]: [string, any]) => (
              <div key={stage} style={{ display: "flex", justifyContent: "space-between",
                fontSize: 13, color: "#94a3b8", padding: "4px 0" }}>
                <span>{stage}</span>
                <span style={{ fontWeight: 700 }}>{data.avg_ms ?? 0}ms</span>
              </div>
            ))
          ) : (
            <div style={{ color: "#475569", fontSize: 13 }}>No stage data yet</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {[
          ["📡 Observability", "/orchestrator/observability"],
          ["📋 Briefing", "/orchestrator/briefing"],
          ["🔍 State", "/orchestrator/state"],
          ["▶️ Run Task", "/orchestrator/run-task"],
          ["💾 Memory", "/orchestrator/memory"],
        ].map(([label, href]) => (
          <a key={href} href={href}
            style={{
              background: "#1e293b", color: "#cbd5e1", padding: "8px 16px",
              borderRadius: 8, fontSize: 13, textDecoration: "none",
              border: "1px solid #334155",
            }}>{label}</a>
        ))}
      </div>
    </div>
  );
}

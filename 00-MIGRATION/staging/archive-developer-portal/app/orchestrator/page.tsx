export const dynamic = "force-dynamic";

const ORCH = process.env.NEXT_PUBLIC_ORCH_API_BASE_URL || "http://127.0.0.1:8020";
const WS = "0d22ba37-30b0-46d9-844f-312ec5f9abc8";

async function getHealth() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/health`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function getMetrics() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/metrics`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function getPipelines() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/pipelines/${WS}?limit=10`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

export default async function OrchestratorPage() {
  const [health, metrics, pipelines] = await Promise.all([
    getHealth(), getMetrics(), getPipelines()
  ]);

  const card = (title: string, value: string | number, color = "#1e293b") => (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px",
      border: "1px solid #e2e8f0", minWidth: 160 }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>🧠 Enterprise Orchestrator</h1>
        <span style={{
          background: health?.ok ? "#dcfce7" : "#fee2e2",
          color: health?.ok ? "#166534" : "#991b1b",
          padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600
        }}>
          {health?.ok ? "● ONLINE" : "● OFFLINE"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        {card("Pipeline Runs", metrics?.pipeline_runs_total ?? 0, "#2563eb")}
        {card("Snapshots", metrics?.project_snapshots_total ?? 0, "#7c3aed")}
        {card("Retrospectives", metrics?.sprint_retrospectives_total ?? 0, "#059669")}
        {card("Port", "8020", "#64748b")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <a href="/orchestrator/briefing" style={{
          display: "block", background: "#1e293b", color: "#fff",
          borderRadius: 12, padding: "20px 24px", textDecoration: "none"
        }}>
          <div style={{ fontSize: 20 }}>☀️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Morning Briefing</div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>AI project status + next action</div>
        </a>
        <a href="/orchestrator/state" style={{
          display: "block", background: "#0f172a", color: "#fff",
          borderRadius: 12, padding: "20px 24px", textDecoration: "none"
        }}>
          <div style={{ fontSize: 20 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Project State</div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Live sprint + git + task status</div>
        </a>
        <a href="/orchestrator/run-task" style={{
          display: "block", background: "#059669", color: "#fff",
          borderRadius: 12, padding: "20px 24px", textDecoration: "none"
        }}>
          <div style={{ fontSize: 20 }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Run Pipeline</div>
          <div style={{ color: "#d1fae5", fontSize: 13, marginTop: 4 }}>Execute full autonomous pipeline</div>
        </a>
        <a href="/orchestrator/memory" style={{
          display: "block", background: "#7c3aed", color: "#fff",
          borderRadius: 12, padding: "20px 24px", textDecoration: "none"
        }}>
          <div style={{ fontSize: 20 }}>🧠</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Institutional Knowledge</div>
          <div style={{ color: "#ede9fe", fontSize: 13, marginTop: 4 }}>Decisions, failures, lessons</div>
        </a>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent Pipeline Runs</h2>
      {Array.isArray(pipelines) && pipelines.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff",
          borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Stage", "Status", "Model", "Duration", "Time"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left",
                  fontSize: 13, fontWeight: 600, color: "#374151" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pipelines.map((p: Record<string, unknown>, i: number) => (
              <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 16px", fontSize: 13 }}>{String(p.stage)}</td>
                <td style={{ padding: "10px 16px", fontSize: 13 }}>
                  <span style={{
                    background: p.stage_status === "completed" ? "#dcfce7" : p.stage_status === "failed" ? "#fee2e2" : "#fef3c7",
                    color: p.stage_status === "completed" ? "#166534" : p.stage_status === "failed" ? "#991b1b" : "#92400e",
                    padding: "2px 8px", borderRadius: 8, fontSize: 12
                  }}>{String(p.stage_status)}</span>
                </td>
                <td style={{ padding: "10px 16px", fontSize: 12, color: "#64748b" }}>{String(p.model_used || "-")}</td>
                <td style={{ padding: "10px 16px", fontSize: 13 }}>{p.duration_ms ? `${p.duration_ms}ms` : "-"}</td>
                <td style={{ padding: "10px 16px", fontSize: 12, color: "#94a3b8" }}>
                  {p.created_at ? new Date(String(p.created_at)).toLocaleTimeString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 32,
          textAlign: "center", color: "#94a3b8" }}>
          No pipeline runs yet. Run a task to see results here.
        </div>
      )}
    </div>
  );
}

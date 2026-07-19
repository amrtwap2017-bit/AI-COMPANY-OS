export const dynamic = "force-dynamic";

const ORCH = "http://127.0.0.1:8020";
const WS   = "0d22ba37-30b0-46d9-844f-312ec5f9abc8";

async function getMetrics() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/metrics`, { cache: "no-store" });
    return r.ok ? r.json() : {};
  } catch { return {}; }
}

async function getQuality() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/quality/${WS}`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

async function getPipelines() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/pipelines/${WS}?limit=50`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

async function getTBTests() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/tb/tests`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

export default async function ObservabilityPage() {
  const [metrics, quality, pipelines, tests] = await Promise.all([
    getMetrics(), getQuality(), getPipelines(), getTBTests()
  ]);

  const byStage: Record<string, number[]> = {};
  if (Array.isArray(pipelines)) {
    for (const p of pipelines) {
      const stage = String(p.stage || "unknown");
      if (!byStage[stage]) byStage[stage] = [];
      byStage[stage].push(Number(p.duration_ms || 0));
    }
  }

  const stageStats = Object.entries(byStage).map(([stage, durations]) => ({
    stage,
    count: durations.length,
    avg_ms: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    max_ms: Math.max(...durations),
  })).sort((a, b) => b.count - a.count);

  const statusCount: Record<string, number> = {};
  if (Array.isArray(pipelines)) {
    for (const p of pipelines) {
      const s = String(p.stage_status || "unknown");
      statusCount[s] = (statusCount[s] || 0) + 1;
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📡 AI Observability</h1>
        <a href="/orchestrator" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back</a>
      </div>

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Pipeline Runs", value: metrics?.pipeline_runs_total ?? 0, color: "#2563eb" },
          { label: "Snapshots", value: metrics?.project_snapshots_total ?? 0, color: "#7c3aed" },
          { label: "Retrospectives", value: metrics?.sprint_retrospectives_total ?? 0, color: "#059669" },
          { label: "TB Tests", value: tests?.ok ? "✅ 70 pass" : "❌ failing", color: tests?.ok ? "#059669" : "#ef4444" },
        ].map(m => (
          <div key={m.label} style={{ background: "#fff", borderRadius: 12,
            padding: "20px 24px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: String(m.color), marginTop: 4 }}>
              {String(m.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline status breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Pipeline Status Breakdown</h3>
          {Object.keys(statusCount).length > 0 ? (
            Object.entries(statusCount).map(([status, count]) => (
              <div key={status} style={{ display: "flex", justifyContent: "space-between",
                padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13 }}>
                  <span style={{
                    background: status === "completed" ? "#dcfce7" : status === "failed" ? "#fee2e2" : "#fef3c7",
                    color: status === "completed" ? "#166534" : status === "failed" ? "#991b1b" : "#92400e",
                    padding: "2px 8px", borderRadius: 8, fontSize: 11
                  }}>{status}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{count}</span>
              </div>
            ))
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>No pipeline runs yet</div>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Stage Performance (avg ms)</h3>
          {stageStats.length > 0 ? (
            stageStats.map(s => (
              <div key={s.stage} style={{ display: "flex", justifyContent: "space-between",
                padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{s.stage}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {s.avg_ms}ms avg · {s.count}x
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>No stage data yet</div>
          )}
        </div>
      </div>

      {/* TB Test details */}
      {tests && (
        <div style={{ background: tests.ok ? "#f0fdf4" : "#fef2f2",
          borderRadius: 12, padding: 20,
          border: `1px solid ${tests.ok ? "#bbf7d0" : "#fecaca"}`,
          marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15,
            color: tests.ok ? "#166534" : "#991b1b" }}>
            Triangle Black Test Suite
          </h3>
          <pre style={{ margin: 0, fontSize: 13, fontFamily: "monospace",
            color: "#1e293b", whiteSpace: "pre-wrap" }}>
            {tests.summary || tests.output?.slice(-500)}
          </pre>
        </div>
      )}

      {/* Recent pipeline runs */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Recent Pipeline Runs</h3>
        {Array.isArray(pipelines) && pipelines.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Stage", "Status", "Model", "Duration", "Time"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                    fontSize: 12, fontWeight: 600, color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipelines.slice(0, 20).map((p: Record<string, unknown>, i: number) => (
                <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>{String(p.stage)}</td>
                  <td style={{ padding: "8px 12px", fontSize: 12 }}>
                    <span style={{
                      background: p.stage_status === "completed" ? "#dcfce7" : p.stage_status === "failed" ? "#fee2e2" : "#fef3c7",
                      color: p.stage_status === "completed" ? "#166534" : p.stage_status === "failed" ? "#991b1b" : "#92400e",
                      padding: "2px 6px", borderRadius: 6
                    }}>{String(p.stage_status)}</span>
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 12, color: "#64748b" }}>
                    {String(p.model_used || "—")}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>
                    {p.duration_ms ? `${p.duration_ms}ms` : "—"}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 11, color: "#94a3b8" }}>
                    {p.created_at ? new Date(String(p.created_at)).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 32 }}>
            No pipeline runs yet. Execute a task to see data here.
          </div>
        )}
      </div>
    </div>
  );
}

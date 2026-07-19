export const dynamic = "force-dynamic";

const ORCH = process.env.NEXT_PUBLIC_ORCH_API_BASE_URL || "http://127.0.0.1:8020";
const WS = "0d22ba37-30b0-46d9-844f-312ec5f9abc8";

async function getState() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/state/${WS}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function getSnapshots() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/pipelines/${WS}?limit=5`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

export default async function BriefingPage() {
  const [state, pipelines] = await Promise.all([getState(), getSnapshots()]);

  if (!state) return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <div style={{ color: "#ef4444", fontSize: 16, fontWeight: 600 }}>
        ⚠ Orchestrator not responding
      </div>
      <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
        Make sure orchestrator is running on port 8020
      </div>
      <a href="/orchestrator" style={{ color: "#2563eb", fontSize: 13 }}>← Back</a>
    </div>
  );

  const pct = state.sprint_completion_pct ?? 0;
  const barColor = pct >= 80 ? "#059669" : pct >= 50 ? "#2563eb" : "#f59e0b";

  const counts = [
    { label: "Total", value: state.tasks_total, color: "#1e293b" },
    { label: "Done", value: state.tasks_completed, color: "#059669" },
    { label: "Pending", value: state.tasks_pending, color: "#2563eb" },
    { label: "Failed", value: state.tasks_failed, color: "#ef4444" },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>☀️ Morning Briefing</h1>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            {state.workspace_name} · {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric"
            })}
          </div>
        </div>
        <a href="/orchestrator" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back</a>
      </div>

      {/* Sprint Progress */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24,
        border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {state.active_sprint}
          </span>
          <span style={{ fontWeight: 800, fontSize: 22, color: barColor }}>{pct}%</span>
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: 8, height: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: barColor,
            borderRadius: 8, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {counts.map(c => (
            <div key={c.label}>
              <div style={{ fontSize: 12, color: "#64748b" }}>{c.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

        {/* Recommended Next */}
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 20,
          border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 13, color: "#166534", fontWeight: 600, marginBottom: 8 }}>
            ⚡ Recommended Next Action
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
            {state.recommended_next_task_title || "Sprint complete"}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
            {state.recommended_next_reason}
          </div>
          {state.recommended_next_task_id && (
            <a href={`/orchestrator/run-task?task_id=${state.recommended_next_task_id}`}
              style={{ display: "inline-block", padding: "8px 20px",
                background: "#059669", color: "#fff", borderRadius: 8,
                textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              ▶ Run This Now
            </a>
          )}
        </div>

        {/* Git State */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20,
          border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>
            🌿 Git State
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.9 }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Branch: </span>
              <code style={{ background: "#f1f5f9", padding: "1px 6px",
                borderRadius: 4, fontSize: 12 }}>{state.current_branch}</code>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Commit: </span>
              <code style={{ background: "#f1f5f9", padding: "1px 6px",
                borderRadius: 4, fontSize: 12 }}>{state.last_commit_hash}</code>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {state.last_commit_message?.slice(0, 60)}
            </div>
            <div style={{ marginTop: 6,
              color: state.uncommitted_files?.length > 0 ? "#f59e0b" : "#059669",
              fontSize: 13, fontWeight: 600 }}>
              {state.uncommitted_files?.length > 0
                ? `⚠ ${state.uncommitted_files.length} uncommitted files`
                : "✓ Clean working tree"}
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20,
        border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
          📋 Status Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Avg Review Score", value: state.avg_review_score > 0 ? `${state.avg_review_score}/100` : "No data yet", ok: state.avg_review_score >= 80 },
            { label: "In Progress", value: state.tasks_in_progress, ok: true },
            { label: "Blocked", value: state.tasks_blocked, ok: state.tasks_blocked === 0 },
          ].map(item => (
            <div key={item.label} style={{ background: "#f8fafc", borderRadius: 8,
              padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700,
                color: item.ok ? "#059669" : "#f59e0b" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      {state.failing_tasks?.length > 0 && (
        <div style={{ background: "#fff7ed", borderRadius: 12, padding: 20,
          border: "1px solid #fed7aa", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
            ⚠ Needs Attention
          </div>
          {state.failing_tasks.map((t: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: "#92400e", padding: "3px 0" }}>
              • {t}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/orchestrator/state" style={{ padding: "10px 20px", background: "#1e293b",
          color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          📊 Full State
        </a>
        <a href="/orchestrator/run-task" style={{ padding: "10px 20px", background: "#059669",
          color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          ⚡ Run Pipeline
        </a>
        <a href="/orchestrator/memory" style={{ padding: "10px 20px", background: "#7c3aed",
          color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          🧠 Knowledge
        </a>
        <a href={`/tasks?ws=${WS}`} style={{ padding: "10px 20px", background: "#f1f5f9",
          color: "#1e293b", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          📋 All Tasks
        </a>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: "#94a3b8" }}>
        Snapshot: {new Date(state.snapshot_at).toLocaleString()} ·
        No AI model called — instant load
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

const ORCH = process.env.NEXT_PUBLIC_ORCH_API_BASE_URL || "http://127.0.0.1:8020";
const WS = "0d22ba37-30b0-46d9-844f-312ec5f9abc8";

async function getState() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/state/${WS}`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

export default async function StatePage() {
  const s = await getState();
  if (!s) return <div style={{ padding: 32, color: "#ef4444" }}>Orchestrator offline</div>;

  const pct = s.sprint_completion_pct ?? 0;

  const stat = (label: string, value: unknown, color = "#1e293b") => (
    <div style={{ textAlign: "center", padding: "16px 20px",
      background: "#f8fafc", borderRadius: 10 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: String(color) }}>{String(value)}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📊 Project State</h1>
        <a href="/orchestrator" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back</a>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 24,
        border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{s.workspace_name} — {s.active_sprint}</span>
          <span style={{ fontWeight: 700, fontSize: 20, color: "#2563eb" }}>{pct}%</span>
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: 8, height: 16, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%",
            background: pct >= 80 ? "#059669" : "#2563eb", borderRadius: 8,
            transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
        {stat("Total", s.tasks_total)}
        {stat("Done", s.tasks_completed, "#059669")}
        {stat("Running", s.tasks_in_progress, "#2563eb")}
        {stat("Pending", s.tasks_pending, "#f59e0b")}
        {stat("Failed", s.tasks_failed, "#ef4444")}
        {stat("Blocked", s.tasks_blocked, "#8b5cf6")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>🌿 Git</h3>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div><span style={{ color: "#64748b" }}>Branch:</span> <code style={{ background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{s.current_branch}</code></div>
            <div><span style={{ color: "#64748b" }}>Commit:</span> <code style={{ background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{s.last_commit_hash}</code></div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{s.last_commit_message}</div>
            <div style={{ marginTop: 6, color: s.uncommitted_files?.length > 0 ? "#f59e0b" : "#059669", fontSize: 13 }}>
              {s.uncommitted_files?.length > 0 ? `⚠ ${s.uncommitted_files.length} uncommitted` : "✓ Clean"}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>⚡ Next Action</h3>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>
            {s.recommended_next_task_title || "Sprint complete"}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {s.recommended_next_reason}
          </div>
          {s.recommended_next_task_id && (
            <a href={`/orchestrator/run-task?task_id=${s.recommended_next_task_id}`}
              style={{ display: "inline-block", marginTop: 12, padding: "8px 16px",
                background: "#059669", color: "#fff", borderRadius: 8,
                textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              ▶ Run Now
            </a>
          )}
        </div>
      </div>

      {s.failing_tasks?.length > 0 && (
        <div style={{ background: "#fef2f2", borderRadius: 12, padding: 20,
          border: "1px solid #fecaca" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#991b1b" }}>❌ Failed Tasks</h3>
          {s.failing_tasks.map((t: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: "#991b1b", padding: "3px 0" }}>• {t}</div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8", textAlign: "right" }}>
        Snapshot at: {new Date(s.snapshot_at).toLocaleString()}
      </div>
    </div>
  );
}

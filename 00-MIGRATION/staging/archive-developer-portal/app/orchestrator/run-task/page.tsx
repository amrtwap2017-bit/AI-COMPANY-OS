"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ORCH = "http://127.0.0.1:8020";
const WS = "0d22ba37-30b0-46d9-844f-312ec5f9abc8";
const TB_ROOT = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black";

function RunTaskForm() {
  const params = useSearchParams();
  const [taskId, setTaskId] = useState(params.get("task_id") || "");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!taskId.trim()) return;
    setRunning(true);
    setResult(null);
    setError("");
    try {
      const r = await fetch(`${ORCH}/orchestrator/run/${WS}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          workspace_id: WS,
          workspace_root: TB_ROOT,
        }),
      });
      const data = await r.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>⚡ Run Pipeline</h1>
        <a href="/orchestrator" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back</a>
      </div>

      <form onSubmit={handleRun} style={{ background: "#fff", borderRadius: 12,
        padding: 24, border: "1px solid #e2e8f0", marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
            Task ID
          </label>
          <input
            value={taskId}
            onChange={e => setTaskId(e.target.value)}
            placeholder="Paste task UUID from /tasks page"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }}
          />
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            Get task IDs from <a href={`/tasks?ws=${WS}`} style={{ color: "#2563eb" }}>Tasks page</a>
          </div>
        </div>

        <button type="submit" disabled={running || !taskId.trim()}
          style={{ padding: "12px 24px", background: running ? "#94a3b8" : "#059669",
            color: "#fff", borderRadius: 8, border: "none", fontSize: 15,
            fontWeight: 700, cursor: running ? "not-allowed" : "pointer", width: "100%" }}>
          {running ? "⏳ Running Pipeline..." : "⚡ Run Full Pipeline"}
        </button>
      </form>

      {error && (
        <div style={{ background: "#fef2f2", borderRadius: 12, padding: 16,
          border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 24 }}>{result.ok ? "✅" : "❌"}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {result.ok ? "Pipeline Complete" : "Pipeline Failed"}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{result.task_title as string}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["Tests", result.test_ok ? "✓ Pass" : "✗ Fail", result.test_ok ? "#059669" : "#ef4444"],
              ["Review Score", result.review_score ? `${result.review_score}/100` : "N/A", "#2563eb"],
              ["Committed", result.commit_ok ? "✓ Yes" : "✗ No", result.commit_ok ? "#059669" : "#f59e0b"],
            ].map(([label, val, color]) => (
              <div key={String(label)} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                <div style={{ fontWeight: 700, color: String(color), fontSize: 16 }}>{String(val)}</div>
              </div>
            ))}
          </div>

          {Array.isArray(result.files_written) && result.files_written.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                Files Written ({(result.files_written as string[]).length})
              </div>
              {(result.files_written as string[]).map((f, i) => (
                <div key={i} style={{ fontSize: 13, color: "#1e293b", padding: "2px 0",
                  fontFamily: "monospace" }}>
                  📄 {f}
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Run group: {result.run_group as string} · {result.total_duration_ms as number}ms
          </div>
        </div>
      )}
    </div>
  );
}

export default function RunTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RunTaskForm />
    </Suspense>
  );
}

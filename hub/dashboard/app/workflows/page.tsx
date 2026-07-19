"use client";

import { useState, useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
const AI   = `${BASE}/api/v1/ai`;

const STATUS_COLOR: Record<string,string> = {
  completed:"#16a34a", running:"#2563eb", pending:"#ca8a04",
  failed:"#dc2626", planning:"#9333ea",
};
const STATUS_BG: Record<string,string> = {
  completed:"#dcfce7", running:"#dbeafe", pending:"#fef9c3",
  failed:"#fee2e2", planning:"#f3e8ff",
};

const TEMPLATES = [
  "code_review", "research_report", "feature_development",
  "document_analysis", "system_audit",
];

export default function WorkflowsPage() {
  const [workflows,  setWorkflows]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [running,    setRunning]    = useState(false);
  const [template,   setTemplate]   = useState("code_review");
  const [goal,       setGoal]       = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [result,     setResult]     = useState<any>(null);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${AI}/workflows`, { cache: "no-store" });
      const d = await r.json();
      setWorkflows(d.workflows ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadWorkflows(); }, []);

  const triggerWorkflow = async () => {
    if (!goal.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const r = await fetch(`${AI}/workflows/run/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, goal }),
      });
      const d = await r.json();
      setResult(d);
      await loadWorkflows();
    } catch (e) {
      setResult({ error: String(e) });
    }
    setRunning(false);
  };

  const completed = workflows.filter(w => w.status === "completed").length;
  const runningWF = workflows.filter(w => w.status === "running").length;
  const pending   = workflows.filter(w => w.status === "pending").length;
  const failed    = workflows.filter(w => w.status === "failed").length;

  return (
    <main style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>⚙️ Workflows</h1>
          <p style={{ color: "#64748b", marginTop: 4 }}>
            {workflows.length} total · {runningWF} running · {completed} completed · {failed} failed
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{
            background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 8, padding: "10px 18px",
            cursor: "pointer", fontWeight: 700, fontSize: 14,
          }}>
          {showForm ? "✕ Cancel" : "+ Trigger Workflow"}
        </button>
      </div>

      {/* Status row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Completed", value: completed, color: "#16a34a", bg: "#dcfce7" },
          { label: "Running",   value: runningWF, color: "#2563eb", bg: "#dbeafe" },
          { label: "Pending",   value: pending,   color: "#ca8a04", bg: "#fef9c3" },
          { label: "Failed",    value: failed,    color: "#dc2626", bg: "#fee2e2" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 10, padding: "8px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Trigger Form */}
      {showForm && (
        <div style={{
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 12, padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: "#0f172a" }}>🚀 Trigger New Workflow</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Template</label>
              <select value={template} onChange={e => setTemplate(e.target.value)}
                style={{
                  width: "100%", background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "8px 12px", fontSize: 13,
                }}>
                {TEMPLATES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: 300 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Goal</label>
              <input value={goal} onChange={e => setGoal(e.target.value)}
                placeholder="Describe what this workflow should accomplish…"
                style={{
                  width: "100%", background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <button onClick={triggerWorkflow} disabled={running || !goal.trim()}
            style={{
              background: running ? "#94a3b8" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 20px", cursor: running ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: 13,
            }}>
            {running ? "⏳ Running…" : "▶ Run Workflow"}
          </button>

          {result && (
            <div style={{
              marginTop: 12, background: result.error ? "#fee2e2" : "#dcfce7",
              border: `1px solid ${result.error ? "#dc2626" : "#16a34a"}33`,
              borderRadius: 8, padding: 12, fontSize: 13,
            }}>
              {result.error
                ? `❌ ${result.error}`
                : `✅ Workflow #${result.workflow_id} — ${result.status} (${result.task_count} tasks)`
              }
            </div>
          )}
        </div>
      )}

      {/* Workflow List */}
      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 48 }}>Loading workflows…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {workflows.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 48 }}>No workflows yet</div>
          )}
          {workflows.map((w: any) => {
            const pct = w.task_count > 0
              ? Math.round((w.completed_count / w.task_count) * 100) : 0;
            const color = STATUS_COLOR[w.status] ?? "#64748b";
            const bg    = STATUS_BG[w.status]    ?? "#f1f5f9";

            return (
              <div key={w.id} style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 12, padding: 20,
                borderLeft: `4px solid ${color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: "#94a3b8" }}>#{w.id}</span>
                      <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{w.name}</span>
                    </div>
                    {w.goal && (
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{w.goal}</div>
                    )}
                  </div>
                  <span style={{
                    background: bg, color, fontSize: 11, fontWeight: 700,
                    padding: "4px 12px", borderRadius: 99, textTransform: "uppercase",
                    flexShrink: 0, marginLeft: 12,
                  }}>{w.status}</span>
                </div>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                  <span>📋 {w.task_count ?? 0} tasks</span>
                  <span style={{ color: "#16a34a" }}>✅ {w.completed_count ?? 0} done</span>
                  {(w.failed_count ?? 0) > 0 && <span style={{ color: "#dc2626" }}>❌ {w.failed_count} failed</span>}
                  {w.duration_seconds > 0 && <span>⏱ {w.duration_seconds.toFixed(1)}s</span>}
                </div>

                {w.task_count > 0 && (
                  <div>
                    <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: color, borderRadius: 3,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{pct}% complete</div>
                  </div>
                )}

                {w.summary && (
                  <div style={{
                    marginTop: 10, fontSize: 12, color: "#475569",
                    background: "#f8fafc", borderRadius: 6, padding: "6px 10px",
                  }}>
                    {w.summary}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

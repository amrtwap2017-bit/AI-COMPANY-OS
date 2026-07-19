export const dynamic = "force-dynamic";

const ORCH = process.env.NEXT_PUBLIC_ORCH_API_BASE_URL || "http://127.0.0.1:8020";
const WS = "0d22ba37-30b0-46d9-844f-312ec5f9abc8";

async function getKnowledge() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/knowledge/${WS}`, { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function getMemory() {
  try {
    const r = await fetch(`${ORCH}/orchestrator/memory/${WS}`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  } catch { return []; }
}

export default async function MemoryPage() {
  const [knowledge, memories] = await Promise.all([getKnowledge(), getMemory()]);

  const typeColor: Record<string, string> = {
    architecture: "#2563eb",
    decision: "#7c3aed",
    failure: "#ef4444",
    learning: "#059669",
    execution: "#f59e0b",
    project_state: "#64748b",
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>🧠 Institutional Knowledge</h1>
        <a href="/orchestrator" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back</a>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 24,
        border: "1px solid #e2e8f0", marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>Recent Memories</h2>
        {Array.isArray(memories) && memories.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memories.slice(0, 20).map((m: Record<string, unknown>, i: number) => (
              <div key={i} style={{ borderLeft: `3px solid ${typeColor[String(m.type)] || "#94a3b8"}`,
                paddingLeft: 16, paddingBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{
                    background: typeColor[String(m.type)] || "#94a3b8",
                    color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600
                  }}>{String(m.type)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{String(m.subject)}</span>
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>{String(m.content)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  {m.created_at ? new Date(String(m.created_at)).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: 14 }}>
            No memories yet. Run pipelines to accumulate knowledge.
          </div>
        )}
      </div>

      {knowledge?.document && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>Full Knowledge Document</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "ui-sans-serif",
            fontSize: 13, lineHeight: 1.7, color: "#1e293b", margin: 0 }}>
            {knowledge.document}
          </pre>
        </div>
      )}
    </div>
  );
}

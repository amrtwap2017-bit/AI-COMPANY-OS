export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function getMemories() {
  try {
    const r = await fetch(`${BASE}/api/v1/ai/memory/ceo`, { cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d.memories ?? []);
  } catch { return []; }
}

async function getReflections() {
  try {
    const r = await fetch(`${BASE}/api/v1/ai/reflections`, { cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d.reflections ?? []);
  } catch { return []; }
}

const TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  config:      { color: "#2563eb", bg: "#dbeafe", icon: "⚙️" },
  rule:        { color: "#dc2626", bg: "#fee2e2", icon: "📏" },
  context:     { color: "#0891b2", bg: "#e0f2fe", icon: "🌐" },
  milestone:   { color: "#16a34a", bg: "#dcfce7", icon: "🏆" },
  session:     { color: "#9333ea", bg: "#f3e8ff", icon: "💬" },
  learning:    { color: "#d97706", bg: "#fef9c3", icon: "💡" },
  decision:    { color: "#0f766e", bg: "#ccfbf1", icon: "⚖️" },
};
const DEFAULT_META = { color: "#6366f1", bg: "#eef2ff", icon: "🧠" };

const SPEED_COLOR: Record<string, string> = {
  fast: "#16a34a", normal: "#2563eb", slow: "#dc2626",
};

export default async function MemoryPage() {
  const [memories, reflections] = await Promise.all([getMemories(), getReflections()]);

  const byType: Record<string, any[]> = {};
  memories.forEach((m: any) => {
    const t = m.memory_type ?? m.type ?? "other";
    if (!byType[t]) byType[t] = [];
    byType[t].push(m);
  });

  return (
    <div style={{ maxWidth: 1100, padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          🧠 Agent Memory
        </h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>
          {memories.length} memories · {Object.keys(byType).length} types ·{" "}
          {reflections.length} reflections
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {Object.entries(byType).map(([type, items]) => {
          const meta = TYPE_META[type] ?? DEFAULT_META;
          return (
            <div key={type} style={{
              background: meta.bg, border: `1px solid ${meta.color}33`,
              borderRadius: 10, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>{meta.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: meta.color }}>{items.length}</div>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{type}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Memories by Type */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
            📚 Memory Entries
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {memories.length === 0 ? (
              <div style={{ color: "#94a3b8", padding: 24, textAlign: "center" }}>
                No memories yet
              </div>
            ) : memories.slice(0, 15).map((m: any, i: number) => {
              const type = m.memory_type ?? m.type ?? "other";
              const meta = TYPE_META[type] ?? DEFAULT_META;
              return (
                <div key={m.id ?? i} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: 8, padding: "12px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{
                      background: meta.bg, color: meta.color,
                      fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 99,
                    }}>
                      {meta.icon} {type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {String(m.created_at ?? "").slice(0, 16).replace("T", " ")}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>
                    {String(m.content ?? "").slice(0, 150)}
                    {String(m.content ?? "").length > 150 ? "…" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reflections */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
            🔍 Agent Reflections
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reflections.length === 0 ? (
              <div style={{ color: "#94a3b8", padding: 24, textAlign: "center" }}>
                No reflections yet
              </div>
            ) : reflections.map((r: any, i: number) => {
              const score = Number(r.quality_score ?? 0);
              const speedColor = SPEED_COLOR[r.speed_rating ?? "normal"] ?? "#6366f1";
              return (
                <div key={r.id ?? i} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "12px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                      {r.agent_name ?? "Agent"}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{
                        background: speedColor + "22", color: speedColor,
                        fontSize: 10, fontWeight: 700,
                        padding: "1px 6px", borderRadius: 99,
                      }}>{r.speed_rating ?? "normal"}</span>
                      <span style={{
                        background: "#dcfce7", color: "#16a34a",
                        fontSize: 10, fontWeight: 700,
                        padding: "1px 6px", borderRadius: 99,
                      }}>★ {score.toFixed(1)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                    {r.model_used ?? ""}
                  </div>
                  <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                    {String(r.task ?? "").slice(0, 120)}
                  </div>
                  {/* Quality bar */}
                  <div style={{
                    marginTop: 8, height: 4, background: "#e2e8f0",
                    borderRadius: 2, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${Math.min(score / 10 * 100, 100)}%`,
                      height: "100%", background: "#16a34a", borderRadius: 2,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

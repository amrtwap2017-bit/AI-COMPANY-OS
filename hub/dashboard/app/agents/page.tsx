export const dynamic = "force-dynamic";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function getData() {
  try {
    const [agentsRes, tasksRes, reflectionsRes] = await Promise.all([
      fetch(`${BASE}/api/v1/ai/agents`,      { cache: "no-store" }),
      fetch(`${BASE}/api/v1/ai/tasks`,       { cache: "no-store" }),
      fetch(`${BASE}/api/v1/ai/reflections`, { cache: "no-store" }),
    ]);
    const agents = await agentsRes.json();
    const tasks  = await tasksRes.json();
    const refs   = await reflectionsRes.json();
    return {
      agents:      agents.agents      ?? [],
      tasks:       tasks.tasks        ?? [],
      reflections: refs.reflections   ?? [],
    };
  } catch { return { agents: [], tasks: [], reflections: [] }; }
}

const ROLE_META: Record<string, { icon: string; color: string; skill: string; }> = {
  "ceo agent":        { icon: "👔", color: "#7c3aed", skill: "Strategy + Business" },
  "cto agent":        { icon: "🔬", color: "#2563eb", skill: "Technical Leadership" },
  "architect agent":  { icon: "🏗️", color: "#0891b2", skill: "System Design + SOLID" },
  "backend agent":    { icon: "⚙️", color: "#059669", skill: "FastAPI + PostgreSQL" },
  "frontend agent":   { icon: "🎨", color: "#d97706", skill: "Next.js + TypeScript" },
  "devops agent":     { icon: "🚀", color: "#dc2626", skill: "Docker + WSL2" },
  "tester agent":     { icon: "🧪", color: "#7c3aed", skill: "QA + Coverage" },
  "reviewer agent":   { icon: "🔍", color: "#0891b2", skill: "Code Review + CRITICAL/WARNING" },
  "prompt engineer":  { icon: "✍️", color: "#db2777", skill: "LLM Prompt Design" },
  "evaluator agent":  { icon: "📊", color: "#ea580c", skill: "Performance Benchmarking" },
};

const DEFAULT_META = { icon: "🤖", color: "#6366f1", skill: "AI Agent" };

export default async function AgentsPage() {
  const { agents, tasks, reflections } = await getData();

  // Agents from DB are objects: {id, name, description}
  const agentList = Array.isArray(agents) ? agents : [];

  return (
    <main style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          🤖 AI Agents
        </h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>
          {agentList.length} agents · {tasks.length} tasks · {reflections.length} reflections ·{" "}
          <span style={{ color: "#16a34a", fontWeight: 600 }}>RAG + role-grounded</span>
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}>
        {agentList.map((agent: any) => {
          const name = typeof agent === "string" ? agent : (agent.name ?? "unknown");
          const desc = typeof agent === "object" ? (agent.description ?? "") : "";
          const nameKey = name.toLowerCase();

          const meta = ROLE_META[nameKey] ?? DEFAULT_META;

          // Match tasks by assigned_agent name
          const agentTasks = (tasks as any[]).filter((t: any) => {
            const aa = (t.assigned_agent ?? "").toLowerCase();
            return aa === nameKey || aa.includes(nameKey.split(" ")[0]);
          });

          // Match reflections
          const agentRefs = (reflections as any[]).filter((r: any) => {
            const rn = (r.agent_name ?? "").toLowerCase();
            return rn === nameKey || rn.includes(nameKey.split(" ")[0]);
          });

          const bestScore = agentRefs.length > 0
            ? Math.max(...agentRefs.map((r: any) => Number(r.quality_score ?? 0)))
            : null;

          const completedTasks = agentTasks.filter((t: any) =>
            ["completed", "done"].includes(t.status ?? "")
          ).length;

          return (
            <div key={name} style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e2e8f0",
              borderTop: `4px solid ${meta.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: meta.color + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", textTransform: "capitalize", fontSize: 15 }}>
                    {name.replace(/_/g, " ")}
                  </div>
                  <div style={{
                    fontSize: 11, color: meta.color, fontWeight: 600,
                    marginTop: 2,
                  }}>
                    {meta.skill}
                  </div>
                  {desc && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, lineHeight: 1.4 }}>
                      {desc.slice(0, 60)}{desc.length > 60 ? "…" : ""}
                    </div>
                  )}
                </div>
                <span style={{
                  background: "#dcfce7", color: "#16a34a",
                  fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 99, flexShrink: 0,
                }}>● active</span>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "tasks", value: agentTasks.length, color: meta.color },
                  { label: "done",  value: completedTasks,    color: "#16a34a" },
                  { label: "refs",  value: agentRefs.length,  color: "#8b5cf6" },
                ].map(s => (
                  <div key={s.label} style={{
                    flex: 1, background: "#f8fafc", borderRadius: 8,
                    padding: "8px 0", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quality Score */}
              {bestScore !== null && (
                <div style={{
                  background: "#f8fafc", borderRadius: 8, padding: "8px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Quality Score</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 60, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${Math.min(bestScore / 10 * 100, 100)}%`,
                        height: "100%", background: meta.color, borderRadius: 3,
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                      {bestScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

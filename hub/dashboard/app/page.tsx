export const dynamic = "force-dynamic";

const AI = "http://127.0.0.1:8001/api/v1/ai";
const TB = "http://127.0.0.1:8030/api/v1";

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try { return await fn(); } catch { return fb; }
}

export default async function Dashboard() {
  const [summary, leads, workOrders, workflows] = await Promise.all([
    safe(() => fetch(`${AI}/analytics/summary`, { cache: "no-store" }).then(r => r.json()), {}),
    safe(() => fetch(`${TB}/leads/`, { cache: "no-store" }).then(r => r.json()), []),
    safe(() => fetch(`${TB}/work-orders/`, { cache: "no-store" }).then(r => r.json()), []),
    safe(() => fetch(`${AI}/workflows`, { cache: "no-store" }).then(r => r.json()), {}),
  ]);

  const s = summary as any;
  const leadArr = Array.isArray(leads) ? leads : [];
  const woArr   = Array.isArray(workOrders) ? workOrders : [];
  const wfList  = (workflows as any)?.workflows ?? [];

  const KPI = ({ label, value, sub, color }: any) => (
    <div style={{
      background: "#0f172a", border: "1px solid #1e293b",
      borderTop: `3px solid ${color}`,
      borderRadius: 12, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>{sub}</div>}
    </div>
  );

  const STATUS_DOT: Record<string, string> = {
    completed: "#16a34a", running: "#2563eb", pending: "#d97706",
    failed: "#dc2626", qualified: "#16a34a", new: "#3b82f6",
    negotiation: "#d97706",
  };

  return (
    <div style={{ maxWidth: 1200, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
            AI Company OS
          </h1>
          <p style={{ color: "#475569", marginTop: 4, fontSize: 14 }}>
            v2.0.0 · {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Engine", url: "http://localhost:8001/api/v1/ai/health", color: "#16a34a" },
            { label: "TB Admin", url: "http://localhost:8030/api/health", color: "#2563eb" },
          ].map(s => (
            <span key={s.label} style={{
              background: s.color + "15", color: s.color,
              border: `1px solid ${s.color}30`,
              borderRadius: 99, padding: "4px 10px", fontSize: 11, fontWeight: 700,
            }}>● {s.label}</span>
          ))}
        </div>
      </div>

      {/* AI Engine KPIs */}
      <div>
        <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", marginBottom: 12 }}>🤖 AI Engine</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          <KPI label="Agents"        value={s.total_agents ?? 0}        sub={`${s.active_agents ?? 0} active`}   color="#6366f1" />
          <KPI label="Tasks"         value={s.total_tasks ?? 0}          sub={`${s.tasks_completed ?? 0} done`}   color="#16a34a" />
          <KPI label="Workflows"     value={s.total_workflows ?? 0}      sub="sessions"                           color="#2563eb" />
          <KPI label="Chats"         value={s.total_conversations ?? 0}  sub="conversations"                      color="#0891b2" />
          <KPI label="Memories"      value={s.total_memories ?? 0}       sub="agent decisions"                    color="#8b5cf6" />
          <KPI label="Knowledge"     value={s.total_knowledge_docs ?? 0} sub="docs + skills"                      color="#ec4899" />
          <KPI label="Reflections"   value={s.total_reflections ?? 0}    sub="quality reviews"                    color="#f59e0b" />
          <KPI label="Events"        value={s.total_events ?? 0}         sub="platform events"                    color="#06b6d4" />
        </div>
      </div>

      {/* Task Breakdown */}
      {(s.total_tasks ?? 0) > 0 && (
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>📋 Task Status</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { label: "Pending",   value: s.tasks_pending   ?? 0, color: "#d97706", bg: "#fef9c322" },
              { label: "Running",   value: s.tasks_running   ?? 0, color: "#2563eb", bg: "#dbeafe22" },
              { label: "Completed", value: s.tasks_completed ?? 0, color: "#16a34a", bg: "#dcfce722" },
              { label: "Failed",    value: s.tasks_failed    ?? 0, color: "#dc2626", bg: "#fee2e222" },
            ].map(t => (
              <div key={t.label} style={{
                background: t.bg, border: `1px solid ${t.color}30`,
                borderRadius: 8, padding: "8px 16px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: t.color }}>{t.value}</span>
                <span style={{ fontSize: 12, color: t.color }}>{t.label}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden", display: "flex" }}>
            {[
              { v: s.tasks_completed, c: "#16a34a" },
              { v: s.tasks_running,   c: "#2563eb" },
              { v: s.tasks_pending,   c: "#d97706" },
              { v: s.tasks_failed,    c: "#dc2626" },
            ].map((t, i) => (
              <div key={i} style={{
                width: `${((t.v ?? 0) / (s.total_tasks ?? 1)) * 100}%`,
                background: t.c, height: "100%",
              }} />
            ))}
          </div>
        </div>
      )}

      {/* TB + Workflows grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Triangle Black */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#f1f5f9" }}>🏨 Triangle Black</div>
            <a href="http://localhost:3001" target="_blank"
              style={{ fontSize: 11, color: "#6366f1" }}>Open Portal ↗</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Leads",       value: leadArr.length, color: "#3b82f6" },
              { label: "Work Orders", value: woArr.length,   color: "#8b5cf6" },
            ].map(k => (
              <div key={k.label} style={{
                background: "#1e293b", borderRadius: 8, padding: "12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{k.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {leadArr.slice(0, 3).map((l: any) => (
              <div key={l.id} style={{
                display: "flex", justifyContent: "space-between",
                background: "#1e293b", borderRadius: 8, padding: "8px 12px",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                  {l.name || l.company_name || `Lead #${l.id}`}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: (STATUS_DOT[l.status] ?? "#6366f1") + "20",
                  color: STATUS_DOT[l.status] ?? "#6366f1",
                }}>
                  {l.status ?? "new"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Workflows */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
            ⚙️ Recent Workflows
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {wfList.slice(0, 5).map((w: any) => {
              const c = STATUS_DOT[w.status] ?? "#475569";
              const pct = w.task_count > 0
                ? Math.round((w.completed_count / w.task_count) * 100) : 0;
              return (
                <div key={w.id} style={{
                  background: "#1e293b", borderRadius: 8,
                  padding: "10px 12px",
                  borderLeft: `3px solid ${c}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#475569" }}>#{w.id} </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{w.name}</span>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 99, background: c + "20", color: c,
                    }}>{w.status}</span>
                  </div>
                  {w.task_count > 0 && (
                    <div style={{ height: 4, background: "#334155", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, background: c, height: "100%" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>⚡ Quick Actions</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "💬 Open Chat",        href: "/chat" },
            { label: "🤖 View Agents",      href: "/agents" },
            { label: "📊 Analytics",        href: "/analytics" },
            { label: "⚙️ Trigger Workflow", href: "/workflows" },
            { label: "🏨 TB Dashboard",     href: "/triangle-black" },
            { label: "📚 Knowledge",        href: "/knowledge" },
            { label: "🧠 Memory",           href: "/memory" },
          ].map(a => (
            <a key={a.href} href={a.href}
              style={{
                background: "#1e293b", border: "1px solid #334155",
                borderRadius: 8, padding: "8px 16px",
                color: "#94a3b8", fontSize: 13, fontWeight: 500,
                textDecoration: "none", transition: "all 0.15s",
              }}>
              {a.label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

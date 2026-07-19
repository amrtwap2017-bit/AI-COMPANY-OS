export const dynamic = "force-dynamic";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function getData() {
  try {
    const res = await fetch(`${BASE}/api/v1/ai/tasks`, { cache: "no-store" });
    const d = await res.json();
    return d.tasks ?? [];
  } catch { return []; }
}

const STATUS_STYLE: Record<string,{bg:string,color:string,label:string}> = {
  completed:   { bg: "#dcfce7", color: "#16a34a", label: "✓ Completed"  },
  in_progress: { bg: "#dbeafe", color: "#2563eb", label: "⟳ In Progress"},
  pending:     { bg: "#fef9c3", color: "#ca8a04", label: "◷ Pending"    },
  failed:      { bg: "#fee2e2", color: "#dc2626", label: "✗ Failed"     },
};

export default async function TasksPage() {
  const tasks = await getData();
  const completed   = tasks.filter((t:any) => t.status === "completed").length;
  const in_progress = tasks.filter((t:any) => t.status === "in_progress").length;
  const pending     = tasks.filter((t:any) => t.status === "pending").length;

  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>📋 Tasks</h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>{tasks.length} total tasks</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Completed",   value: completed,   color: "#16a34a", bg: "#dcfce7" },
          { label: "In Progress", value: in_progress, color: "#2563eb", bg: "#dbeafe" },
          { label: "Pending",     value: pending,     color: "#ca8a04", bg: "#fef9c3" },
        ].map(k => (
          <div key={k.label} style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 12, padding: "16px 20px",
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.length === 0 && (
          <div style={{ textAlign:"center", color:"#94a3b8", padding:48 }}>No tasks yet</div>
        )}
        {tasks.map((t: any) => {
          const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.pending;
          return (
            <div key={t.id} style={{
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{
                background: s.bg, color: s.color,
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 99, whiteSpace: "nowrap", minWidth: 90, textAlign: "center"
              }}>{s.label}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>{t.title}</div>
                {t.assigned_agent && (
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    → {t.assigned_agent.replace(/_/g," ")} · {t.task_type ?? "task"}
                  </div>
                )}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11 }}>
                {t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

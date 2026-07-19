import { hubGet } from "@/lib/hub";

type Task = {
  id: string; title: string; type: string; status: string;
  priority: string; assigned_agent: string; model_hint: string; run_group: string;
};

const STATUS_COLS = ["pending","planning","assigned","executing","done","failed"];
const STATUS_COLORS: Record<string,string> = {
  pending:"#f1f5f9", planning:"#fef9c3", assigned:"#ede9fe",
  executing:"#dbeafe", done:"#dcfce7", failed:"#fee2e2",
};
const STATUS_BADGE: Record<string,string> = {
  pending:"#64748b", planning:"#ca8a04", assigned:"#7c3aed",
  executing:"#2563eb", done:"#16a34a", failed:"#dc2626",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const params = await searchParams;
  const wsId = params.ws || "0d22ba37-30b0-46d9-844f-312ec5f9abc8";
  const data = await hubGet<{ tasks: Task[] }>(
    `/workspaces/${wsId}/tasks?limit=200`,
    { tasks: [] }
  );
  const tasks = data?.tasks || [];

  const grouped: Record<string,Task[]> = {};
  STATUS_COLS.forEach((s) => (grouped[s] = []));
  tasks.forEach((t) => {
    const col = STATUS_COLS.includes(t.status) ? t.status : "pending";
    grouped[col].push(t);
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Task Board</h1>
      <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
        {tasks.length} tasks · workspace: {wsId.slice(0,8)}…
      </p>
      <div style={{ marginTop: 16, display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
        {STATUS_COLS.map((status) => (
          <div key={status} style={{
            minWidth: 200, background: STATUS_COLORS[status] || "#f8fafc",
            borderRadius: 10, padding: 10, flexShrink: 0,
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: STATUS_BADGE[status], marginBottom: 8 }}>
              {status.toUpperCase()} ({grouped[status].length})
            </div>
            {grouped[status].map((t) => (
              <div key={t.id} style={{
                background: "#fff", borderRadius: 8,
                padding: 10, marginBottom: 8, fontSize: 12,
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ color: "#64748b", marginTop: 4 }}>{t.type} · {t.priority}</div>
                {t.assigned_agent && (
                  <div style={{ color: "#3b82f6", marginTop: 2 }}>→ {t.assigned_agent}</div>
                )}
              </div>
            ))}
            {grouped[status].length === 0 && (
              <div style={{ color: "#94a3b8", fontSize: 11 }}>empty</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
